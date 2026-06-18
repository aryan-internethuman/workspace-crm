from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class OperatorBase(BaseModel):
    id: str
    name: str
    email: str

    class Config:
        from_attributes = True

class OperatorResponse(OperatorBase):
    created_at: datetime

class ConversationBase(BaseModel):
    id: str
    customer: str
    channel: str
    status: str
    intent: Optional[str] = None
    assigned_to: Optional[str] = None
    handler_type: str
    ai_paused: bool

    class Config:
        from_attributes = True

class ConversationResponse(ConversationBase):
    created_at: datetime
    updated_at: datetime

class ConversationEventResponse(BaseModel):
    id: int
    conversation_id: str
    event_type: str
    previous_handler: Optional[str] = None
    new_handler: Optional[str] = None
    actor: str
    timestamp: datetime

    class Config:
        from_attributes = True

class ConversationDetailResponse(ConversationResponse):
    events: List[ConversationEventResponse] = []

class TakeoverRequest(BaseModel):
    operator_id: str
