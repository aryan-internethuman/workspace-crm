import httpx
import os
from typing import Optional, Dict, Any, List
from pydantic import BaseModel

class TwentyClient:
    """
    Adapter layer for Twenty CRM.
    Abstracts all interactions with the Twenty REST API.
    """
    
    def __init__(self, base_url: str = None, api_key: str = None):
        self.base_url = (base_url or os.getenv("TWENTY_API_URL", "http://localhost:3000/rest")).rstrip("/")
        self.api_key = api_key or os.getenv("TWENTY_API_KEY")
        if not self.api_key:
            raise ValueError("TWENTY_API_KEY is required")
        
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        self.client = httpx.Client(base_url=self.base_url, headers=self.headers)

    def _get(self, endpoint: str, params: Optional[Dict] = None) -> Any:
        response = self.client.get(endpoint, params=params)
        response.raise_for_status()
        return response.json()

    def _post(self, endpoint: str, data: Dict) -> Any:
        response = self.client.post(endpoint, json=data)
        response.raise_for_status()
        return response.json()

    def _patch(self, endpoint: str, data: Dict) -> Any:
        response = self.client.patch(endpoint, json=data)
        response.raise_for_status()
        return response.json()

    # --- Contact / Customer ---
    def create_contact(self, data: Dict) -> Dict:
        # Standard object in Twenty is usually 'people'
        return self._post("/people", data)
    
    def update_contact(self, customer_id: str, data: Dict) -> Dict:
        return self._patch(f"/people/{customer_id}", data)

    def search_contact(self, query: str) -> List[Dict]:
        return self._get("/people", params={"filter": f"name:ilike:{query}"}).get("data", {}).get("people", [])

    # --- Task ---
    def create_task(self, data: Dict) -> Dict:
        return self._post("/tasks", data)

    def update_task(self, task_id: str, data: Dict) -> Dict:
        return self._patch(f"/tasks/{task_id}", data)

    def complete_task(self, task_id: str) -> Dict:
        return self.update_task(task_id, {"status": "COMPLETED"})

    def assign_task(self, task_id: str, member_id: str) -> Dict:
        return self.update_task(task_id, {"assignedToId": member_id})

    # --- Note ---
    def create_note(self, data: Dict) -> Dict:
        return self._post("/notes", data)

    # --- Escalation (Custom Object) ---
    def create_escalation(self, data: Dict) -> Dict:
        return self._post("/escalations", data)

    def update_escalation(self, escalation_id: str, data: Dict) -> Dict:
        return self._patch(f"/escalations/{escalation_id}", data)

    # --- Order (Custom Object) ---
    def get_order(self, order_id: str) -> Dict:
        return self._get(f"/orders/{order_id}")
    
    def create_order(self, data: Dict) -> Dict:
        return self._post("/orders", data)

    # --- Campaign (Custom Object) ---
    def list_campaigns(self) -> List[Dict]:
        return self._get("/campaigns").get("data", {}).get("campaigns", [])
    
    def create_campaign(self, data: Dict) -> Dict:
        return self._post("/campaigns", data)

    # --- Activity (Custom Object) ---
    def create_activity(self, data: Dict) -> Dict:
        return self._post("/activities", data)

    # --- Workspace Members ---
    def list_workspace_members(self) -> List[Dict]:
        return self._get("/workspaceMembers").get("data", {}).get("workspaceMembers", [])

if __name__ == "__main__":
    # Test initialization
    print("TwentyClient adapter loaded successfully.")
