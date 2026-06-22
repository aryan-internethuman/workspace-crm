# Architecture & System Components

Workspace CRM is composed of four distinct, decoupled components that interact via strict API boundaries. This modularity ensures that the AI layer, the data layer, and the human interfaces can scale and evolve independently.

---

## 1. Twenty CRM (Core Data Layer)
- **Role:** The foundational source of truth.
- **Tech Stack:** Nest.js, PostgreSQL (via Docker).
- **Functionality:** Handles standard objects (People, Tasks) and custom objects (Orders, Escalations, Campaigns). We use the stock, unmodified version of Twenty CRM to ensure easy upgrades and maintainability.

## 2. Sync Engine (Event Processor & Core API)
- **Role:** The nervous system of the application.
- **Tech Stack:** Python, FastAPI, Celery, Redis, PostgreSQL.
- **Functionality:** 
  - **Webhook Ingestion:** Listens to incoming webhooks from external services (Shopify, Twenty CRM, WhiteGloves).
  - **Task Queue:** Uses Celery and Redis to process heavy background tasks (like syncing orders or triggering campaigns) without blocking the API.
  - **Human Takeover API:** Exposes REST endpoints (`/api/conversations/*`) to list conversations, take them over, and return them to the AI.
  - **Real-Time Websockets:** Broadcasts state changes to the frontend dashboard so human operators see live updates instantly.

## 3. MCP Server (AI Brain Interface)
- **Role:** The secure bridge between the CRM and the external AI agent (e.g., Claude).
- **Tech Stack:** Python, FastAPI, Model Context Protocol (MCP) SDK.
- **Functionality:** 
  - Implements the MCP protocol using Server-Sent Events (SSE).
  - Exposes highly specific, controlled "Tools" to the AI (e.g., `search_customer`, `create_task`, `check_conversation_status`).
  - Utilizes a shared Python adapter (`twenty_client.py`) to execute actions against the Twenty CRM API on behalf of the AI.

## 4. Founder Dashboard (Human Interface)
- **Role:** The command center for human operators.
- **Tech Stack:** Next.js (React), Custom CSS.
- **Functionality:** 
  - Provides a bird's-eye view of all active conversations.
  - Features real-time UI updates (via WebSockets connected to the Sync Engine).
  - Enables the "Take Over" and "Return to AI" functionality, allowing humans to step in when the AI encounters edge cases.

---

## Data Flow: Human Takeover Lifecycle

1. **Incoming Message:** A webhook triggers a new conversation in the Sync Engine.
2. **AI Processing:** The external AI agent is prompted. It uses the MCP Server to call `check_conversation_status`.
3. **Status Check:** The MCP Server queries the Sync Engine API. The Sync Engine reports `ai_paused: False`.
4. **AI Replies:** The AI generates a response and sends it to the customer.
5. **Human Intervention:** A manager on the Founder Dashboard notices an issue and clicks "Take Over".
6. **State Update:** The Next.js frontend sends a `POST /takeover` request to the Sync Engine. The Sync Engine updates PostgreSQL (`ai_paused=True`) and broadcasts a WebSocket refresh to all connected dashboards.
7. **Next Customer Message:** When the customer replies again, the AI agent is prompted. It calls `check_conversation_status` via MCP.
8. **AI Paused:** The Sync Engine reports `ai_paused: True`. The AI sees this and stops processing the message, leaving it for the human operator to answer.
