from database import SessionLocal
from models import Operator, Conversation

db = SessionLocal()

# 1. Add operator
op = Operator(id="op_123", name="Sarah Connor", email="sarah@crm.com")
db.merge(op) # merge instead of add to prevent duplicates if run twice

# 2. Add conversation
conv = Conversation(
    id="conv_abc",
    customer="John Doe",
    channel="WhatsApp",
    status="AI Handling",
    handler_type="ai",
    ai_paused=False
)
db.merge(conv)

db.commit()
db.close()
print("Database seeded with op_123 and conv_abc! You can now test the API.")
