# CAR-Bot - Compliance Audit & Reporting Bot

Automated compliance audit and reporting system based on NDPA 2023 (Nigeria Data Protection Act).

## What Does This Application Do?

**CAR-Bot helps companies comply with Nigeria's Data Protection Act 2023 by:**

1. **Connecting** to their data sources (databases, APIs, internal systems)
2. **Automatically auditing** their data handling against NDPA 2023 regulations
3. **Finding compliance issues** (missing consent records, unencrypted data, weak access controls, etc.)
4. **Generating official CAR PDF reports** ready for regulatory filing
5. **Monitoring continuously** - not just annual audits

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Frontend (Next.js)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Dashboard│  │Connectors│  │DocumentStudio│  │
│  └──────────┘  └──────────┘  └──────────────┘  │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│              Backend (FastAPI)                   │
│  ┌────────┐  ┌─────────────┐  ┌──────────────┐ │
│  │Auth API│  │Rules Engine │  │Webhook Events│ │
│  └────────┘  └─────────────┘  └──────────────┘ │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│           PostgreSQL Database                    │
│  Users, Connectors, Audits, Findings, Rules     │
└──────────────────────────────────────────────────┘
```

## Tech Stack

### Frontend
- Next.js 14 (React)
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Recharts (Charts)
- Lucide Icons

### Backend
- FastAPI (Python)
- SQLAlchemy (Async)
- PostgreSQL
- ReportLab (PDF Generation)

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

### Quick Start

1. **Install PostgreSQL** and create a database:
```sql
CREATE DATABASE carbot;
CREATE USER carbot WITH PASSWORD 'carbot_password';
GRANT ALL PRIVILEGES ON DATABASE carbot TO carbot;
```

2. **Start Backend:**
```bash
# Windows - double click:
start-backend.bat

# Or manually:
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload --port 8000
```

3. **Start Frontend:**
```bash
# Windows - double click:
start-frontend.bat

# Or manually:
npm install
npm run dev
```

4. **Access the App:**
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

## How It Works

### 1. Company Signs Up
A compliance officer creates an account for their company.

### 2. Connect Data Sources
The company connects their databases (customer records, HR systems, transaction logs) via the connector interface.

### 3. Continuous Audit
CAR-Bot continuously monitors connected systems against 14 NDPA 2023 rules:

| Rule | Checks |
|------|--------|
| Consent Management | Are consent records being kept? |
| Data Minimization | Only necessary data collected? |
| Encryption | Data encrypted at rest and in transit? |
| Access Controls | Who can access personal data? |
| Data Retention | Old data being deleted properly? |
| Breach Notification | Can breaches be reported within 72 hours? |
| ... and 8 more rules |

### 4. Generate Reports
When needed, generate a CAR PDF report showing:
- Overall compliance score (0-100%)
- Detailed findings by severity
- Recommendations for each issue
- Ready for submission to NDPC (regulator)

### 5. Fix Issues
Use Document Studio to:
- Review AI-suggested fixes
- Accept or modify recommendations
- Track progress toward full compliance

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new company
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile

### Connectors
- `GET /api/connectors` - List all connectors
- `POST /api/connectors` - Create new connector
- `PUT /api/connectors/{id}` - Update connector
- `DELETE /api/connectors/{id}` - Delete connector
- `POST /api/connectors/{id}/test` - Test connection

### Audits
- `GET /api/audits` - List all audits
- `GET /api/audits/{id}` - Get audit details
- `POST /api/audits/generate` - Generate new audit
- `GET /api/audits/{id}/download` - Download CAR PDF

### Rules
- `GET /api/rules` - List all compliance rules

## Project Structure

```
car-bot/
├── app/                    # Frontend (Next.js)
│   ├── page.tsx           # Landing page
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── dashboard/         # Dashboard pages
├── components/            # React components
├── lib/                   # API client, store
├── backend/               # Backend (FastAPI)
│   ├── main.py           # FastAPI entry point
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── core/         # Config, security, rules engine
│   │   ├── db/           # Database session
│   │   ├── models/       # SQLAlchemy models
│   │   └── schemas/      # Pydantic schemas
│   └── connector_sdk.py  # Connector SDK
└── README.md
```

## Connector SDK

Companies can integrate their systems using our SDK:

```python
from connector_sdk import CARBotConnector

connector = CARBotConnector(
    api_url="http://localhost:8000",
    api_key="your-api-key",
    connector_id="your-connector-id"
)

# Send data for audit
connector.send_data_event(
    event_type="data_update",
    payload={"table": "customers", "data": {...}}
)
```

## License

Proprietary - CAR-Bot © 2026
