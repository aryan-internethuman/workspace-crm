# Future Roadmap & Areas for Improvement

The current Workspace CRM prototype successfully demonstrates the "Internet Human" takeover loop. However, to transition to a production-ready enterprise product, several key improvements and new features must be implemented.

---

## 🔒 1. Critical Security & Infrastructure Improvements

These are the immediate technical debts that must be resolved prior to any production deployment.

- **Authentication & Authorization:** 
  - Add API key or JWT middleware to the Sync Engine API (currently, the `takeover` endpoints are completely open).
  - Add authentication to the MCP Server `/sse` endpoint so unauthorized AIs cannot execute tools.
- **Webhook Security:** Implement HMAC signature verification for external webhooks (e.g., Shopify, Twenty CRM) to prevent malicious actors from spoofing events.
- **Secret Management:** Remove all plain-text passwords and JWTs from Docker Compose and codebase files. Utilize proper `.env` variable injection and Vault/AWS Secrets Manager in production.
- **Asynchronous HTTP Clients:** The MCP Server currently uses the synchronous `requests` library inside asynchronous functions. This blocks the FastAPI event loop. Migrate the `TwentyClient` and MCP tools to use `httpx.AsyncClient`.
- **Database Migrations:** Transition from `Base.metadata.create_all()` to a robust migration system using **Alembic** so schema updates can be applied without data loss.

---

## 🐛 2. System Reliability Fixes (Bugs)

- **Timestamp Updating:** The `updated_at` column in the database models does not auto-update on row changes. Add `onupdate=func.now()` to SQLAlchemy models.
- **Duplicate Takeover Prevention:** The API currently allows an operator to takeover a conversation that is already handled by a human, generating duplicate audit logs. Add state-checking logic.
- **WebSocket Reconnection:** The Next.js dashboard does not attempt to reconnect to the WebSocket if the connection drops. Add a robust reconnection strategy (or use Socket.io).
- **Error Handling UX:** The dashboard currently uses browser `alert()` popups or silent console logs for API errors. Implement a modern Toast notification system for user feedback.

---

## 🚀 3. New Features to Build

### Dashboard Enhancements
- **Detailed Conversation View:** Currently, operators can only see a list of conversations. We need a "Chat View" page where operators can click a row to read the actual message history and context before taking over.
- **Operator Authentication:** Implement a login page (e.g., using NextAuth.js) so the dashboard knows *who* is clicking "Take Over", instead of using a hardcoded `op_123` ID.
- **Search, Sort, and Filter:** Add the ability to search active conversations by customer name, sort by urgency, and filter by channel (WhatsApp vs. Email).
- **Analytics View:** Render real charts for the KPI section (average handling time, AI vs. Human resolution ratio, message volume).

### AI & Automation Features
- **Auto-Escalation Rules:** Build a rule engine in the Sync Engine that can automatically pause the AI and alert a human if certain triggers are hit (e.g., customer sentiment is extremely angry, or the word "cancel" is used).
- **Contextual Tooling:** Add more MCP tools, such as `list_customer_orders` or `get_knowledge_base_article`, to make the AI more autonomous.
- **AI Hand-off Summaries:** When an operator clicks "Take Over", the AI should generate a 2-sentence summary of the conversation so far, allowing the human to get up to speed instantly.

### CRM Integration Features
- **Custom Object Syncing:** Write the script that registers our `Conversation` database table as a "Custom Object" inside Twenty CRM itself. This will allow sales representatives to view an Internet Human's active chats directly from the Twenty CRM interface, without needing our custom dashboard.
- **Celery Task Implementation:** Flesh out the stubbed Celery tasks (`sync_shopify_order`, `sync_twenty_webhook`) to actively map and write incoming webhook data into the PostgreSQL database.
