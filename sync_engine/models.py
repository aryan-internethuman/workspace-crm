from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base

class Operator(Base):
    __tablename__ = "operators"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(String, primary_key=True, index=True)
    customer = Column(String, nullable=False)
    channel = Column(String, nullable=False)
    status = Column(String, nullable=False, default="AI Handling")
    intent = Column(String)
    
    # Takeover logic fields
    assigned_to = Column(String, nullable=True) # can be operator ID
    handler_type = Column(String, default="ai") # 'ai' or 'human'
    ai_paused = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class ConversationEvent(Base):
    __tablename__ = "conversation_events"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False)
    event_type = Column(String, nullable=False) # e.g. "takeover", "return_to_ai"
    previous_handler = Column(String, nullable=True)
    new_handler = Column(String, nullable=True)
    actor = Column(String, nullable=False) # who performed the action
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    conversation = relationship("Conversation")
