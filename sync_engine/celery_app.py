import os
from celery import Celery

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6380/0")

celery_app = Celery(
    "workspace_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # Route tasks to specific queues if needed
    task_routes={
        "tasks.sync_shopify_order": {"queue": "order-sync"},
        "tasks.sync_twenty_webhook": {"queue": "crm-sync"},
    }
)
