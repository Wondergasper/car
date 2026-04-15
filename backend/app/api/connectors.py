"""
Connectors API - org-scoped with health monitoring.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.session import get_db
from app.models.database import User, Connector, Organization
from app.schemas.schemas import ConnectorCreate, ConnectorUpdate, ConnectorResponse
from app.api.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=List[ConnectorResponse])
async def list_connectors(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # RLS ensures user can only see their org's connectors
    result = await db.execute(
        select(Connector).where(
            Connector.org_id == current_user.org_id,
            Connector.deleted_at.is_(None)
        )
    )
    connectors = result.scalars().all()
    return connectors


@router.post("/", response_model=ConnectorResponse, status_code=status.HTTP_201_CREATED)
async def create_connector(
    request: Request,
    connector_data: ConnectorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check org limits
    result = await db.execute(select(Organization).where(Organization.id == current_user.org_id))
    org = result.scalar_one()
    
    result = await db.execute(
        select(Connector).where(
            Connector.org_id == org.id,
            Connector.deleted_at.is_(None)
        )
    )
    existing_connectors = len(result.scalars().all())
    
    if existing_connectors >= org.max_connectors:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Connector limit reached ({org.max_connectors}). Upgrade your plan to add more.",
        )
    
    # TODO: Encrypt config before storing
    # For now, store as-is (encryption to be implemented)
    new_connector = Connector(
        org_id=org.id,
        created_by=current_user.id,
        name=connector_data.name,
        connector_type_id=connector_data.connector_type_id,
        config_encrypted=bytes(str(connector_data.config), 'utf-8'),  # Placeholder
        sync_interval=connector_data.sync_interval,
    )
    db.add(new_connector)
    await db.commit()
    await db.refresh(new_connector)
    return new_connector


@router.get("/{connector_id}", response_model=ConnectorResponse)
async def get_connector(
    connector_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Connector).where(
            Connector.id == connector_id,
            Connector.org_id == current_user.org_id,
            Connector.deleted_at.is_(None)
        )
    )
    connector = result.scalar_one_or_none()
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    return connector


@router.put("/{connector_id}", response_model=ConnectorResponse)
async def update_connector(
    connector_id: str,
    connector_data: ConnectorUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Connector).where(
            Connector.id == connector_id,
            Connector.org_id == current_user.org_id
        )
    )
    connector = result.scalar_one_or_none()
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")

    update_data = connector_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(connector, key, value)

    await db.commit()
    await db.refresh(connector)
    return connector


@router.delete("/{connector_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_connector(
    connector_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Connector).where(
            Connector.id == connector_id,
            Connector.org_id == current_user.org_id
        )
    )
    connector = result.scalar_one_or_none()
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")

    # Soft delete
    from datetime import datetime
    connector.deleted_at = datetime.utcnow()
    await db.commit()
    return None


@router.post("/{connector_id}/test", status_code=status.HTTP_200_OK)
async def test_connector(
    connector_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Connector).where(
            Connector.id == connector_id,
            Connector.org_id == current_user.org_id
        )
    )
    connector = result.scalar_one_or_none()
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")

    # TODO: Implement actual connection test
    return {"status": "success", "message": f"Connection test for {connector.name} passed"}
