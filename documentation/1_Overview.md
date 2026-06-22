# Workspace CRM: Project Overview

## Introduction

Workspace CRM is a **White Gloves collaboration layer** built on top of [Twenty CRM](https://twenty.com). Instead of building a standalone customer relationship manager from scratch or heavily modifying an existing open-source CRM, Workspace operates as a seamless layer above Twenty CRM. It utilizes Twenty's official REST APIs, Webhooks, and Custom Objects as a robust foundational data layer.

## The Core Concept: The "Internet Human"

Workspace introduces a paradigm shift in how AI is utilized within enterprise environments. It treats AI agents not merely as external chat tools or passive bots, but as **native, asynchronous workspace members** (referred to as the "Internet Human"). 

These AI agents can:
- Receive and complete tasks.
- Read from and write to the CRM (Contacts, Orders, Tasks).
- Autonomously interact with customers.
- Recognize when a human needs to intervene.

## The Human Takeover Feature

One of the cornerstone features of Workspace CRM is the **Human Takeover Workflow**. Recognizing that AI cannot (and should not) handle 100% of complex customer interactions, we have built a seamless handover mechanism:

1. **AI Handling (Default):** The Internet Human handles incoming conversations (from WhatsApp, Email, Shopify webhooks, etc.) by default.
2. **Dashboard Monitoring:** Human operators monitor active conversations in real-time via the Founder Dashboard.
3. **The Takeover:** If an operator spots a conversation that requires human empathy, complex negotiation, or manual intervention, they click **"Take Over"**.
4. **AI Paused:** This action instantly flips an `ai_paused` flag in the database. 
5. **AI Awareness:** Before the Internet Human sends its next message, it uses an MCP (Model Context Protocol) tool to check the conversation status. Seeing that it is paused, the AI gracefully steps back and allows the human to converse.
6. **Return to AI:** Once the human operator has resolved the edge case, they click **"Return to AI"**, and the Internet Human resumes its autonomous handling.

## Key Technologies
- **Backend:** Python, FastAPI, Celery, Redis, PostgreSQL
- **Frontend:** React, Next.js, Tailwind CSS
- **AI Integration:** Model Context Protocol (MCP) using Server-Sent Events (SSE)
- **CRM Foundation:** Twenty CRM (Dockerized)
