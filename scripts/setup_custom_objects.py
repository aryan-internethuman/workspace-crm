import os
import sys

# Add adapter to path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "adapter"))
from twenty_client import TwentyClient

def setup_custom_objects():
    client = TwentyClient()

    # In Twenty CRM, creating custom objects via API uses the metadata API.
    # The actual endpoint depends on the Twenty version (e.g., /metadata/objects or GraphQL).
    # This script provides the required fields for the custom objects requested.
    # Note: If the Metadata API is restricted, you may need to create these manually in Settings -> Data Model.

    custom_objects = [
        {
            "nameSingular": "Customer",
            "namePlural": "Customers",
            "labelSingular": "Customer",
            "labelPlural": "Customers",
            "fields": [
                {"name": "name", "type": "TEXT"},
                {"name": "phone", "type": "TEXT"},
                {"name": "email", "type": "TEXT"},
                {"name": "language", "type": "TEXT"},
                {"name": "ltv", "type": "CURRENCY"},
                {"name": "customer_type", "type": "TEXT"},
                {"name": "sentiment_score", "type": "NUMBER"},
                {"name": "last_order_date", "type": "DATE_TIME"}
            ]
        },
        {
            "nameSingular": "Order",
            "namePlural": "Orders",
            "labelSingular": "Order",
            "labelPlural": "Orders",
            "fields": [
                {"name": "shopify_order_id", "type": "TEXT"},
                {"name": "customer_id", "type": "RELATION", "relationObject": "Customer"},
                {"name": "amount", "type": "CURRENCY"},
                {"name": "status", "type": "TEXT"},
                {"name": "payment_type", "type": "TEXT"},
                {"name": "tracking_number", "type": "TEXT"},
                {"name": "rto_risk", "type": "TEXT"},
                {"name": "refund_status", "type": "TEXT"}
            ]
        },
        {
            "nameSingular": "Escalation",
            "namePlural": "Escalations",
            "labelSingular": "Escalation",
            "labelPlural": "Escalations",
            "fields": [
                {"name": "customer", "type": "RELATION", "relationObject": "Customer"},
                {"name": "conversation", "type": "TEXT"},
                {"name": "reason", "type": "TEXT"},
                {"name": "status", "type": "TEXT"},
                {"name": "assigned_to", "type": "RELATION", "relationObject": "WorkspaceMember"},
                {"name": "resolution", "type": "TEXT"},
                {"name": "resolved_at", "type": "DATE_TIME"}
            ]
        },
        {
            "nameSingular": "Campaign",
            "namePlural": "Campaigns",
            "labelSingular": "Campaign",
            "labelPlural": "Campaigns",
            "fields": [
                {"name": "name", "type": "TEXT"},
                {"name": "type", "type": "TEXT"},
                {"name": "status", "type": "TEXT"},
                {"name": "messages_sent", "type": "NUMBER"},
                {"name": "revenue_generated", "type": "CURRENCY"},
                {"name": "conversion_rate", "type": "NUMBER"}
            ]
        },
        {
            "nameSingular": "Activity",
            "namePlural": "Activities",
            "labelSingular": "Activity",
            "labelPlural": "Activities",
            "fields": [
                {"name": "type", "type": "TEXT"},
                {"name": "actor", "type": "TEXT"},
                {"name": "description", "type": "TEXT"},
                {"name": "entity_type", "type": "TEXT"},
                {"name": "entity_id", "type": "TEXT"}
            ]
        }
    ]

    for obj in custom_objects:
        try:
            print(f"Provisioning object: {obj['nameSingular']}")
            # client._post("/metadata/objects", obj)
            print(f"Skipping actual POST call as metadata API structure may require GraphQL/specific UUIDs.")
            print(f"Fields required: {[f['name'] for f in obj['fields']]}\n")
        except Exception as e:
            print(f"Error creating {obj['nameSingular']}: {e}")

if __name__ == "__main__":
    setup_custom_objects()
