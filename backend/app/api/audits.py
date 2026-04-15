"""
Audits API - org-scoped with detailed tracking.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime, timedelta
from app.db.session import get_db
from app.models.database import User, Audit, Finding, Organization
from app.schemas.schemas import AuditGenerate, AuditResponse, FindingResponse
from app.api.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=List[AuditResponse])
async def list_audits(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Audit)
        .where(Audit.org_id == current_user.org_id)
        .order_by(Audit.created_at.desc())
    )
    audits = result.scalars().all()
    return audits


@router.get("/{audit_id}", response_model=AuditResponse)
async def get_audit(
    audit_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Audit).where(
            Audit.id == audit_id,
            Audit.org_id == current_user.org_id
        )
    )
    audit = result.scalar_one_or_none()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    return audit


@router.get("/{audit_id}/findings", response_model=List[FindingResponse])
async def get_audit_findings(
    audit_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Audit).where(
            Audit.id == audit_id,
            Audit.org_id == current_user.org_id
        )
    )
    audit = result.scalar_one_or_none()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    findings_result = await db.execute(
        select(Finding).where(Finding.audit_id == audit_id)
    )
    return findings_result.scalars().all()


@router.post("/generate", response_model=AuditResponse, status_code=status.HTTP_202_ACCEPTED)
async def generate_audit(
    audit_data: AuditGenerate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check org limits
    result = await db.execute(select(Organization).where(Organization.id == current_user.org_id))
    org = result.scalar_one()
    
    result = await db.execute(
        select(Audit).where(
            Audit.org_id == org.id,
            Audit.created_at >= func.now() - timedelta(days=30)
        )
    )
    monthly_audits = len(result.scalars().all())
    
    if monthly_audits >= org.max_monthly_audits:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Monthly audit limit reached ({org.max_monthly_audits}). Upgrade your plan.",
        )
    
    # Create new audit
    audit_name = audit_data.name or f"Compliance Audit - {org.name}"
    new_audit = Audit(
        org_id=org.id,
        initiated_by=current_user.id,
        name=audit_name,
        audit_type=audit_data.audit_type,
        scope=audit_data.scope,
        status="pending",
    )
    db.add(new_audit)
    await db.commit()
    await db.refresh(new_audit)

    # TODO: Trigger audit process via Celery task
    return new_audit


@router.get("/{audit_id}/download", status_code=status.HTTP_200_OK)
async def download_audit_report(
    audit_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Audit).where(
            Audit.id == audit_id,
            Audit.org_id == current_user.org_id
        )
    )
    audit = result.scalar_one_or_none()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    if not audit.report_storage_key:
        raise HTTPException(status_code=404, detail="Report not available")

    # TODO: Return presigned URL from object storage
    return {"download_url": f"/storage/{audit.report_storage_key}"}
