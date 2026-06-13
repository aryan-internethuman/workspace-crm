import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "adapter"))
from twenty_client import TwentyClient

def provision_aanya():
    client = TwentyClient()

    payload = {
        "firstName": "Aanya",
        "lastName": "(Internet Human)",
        "email": "aanya@workspace.local",
        "role": "INTERNET_HUMAN", # Or a standard role if Twenty restricts roles
    }

    try:
        # In Twenty, you invite members or create them via the admin API.
        print(f"Attempting to provision Aanya via POST /workspace-members...")
        # response = client._post("/workspace-members", payload)
        # print("Aanya provisioned successfully:", response)
        
        # Simulating success
        print("Provisioning steps outlined. Execute using valid API keys or invite via Twenty Settings -> Members.")
        print("Once Aanya is created, generate a Personal Access Token for her to be used by the MCP server.")
    except Exception as e:
        print(f"Failed to provision Aanya: {e}")

if __name__ == "__main__":
    provision_aanya()
