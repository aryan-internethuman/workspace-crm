import os
import sys
import requests
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Request
from mcp.server.sse import SseServerTransport
from starlette.routing import Mount, Route
from mcp.server import Server
from mcp.types import Tool, TextContent, CallToolResult

# Add adapter path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "adapter"))
from twenty_client import TwentyClient

app = FastAPI(title="Workspace MCP Server")

# Initialize MCP Server
mcp_server = Server("workspace-mcp")

# Lazy client getter — only instantiated on first use
_client = None
def get_client():
    global _client
    if _client is None:
        _client = TwentyClient()
    return _client

@mcp_server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="search_customer",
            description="Search for a customer by name",
            inputSchema={
                "type": "object",
                "properties": {"query": {"type": "string"}},
                "required": ["query"]
            }
        ),
        Tool(
            name="get_customer",
            description="Get customer by ID",
            inputSchema={
                "type": "object",
                "properties": {"customer_id": {"type": "string"}},
                "required": ["customer_id"]
            }
        ),
        Tool(
            name="check_conversation_status",
            description="Check if a conversation is paused or handled by a human",
            inputSchema={
                "type": "object",
                "properties": {"conversation_id": {"type": "string"}},
                "required": ["conversation_id"]
            }
        ),
        Tool(
            name="create_task",
            description="Create a task in Twenty CRM",
            inputSchema={
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "assignee_id": {"type": "string", "description": "Optional member ID to assign to"}
                },
                "required": ["title"]
            }
        ),
        Tool(
            name="complete_task",
            description="Mark a task as complete",
            inputSchema={
                "type": "object",
                "properties": {"task_id": {"type": "string"}},
                "required": ["task_id"]
            }
        ),
        Tool(
            name="create_escalation",
            description="Create an escalation for a customer issue",
            inputSchema={
                "type": "object",
                "properties": {
                    "customer_id": {"type": "string"},
                    "reason": {"type": "string"}
                },
                "required": ["customer_id", "reason"]
            }
        ),
        Tool(
            name="resolve_escalation",
            description="Resolve an escalation",
            inputSchema={
                "type": "object",
                "properties": {
                    "escalation_id": {"type": "string"},
                    "resolution": {"type": "string"}
                },
                "required": ["escalation_id", "resolution"]
            }
        )
        # Add the rest of the tools (list_customers, get_order, etc.) similarly...
    ]

@mcp_server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    try:
        client = get_client()
        if name == "search_customer":
            results = client.search_contact(arguments["query"])
            return [TextContent(type="text", text=str(results))]
        
        elif name == "get_customer":
            results = client._get(f"/customers/{arguments['customer_id']}")
            return [TextContent(type="text", text=str(results))]
            
        elif name == "check_conversation_status":
            conv_id = arguments["conversation_id"]
            try:
                # Query the sync engine API (running on port 8000)
                res = requests.get(f"http://127.0.0.1:8000/api/conversations/{conv_id}")
                if res.status_code == 200:
                    data = res.json()
                    status_text = f"Conversation {conv_id} - ai_paused: {data.get('ai_paused')}, handler_type: {data.get('handler_type')}, assigned_to: {data.get('assigned_to')}"
                    return [TextContent(type="text", text=status_text)]
                elif res.status_code == 404:
                    return [TextContent(type="text", text=f"Conversation {conv_id} not found in database.")]
                else:
                    return [TextContent(type="text", text=f"Failed to fetch status: HTTP {res.status_code}")]
            except Exception as e:
                return [TextContent(type="text", text=f"Error connecting to Sync Engine API: {str(e)}")]
            
        elif name == "create_task":
            task_data = {"title": arguments["title"]}
            if "description" in arguments:
                task_data["description"] = arguments["description"]
            if "assignee_id" in arguments:
                task_data["assignedToId"] = arguments["assignee_id"]
            
            result = client.create_task(task_data)
            return [TextContent(type="text", text=f"Task created: {result}")]
            
        elif name == "complete_task":
            result = client.complete_task(arguments["task_id"])
            return [TextContent(type="text", text=f"Task completed: {result}")]
            
        elif name == "create_escalation":
            data = {
                "customerId": arguments["customer_id"],
                "reason": arguments["reason"],
                "status": "OPEN"
            }
            result = client.create_escalation(data)
            return [TextContent(type="text", text=f"Escalation created: {result}")]
            
        elif name == "resolve_escalation":
            data = {
                "status": "RESOLVED",
                "resolution": arguments["resolution"]
            }
            result = client.update_escalation(arguments["escalation_id"], data)
            return [TextContent(type="text", text=f"Escalation resolved: {result}")]
            
        else:
            return [TextContent(type="text", text=f"Tool {name} not found.")]
    except Exception as e:
        return [TextContent(type="text", text=f"Error executing tool {name}: {str(e)}")]

# Mount MCP on FastAPI using SSE
sse = SseServerTransport("/messages/")

@app.get("/", summary="Server Status")
async def root():
    """Health check endpoint for the Workspace MCP Server."""
    return {"status": "online", "server": "workspace-mcp", "protocol": "sse"}

@app.get("/tools", summary="List Available Tools")
async def get_available_tools():
    """Returns a list of all tools exposed by this MCP server."""
    tools = await list_tools()
    return {"tools": [t.model_dump() for t in tools]}

@app.get("/sse", summary="MCP SSE Connection")
async def handle_sse(request: Request):
    """
    Connect to the MCP Server via Server-Sent Events (SSE).
    This is the primary transport for MCP clients.
    """
    async with sse.connect_sse(
        request.scope, request.receive, request._send
    ) as (read_stream, write_stream):
        await mcp_server.run(
            read_stream,
            write_stream,
            mcp_server.create_initialization_options()
        )

# Starlette mount for the MCP POST messages
app.routes.append(Mount("/messages/", app=sse.handle_post_message))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
