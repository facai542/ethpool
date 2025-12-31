"""
Cloudflare Workers compatible Telegram Bot (Webhook Mode)
This file can be deployed to Cloudflare Workers using the Python runtime
"""
import json
import os
from typing import Dict, Any

# Configuration
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
API_BASE_URL = os.environ.get('API_BASE_URL', '')
SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')

# Exchange Configuration
ETH_TO_USDT_RATE = 4480.37
EXCHANGE_FEE = 0.005
MIN_EXCHANGE_ETH = 0.001

async def send_telegram_message(chat_id: int, text: str, reply_markup: dict = None) -> dict:
    """Send message via Telegram Bot API"""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML"
    }
    
    if reply_markup:
        payload["reply_markup"] = json.dumps(reply_markup)
    
    # Use fetch in Cloudflare Workers
    response = await fetch(url, {
        "method": "POST",
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(payload)
    })
    
    return await response.json()

async def get_user_balance(wallet_address: str) -> Dict[str, Any]:
    """Get user balance from API"""
    url = f"{API_BASE_URL}/api/user/info?wallet_address={wallet_address}"
    
    response = await fetch(url)
    return await response.json()

async def exchange_eth(wallet_address: str, amount: float) -> Dict[str, Any]:
    """Exchange ETH to USDT"""
    url = f"{API_BASE_URL}/api/exchange"
    
    response = await fetch(url, {
        "method": "POST",
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({
            "userAddress": wallet_address,
            "from": "ETH",
            "to": "USDT",
            "amount": amount
        })
    })
    
    return await response.json()

async def handle_command(message: dict) -> str:
    """Handle bot commands"""
    text = message.get('text', '')
    chat_id = message['chat']['id']
    user_id = message['from']['id']
    
    if text.startswith('/start'):
        return f"""
<b>Welcome to ETH Mining Bot!</b>

Commands:
/balance - Check your balance
/exchange &lt;amount&gt; - Exchange ETH to USDT
/withdraw &lt;amount&gt; - Withdraw USDT
/earnings - View earnings
/bind &lt;wallet&gt; - Bind wallet address
/rate - Check exchange rate
/help - Show help

<b>Current Rate:</b> 1 ETH = {ETH_TO_USDT_RATE} USDT
<b>Fee:</b> {EXCHANGE_FEE * 100}%
"""
    
    elif text.startswith('/help'):
        return """
<b>ETH Mining Bot Help</b>

<b>Commands:</b>
/start - Start the bot
/balance - Check your balance
/exchange &lt;amount&gt; - Exchange ETH to USDT
/withdraw &lt;amount&gt; - Withdraw USDT
/earnings - View earnings history
/bind &lt;wallet_address&gt; - Bind your wallet
/unbind - Unbind wallet
/rate - Current exchange rate

<b>Examples:</b>
/bind 0x1234...abcd
/exchange 0.01
/withdraw 100

Need help? Contact @YourSupport
"""
    
    elif text.startswith('/rate'):
        return f"""
<b>Current Exchange Rates</b>

ETH to USDT: <b>{ETH_TO_USDT_RATE}</b> USDT
Fee: <b>{EXCHANGE_FEE * 100}%</b>
Minimum: <b>{MIN_EXCHANGE_ETH}</b> ETH
"""
    
    elif text.startswith('/balance'):
        # Get wallet from storage (simplified)
        return "Please use /bind <wallet_address> first to check your balance."
    
    elif text.startswith('/bind'):
        parts = text.split()
        if len(parts) != 2:
            return "Usage: /bind <wallet_address>\nExample: /bind 0x1234567890abcdef..."
        
        wallet = parts[1]
        if not wallet.startswith('0x') or len(wallet) != 42:
            return "Invalid wallet address format."
        
        # Store wallet binding (would use KV storage in production)
        return f"""
<b>Wallet Bound Successfully!</b>

Address: <code>{wallet[:6]}...{wallet[-4:]}</code>

Use /balance to check your balance.
"""
    
    elif text.startswith('/exchange'):
        parts = text.split()
        if len(parts) != 2:
            return f"""
<b>Exchange ETH to USDT</b>

Usage: /exchange &lt;amount&gt;
Example: /exchange 0.01

Rate: 1 ETH = {ETH_TO_USDT_RATE} USDT
Fee: {EXCHANGE_FEE * 100}%
Minimum: {MIN_EXCHANGE_ETH} ETH
"""
        
        try:
            amount = float(parts[1])
            if amount < MIN_EXCHANGE_ETH:
                return f"Minimum exchange amount is {MIN_EXCHANGE_ETH} ETH"
            
            fee_amount = amount * EXCHANGE_FEE
            net_amount = amount - fee_amount
            usdt_amount = net_amount * ETH_TO_USDT_RATE
            
            return f"""
<b>Exchange Preview</b>

ETH Amount: <b>{amount:.6f}</b> ETH
Fee ({EXCHANGE_FEE * 100}%): <b>{fee_amount:.6f}</b> ETH
Net Amount: <b>{net_amount:.6f}</b> ETH

<b>You will receive: {usdt_amount:.2f} USDT</b>

Please bind your wallet first with /bind command to execute the exchange.
"""
        except ValueError:
            return "Invalid amount. Please enter a valid number."
    
    else:
        return "Unknown command. Use /help to see available commands."

async def handle_request(request) -> dict:
    """Main webhook handler for Cloudflare Workers"""
    if request.method != "POST":
        return {"statusCode": 405, "body": "Method not allowed"}
    
    try:
        body = await request.json()
        
        # Handle message
        if 'message' in body:
            message = body['message']
            chat_id = message['chat']['id']
            
            response_text = await handle_command(message)
            await send_telegram_message(chat_id, response_text)
        
        # Handle callback query
        elif 'callback_query' in body:
            callback = body['callback_query']
            chat_id = callback['message']['chat']['id']
            data = callback['data']
            
            # Handle callback data
            await send_telegram_message(chat_id, f"Callback received: {data}")
        
        return {"statusCode": 200, "body": "OK"}
    
    except Exception as e:
        return {"statusCode": 500, "body": str(e)}

# Cloudflare Workers entry point
async def on_fetch(request, env, ctx):
    """Cloudflare Workers fetch handler"""
    global TELEGRAM_BOT_TOKEN, API_BASE_URL, SUPABASE_URL, SUPABASE_KEY
    
    # Load environment variables
    TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN
    API_BASE_URL = env.API_BASE_URL
    SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
    SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
    
    result = await handle_request(request)
    
    return Response(
        result.get('body', 'OK'),
        status=result.get('statusCode', 200),
        headers={"Content-Type": "text/plain"}
    )



