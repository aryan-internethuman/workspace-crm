# Local Setup & Boot Guide

This guide explains how to get the entire Workspace CRM suite running on your local machine for development.

## Prerequisites
- **Docker** & Docker Compose (for Twenty CRM and local Postgres/Redis)
- **Node.js** v18+ (for Next.js Dashboard)
- **Python** 3.11+ (for Backend APIs)
- Virtualenv module (`python -m venv`)

---

## Step 1: Clone & Configure

```bash
git clone https://github.com/aryan-internethuman/workspace-crm.git workspace-crm
cd workspace-crm

# Setup Python Virtual Environment
python -m venv venv
```

Ensure you create `.env` files in both the `sync_engine` and `mcp_server` directories. Copy the provided `.env.example` files and populate them:

```env
# Example .env config
TWENTY_API_KEY=your_generated_jwt_token_here
TWENTY_API_URL=http://localhost:3000/rest
DATABASE_URL=postgresql://workspace:workspace_password@localhost:5434/workspace_crm
REDIS_URL=redis://localhost:6380/0
```

---

## Step 2: Boot Infrastructure

Open two terminal tabs for the Docker containers.

**Terminal 1: Start Twenty CRM**
```bash
cd twenty
docker compose up -d
```
*(Wait ~60 seconds for the Nest.js server to fully start. Check logs via `docker compose logs -f server`)*

**Terminal 2: Start Workspace Database & Redis**
```bash
# From the project root
docker compose up -d
```

### Initial CRM Configuration
1. Open **[http://localhost:3000](http://localhost:3000)**.
2. Complete the Twenty CRM initial admin setup.
3. Navigate to **Settings -> API & Webhooks** to generate an API token.
4. Place this token in your `.env` files.

---

## Step 3: Boot Application Services

You will need four separate terminal tabs for the application services. **Remember to activate your virtual environment (`source venv/bin/activate`) in all Python tabs.**

**Terminal 3: Sync Engine (API & Webhooks)**
```bash
source venv/bin/activate
cd sync_engine
pip install -r requirements.txt

# Initialize Database Schema (First time only)
python -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine)"

# Start Server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 4: Celery Worker (Background Tasks)**
```bash
source venv/bin/activate
cd sync_engine
celery -A celery_app worker --loglevel=info
```

**Terminal 5: MCP Server (AI Brain)**
```bash
source venv/bin/activate
cd mcp_server
pip install -r requirements.txt
python main.py
```

**Terminal 6: Founder Dashboard (Frontend)**
```bash
cd dashboard
npm install
npm run dev
```

---

## System Verification

- **Dashboard:** Visit `http://localhost:3001` to view the UI.
- **Sync Engine API:** Visit `http://localhost:8000/docs` for Swagger UI.
- **MCP Server Docs:** Visit `http://localhost:8080/docs` to inspect the AI tools.
