# Quick Start Guide

## Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+ (optional, for future async tasks)

## Setup

### 1. Install PostgreSQL

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- During installation, remember the password you set for the `postgres` user

**Or use Docker (if preferred later):**
```bash
docker run --name carbot-postgres -e POSTGRES_PASSWORD=carbot_password -e POSTGRES_DB=carbot -p 5432:5432 -d postgres:15
```

### 2. Create Database

Open PostgreSQL command line (psql) or any PostgreSQL client and run:

```sql
CREATE DATABASE carbot;
CREATE USER carbot WITH PASSWORD 'carbot_password';
GRANT ALL PRIVILEGES ON DATABASE carbot TO carbot;
```

### 3. Start Backend

```bash
# Windows - double click:
start-backend.bat

# Or manually:
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Edit .env with your database credentials
uvicorn main:app --reload --port 8000
```

### 4. Start Frontend

```bash
# Windows - double click:
start-frontend.bat

# Or manually:
npm install
npm run dev
```

### 5. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

## What CAR-Bot Does

### **Problem It Solves:**
Companies in Nigeria need to comply with the **Nigeria Data Protection Act 2023 (NDPA 2023)**. This law has 47+ articles about how to handle personal data properly. Manual compliance audits are expensive and slow.

### **Solution:**
CAR-Bot automatically:

1. **Connects** to your data sources (databases, APIs, internal systems)
2. **Audits** your data handling practices against NDPA 2023 rules
3. **Finds** compliance issues (like missing consent records, unencrypted data, etc.)
4. **Generates** official CAR (Compliance Audit Report) PDFs
5. **Monitors** continuously, not just once a year

### **Who Uses It:**

**Companies (Clients):**
- Banks, hospitals, telecoms, any company handling Nigerian personal data
- Log in, connect their databases, see compliance score, download reports

**CAR-Bot Operators:**
- Compliance firms, consultants, regulatory bodies
- Offer "Compliance as a Service" to multiple companies

### **Key Features:**

1. **Dashboard** - Shows compliance score (like a credit score for data privacy)
2. **Connectors** - Links to client databases (PostgreSQL, MongoDB, REST APIs)
3. **Audit Reports** - Auto-generated PDF reports with findings
4. **Document Studio** - Review AI-suggested fixes for compliance issues
5. **Rules Engine** - 14 NDPA 2023 rules checking:
   - Consent management
   - Data encryption
   - Access controls
   - Data retention
   - Breach notification
   - Data subject rights

### **Simple Example:**

```
Bank "NaijaTrust Bank" → Signs up for CAR-Bot
                        ↓
                    Connects customer database
                        ↓
                    CAR-Bot finds 23 issues:
                    - No consent records for 5000 customers
                    - Database not encrypted
                    - No breach notification process
                        ↓
                    Generates CAR Report PDF
                        ↓
                    Bank fixes issues, re-audits
                        ↓
                    Compliance score: 87% ✓
```

## Troubleshooting

### Backend won't start
- Is PostgreSQL running?
- Check database credentials in `backend/.env`
- Is port 8000 available?

### Frontend won't start
- Is Node.js installed? Run: `node --version`
- Try: `rm -rf node_modules && npm install`
- Is port 3000 available?

### Database connection errors
- Verify PostgreSQL is running
- Check credentials in `backend/.env` match what you created
- Ensure the `carbot` database exists

## Development Commands

### Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend:
```bash
npm install
npm run dev
npm run build
npm run lint
```

### Database Migrations (when needed):
```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```
