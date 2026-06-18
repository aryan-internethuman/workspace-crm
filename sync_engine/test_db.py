from database import SessionLocal, engine, Base
from models import Operator, Conversation, ConversationEvent

def test_database_integration():
    print("Initializing database connection...")
    db = SessionLocal()
    
    try:
        # 1. Add a mock operator
        print("\n--- Step 1: Creating an Operator ---")
        mock_operator = Operator(id="op_123", name="Sarah Connor", email="sarah@crm.com")
        db.add(mock_operator)
        db.commit()
        print(f"Created Operator: {mock_operator.name} (ID: {mock_operator.id})")
        
        # 2. Add a new conversation assigned to this operator
        print("\n--- Step 2: Creating a Conversation ---")
        mock_conversation = Conversation(
            id="conv_abc",
            customer="John Doe (john@example.com)",
            channel="WhatsApp",
            status="In Progress",
            intent="billing_issue",
            assigned_to="op_123",
            handler_type="human",
            ai_paused=True
        )
        db.add(mock_conversation)
        db.commit()
        print(f"Created Conversation ID: {mock_conversation.id} (Paused AI: {mock_conversation.ai_paused})")
        
        # 3. Create a takeover audit event log
        print("\n--- Step 3: Logging a Takeover Event ---")
        event = ConversationEvent(
            conversation_id="conv_abc",
            event_type="takeover",
            previous_handler="ai",
            new_handler="op_123",
            actor="op_123"
        )
        db.add(event)
        db.commit()
        print(f"Logged Event: {event.event_type} | Actor: {event.actor}")
        
        # 4. Query & Verify Relations
        print("\n--- Step 4: Verifying Relations ---")
        fetched_event = db.query(ConversationEvent).filter_by(conversation_id="conv_abc").first()
        print(f"Retrieved Event: {fetched_event.event_type} (Timestamp: {fetched_event.timestamp})")
        print(f"Associated Conversation status: {fetched_event.conversation.status}")
        
        # 5. Clean up test data
        print("\n--- Step 5: Cleaning up test data ---")
        db.delete(event)
        db.delete(mock_conversation)
        db.delete(mock_operator)
        db.commit()
        print("Verification database data cleaned up successfully.")
        print("\n🎉 SUCCESS: Database structure and models are fully functional!")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ ERROR during database interaction: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_database_integration()