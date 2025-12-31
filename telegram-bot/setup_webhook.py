"""
Setup Telegram Bot Webhook
Run this script to set the webhook URL for your bot
"""
import requests
import sys
from config import TELEGRAM_BOT_TOKEN

def set_webhook(webhook_url: str) -> dict:
    """Set the webhook URL for the Telegram bot"""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook"
    response = requests.post(url, json={"url": webhook_url})
    return response.json()

def get_webhook_info() -> dict:
    """Get current webhook info"""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo"
    response = requests.get(url)
    return response.json()

def delete_webhook() -> dict:
    """Delete the webhook (switch to polling mode)"""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/deleteWebhook"
    response = requests.post(url)
    return response.json()

if __name__ == "__main__":
    if not TELEGRAM_BOT_TOKEN:
        print("Error: TELEGRAM_BOT_TOKEN is not set!")
        print("Please set it in .env file or config.py")
        sys.exit(1)
    
    print("Telegram Bot Webhook Setup")
    print("=" * 40)
    
    # Get current webhook info
    info = get_webhook_info()
    print(f"\nCurrent webhook URL: {info.get('result', {}).get('url', 'Not set')}")
    
    if len(sys.argv) > 1:
        action = sys.argv[1]
        
        if action == "set" and len(sys.argv) > 2:
            webhook_url = sys.argv[2]
            result = set_webhook(webhook_url)
            print(f"\nSet webhook result: {result}")
        
        elif action == "delete":
            result = delete_webhook()
            print(f"\nDelete webhook result: {result}")
        
        elif action == "info":
            print(f"\nWebhook info: {info}")
        
        else:
            print("\nUsage:")
            print("  python setup_webhook.py info          - Get webhook info")
            print("  python setup_webhook.py set <url>     - Set webhook URL")
            print("  python setup_webhook.py delete        - Delete webhook")
    else:
        print("\nUsage:")
        print("  python setup_webhook.py info          - Get webhook info")
        print("  python setup_webhook.py set <url>     - Set webhook URL")
        print("  python setup_webhook.py delete        - Delete webhook")
        print("\nExample:")
        print("  python setup_webhook.py set https://your-worker.workers.dev")



