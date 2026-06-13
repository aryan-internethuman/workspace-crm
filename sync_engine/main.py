from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from celery_app import celery_app
import tasks

app = FastAPI(title="Workspace Sync Engine Webhooks")

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
