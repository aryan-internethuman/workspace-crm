# Workspace CRM

Workspace is a **White Gloves collaboration layer** built entirely on top of [Twenty CRM](https://twenty.com). Instead of forking or modifying Twenty CRM, Workspace uses it as a robust foundational data layer via its official REST APIs, Webhooks, and Custom Objects.

Workspace introduces a paradigm shift: **The Internet Human**. It treats AI agents not as external chat tools, but as native, asynchronous workspace members who can receive tasks, manage escalations, and sync data autonomously.

Recently, Workspace added a **Human Takeover** feature, allowing human operators to seamlessly pause the AI and step into a conversation when needed, all managed through a unified Founder Dashboard.

---

## 🏗️ Architecture

Workspace consists of four main components interacting via a strict boundary:

1. **Twenty CRM (Core Data Layer):** The stock, unmodified CRM running in Docker (Port 3000). Handles standard objects (People, Tasks) and custom objects (Orders, Escalations).
2. **Sync Engine (Event Processor & API):** A FastAPI & Celery Python service (Port 8000). It ingests webhooks, manages background tasks using Redis/Postgres, and provides the core API for managing **Conversations** and **Human Takeovers**.
3. **MCP Server (AI Brain Interface):** A FastAPI service (Port 8080) implementing the Model Context Protocol (MCP) via Server-Sent Events (SSE). It exposes standard tools (e.g., `create_task`, `check_conversation_status`) that AI agents use to interact securely with the CRM.
4. **Founder Dashboard (Human Interface):** A Next.js web application (Port 3001) where management can view live conversations, monitor the "Internet Human" status, and actively take over or return conversations to the AI.

---

## 🚀 Getting Started

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Node.js](https://nodejs.org/) v18+
- [Python](https://www.python.org/) 3.11+
- Virtualenv (`python -m venv`)

### 1. Clone & Setup Environments

```bash
git clone https://github.com/aryan-internethuman/workspace-crm.git workspace-crm
cd workspace-crm

# Setup Python Virtual Environment for the backend services
python -m venv venv
```

### 2. Boot the Infrastructure

Open two terminal tabs to start the background services:

**Terminal 1:** Start Twenty CRM
```bash
cd twenty
docker-compose up -d
```
*(Wait ~60 seconds for the Nest.js server to fully start. You can check logs via `docker-compose logs -f server`)*

**Terminal 2:** Start Workspace DB & Redis
```bash
# From the project root
docker-compose up -d
```

### 3. Configure Twenty CRM

1. Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.
2. Complete the initial setup to create an admin account.
3. Once logged in, navigate to **Settings -> API & Webhooks** (or API Keys).
4. Generate a new API token.
5. Create a `.env` file in **both** the `mcp_server` and `sync_engine` directories:
   ```env
   TWENTY_API_KEY=your_generated_api_token_here
   TWENTY_API_URL=http://localhost:3000/rest
   ```

*(Note: Custom Objects like Orders, Escalations, and Campaigns need to be created manually inside the Twenty CRM Data Model settings to match the scripts inside `scripts/setup_custom_objects.py`)*.

### 4. Start the Application Services

You will need four separate terminal tabs for the backend and frontend components. **Ensure you activate the Python `venv` in all Python-related tabs.**

**Terminal 3:** Start the Sync Engine
```bash
source venv/bin/activate
cd sync_engine
pip install -r requirements.txt
# Ensure database schema is created (migrations/setup)
python -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine)"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 4:** Start the Celery Worker (Task Processing)
```bash
source venv/bin/activate
cd sync_engine
celery -A celery_app worker --loglevel=info
```

**Terminal 5:** Start the MCP Server
```bash
source venv/bin/activate
cd mcp_server
pip install -r requirements.txt
python main.py
```

**Terminal 6:** Start the Founder Dashboard
```bash
cd dashboard
npm install
npm run dev
```

*(Note: The dashboard usually runs on `http://localhost:3001` if Twenty CRM is running on port 3000).*

---

## 🤖 MCP Integration & Human Takeover

The MCP server connects external AI agents (like Claude or Custom LLMs) to your CRM securely.
It operates on **[http://localhost:8080/sse](http://localhost:8080/sse)**. 

### Human Takeover Feature
With the new Human Takeover feature:
1. **Dashboard Overview:** Visit the Next.js Dashboard (`http://localhost:3001`) to see all active conversations.
2. **Take Over:** Click the "Take Over" button on any AI-handled conversation to assign it to a human operator. This updates the `ai_paused` flag in the database.
3. **AI Awareness:** The Internet Human can use the `check_conversation_status` MCP tool to check if a conversation is paused (`ai_paused=True`) before replying to a customer, ensuring it never talks over a human.
4. **Return to AI:** Once the human resolves the issue, they can click "Return to AI" on the dashboard to hand control back to the Internet Human.

### Exploring AI Tools
To see exactly what the AI can do, you can view the live Swagger documentation:
- Navigate to **[http://localhost:8080/docs](http://localhost:8080/docs)**
- Use the `GET /tools` endpoint to inspect the JSON schema of every tool exposed to the AI (e.g., `create_task`, `check_conversation_status`, `resolve_escalation`).

---

## 🧪 Testing Webhooks

You can test the event-driven system by simulating a webhook from an external service (e.g., Shopify):

```bash
curl -X POST http://localhost:8000/webhooks/shopify \
  -H "Content-Type: application/json" \
  -d '{
    "id": 999001, 
    "email": "customer@example.com", 
    "total_price": "149.99", 
    "financial_status": "paid", 
    "customer": {"first_name": "John", "last_name": "Doe"}
  }'
```
Check the output in **Terminal 4 (Celery)** to see the background job processing the order!

---

## 📁 Directory Structure

- `/twenty` - Stock Docker deployment of Twenty CRM.
- `/sync_engine` - FastAPI & Celery app to ingest and process webhooks, manage the database, and expose the conversational API.
- `/mcp_server` - FastAPI server utilizing the Model Context Protocol to serve AI tools.
- `/adapter` - Python shared library (`twenty_client.py`) acting as the Twenty API SDK.
- `/dashboard` - Next.js Founder Dashboard for system monitoring and manual human intervention.
- `/scripts` - Utility scripts to map out custom object structures and Internet Human provisioning.

## License
MIT
