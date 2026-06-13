from celery_app import celery_app
import sys
import os
from dotenv import load_dotenv

# Load .env from the sync_engine directory (where uvicorn is run from)
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Add adapter path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "adapter"))
from twenty_client import TwentyClient

# Lazy client getter — only instantiated when a task actually runs
_client = None
def get_client():
    global _client
    if _client is None:
        _client = TwentyClient()
    return _client

@celery_app.task
def sync_shopify_order(order_data: dict):
    """
    Process a new Shopify order.
    1. Check if customer exists in DB/Twenty. If not, create them.
    2. Create the Order custom object in Twenty.
    3. Determine RTO risk or special tags.
    """
    try:
        # Simplified example logic
        email = order_data.get("email")
        
        # Search in Twenty
        client = get_client()
        customers = client.search_contact(email)
        if customers:
            customer_id = customers[0]["id"]
        else:
            # Create in Twenty
            new_customer = client.create_contact({
                "email": email,
                "name": f"{order_data.get('customer', {}).get('first_name', '')} {order_data.get('customer', {}).get('last_name', '')}",
            })
            customer_id = new_customer["id"]

        # Create Order custom object
        order_obj = {
            "shopify_order_id": str(order_data.get("id")),
            "customer_id": customer_id,
            "amount": float(order_data.get("total_price", 0)),
            "status": order_data.get("financial_status", "pending")
        }
        client.create_order(order_obj)
        print(f"Successfully synced Shopify order {order_data.get('id')}")
        
    except Exception as e:
        print(f"Error syncing order: {e}")
        raise

@celery_app.task
def sync_twenty_webhook(event: str, data: dict):
    """
    Process webhooks from Twenty.
    For example: task.updated where assignee is Aanya -> trigger MCP / AI to do the task.
    """
    print(f"Received Twenty Webhook: {event} for {data.get('id')}")
    # Local PostgreSQL syncing would happen here for Analytics.
    pass

@celery_app.task
def process_whitegloves_event(payload: dict):
    """
    Process custom white gloves events.
    """
    print(f"Processing WG event: {payload}")
    pass
