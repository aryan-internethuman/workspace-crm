from fastapi import FastAPI, Request, HTTPException, Depends, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from celery_app import celery_app
import tasks
from database import get_db
from models import Conversation, ConversationEvent, Operator
import schemas
from typing import List

app = FastAPI(title="Workspace Sync Engine Webhooks")

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class WebhookPayload(BaseModel):
    event: str
    data: dict

@app.post("/webhooks/twenty")
async def twenty_webhook(payload: WebhookPayload, request: Request):
    """
    Receives webhooks from Twenty CRM.
    Events like task.created, task.updated, contact.created
    """
    # Verify signature logic would go here
    tasks.sync_twenty_webhook.delay(payload.event, payload.data)
    return {"status": "queued"}

@app.post("/webhooks/shopify")
async def shopify_webhook(request: Request):
    """
    Receives webhooks from Shopify.
    """
    # Verify HMAC signature logic here
    data = await request.json()
    # Assuming standard shopify order creation payload
    tasks.sync_shopify_order.delay(data)
    return {"status": "queued"}

@app.post("/webhooks/whitegloves")
async def whitegloves_webhook(payload: dict):
    """
    Receives internal system webhooks or third party integrations (like WhatsApp).
    """
    tasks.process_whitegloves_event.delay(payload)
    return {"status": "queued"}

# --- WEBSOCKET MANAGER ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/conversations")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, wait for incoming messages (if any)
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# --- HUMAN TAKEOVER API ENDPOINTS ---

@app.get("/api/conversations", response_model=List[schemas.ConversationResponse])
def get_conversations(db: Session = Depends(get_db)):
    """List all active conversations."""
    conversations = db.query(Conversation).all()
    return conversations

@app.get("/api/conversations/{conversation_id}", response_model=schemas.ConversationDetailResponse)
def get_conversation_detail(conversation_id: str, db: Session = Depends(get_db)):
    """Get a single conversation with its events."""
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    events = db.query(ConversationEvent).filter(ConversationEvent.conversation_id == conversation_id).all()
    
    response_data = schemas.ConversationDetailResponse.model_validate(conversation)
    response_data.events = [schemas.ConversationEventResponse.model_validate(e) for e in events]
    return response_data

@app.post("/api/conversations/{conversation_id}/takeover", response_model=schemas.ConversationResponse)
def takeover_conversation(conversation_id: str, payload: schemas.TakeoverRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Transfer ownership of a conversation from AI to a Human operator."""
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    operator = db.query(Operator).filter(Operator.id == payload.operator_id).first()
    if not operator:
        raise HTTPException(status_code=404, detail="Operator not found")
        
    previous_handler = conversation.assigned_to or conversation.handler_type
    
    # Update conversation state
    conversation.assigned_to = payload.operator_id
    conversation.handler_type = "human"
    conversation.ai_paused = True
    
    # Log audit event
    event = ConversationEvent(
        conversation_id=conversation.id,
        event_type="takeover",
        previous_handler=previous_handler,
        new_handler=payload.operator_id,
        actor=payload.operator_id
    )
    db.add(event)
    db.commit()
    db.refresh(conversation)
    
    background_tasks.add_task(manager.broadcast, "refresh")
    
    return conversation

@app.post("/api/conversations/{conversation_id}/return-to-ai", response_model=schemas.ConversationResponse)
def return_to_ai(conversation_id: str, payload: schemas.TakeoverRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Transfer ownership of a conversation back to AI from a Human operator."""
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    previous_handler = conversation.assigned_to or conversation.handler_type
    
    # Update conversation state
    conversation.assigned_to = None
    conversation.handler_type = "ai"
    conversation.ai_paused = False
    
    # Log audit event
    event = ConversationEvent(
        conversation_id=conversation.id,
        event_type="return_to_ai",
        previous_handler=previous_handler,
        new_handler="ai",
        actor=payload.operator_id
    )
    db.add(event)
    db.commit()
    db.refresh(conversation)
    
    background_tasks.add_task(manager.broadcast, "refresh")
    
    return conversation


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
