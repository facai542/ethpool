"""
ETH Mining API Client
Connects to the Next.js API endpoints
"""
import httpx
from typing import Optional, Dict, Any
from config import API_BASE_URL, SUPABASE_URL, SUPABASE_KEY
from supabase import create_client, Client

class ETHMiningAPI:
    def __init__(self):
        self.base_url = API_BASE_URL
        self.client = httpx.AsyncClient(timeout=30.0)
        
        # Initialize Supabase client
        if SUPABASE_URL and SUPABASE_KEY:
            self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        else:
            self.supabase = None
    
    async def get_user_info(self, wallet_address: str) -> Dict[str, Any]:
        """Get user information by wallet address"""
        try:
            response = await self.client.get(
                f"{self.base_url}/api/user/info",
                params={"wallet_address": wallet_address}
            )
            return response.json()
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def get_user_balance(self, wallet_address: str) -> Dict[str, Any]:
        """Get user balance"""
        try:
            # Direct Supabase query for faster response
            if self.supabase:
                result = self.supabase.table('nh_member_new').select(
                    'id, wallet_address, eth, usdt, withdrawable_usdt, a_eth, approved'
                ).eq('wallet_address', wallet_address).eq('is_active', True).limit(1).execute()
                
                if result.data and len(result.data) > 0:
                    user = result.data[0]
                    return {
                        "success": True,
                        "data": {
                            "wallet_address": user['wallet_address'],
                            "eth_balance": float(user.get('eth', 0) or 0),
                            "total_eth": float(user.get('a_eth', 0) or 0),
                            "usdt_balance": float(user.get('usdt', 0) or 0),
                            "withdrawable_usdt": float(user.get('withdrawable_usdt', 0) or 0),
                            "is_approved": user.get('approved', False)
                        }
                    }
                return {"success": False, "error": "User not found"}
            
            # Fallback to API
            return await self.get_user_info(wallet_address)
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def get_exchange_rate(self) -> Dict[str, Any]:
        """Get current exchange rate"""
        try:
            response = await self.client.get(f"{self.base_url}/api/exchange")
            return response.json()
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def exchange_eth_to_usdt(self, wallet_address: str, amount: float) -> Dict[str, Any]:
        """Exchange ETH to USDT"""
        try:
            response = await self.client.post(
                f"{self.base_url}/api/exchange",
                json={
                    "userAddress": wallet_address,
                    "from": "ETH",
                    "to": "USDT",
                    "amount": amount
                }
            )
            return response.json()
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def request_withdrawal(self, wallet_address: str, amount: float) -> Dict[str, Any]:
        """Request USDT withdrawal"""
        try:
            response = await self.client.post(
                f"{self.base_url}/api/user/withdraw",
                json={
                    "wallet_address": wallet_address,
                    "amount": amount,
                    "currency": "USDT"
                }
            )
            return response.json()
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def get_user_earnings(self, wallet_address: str) -> Dict[str, Any]:
        """Get user earnings history"""
        try:
            response = await self.client.get(
                f"{self.base_url}/api/user/income",
                params={"wallet_address": wallet_address}
            )
            return response.json()
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def get_user_transactions(self, wallet_address: str) -> Dict[str, Any]:
        """Get user transaction history"""
        try:
            response = await self.client.get(
                f"{self.base_url}/api/user/transactions",
                params={"wallet_address": wallet_address}
            )
            return response.json()
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def bind_telegram(self, wallet_address: str, telegram_id: int, telegram_username: str = None) -> Dict[str, Any]:
        """Bind Telegram account to wallet"""
        try:
            if self.supabase:
                # Update or insert telegram binding
                result = self.supabase.table('telegram_bindings').upsert({
                    'telegram_id': telegram_id,
                    'telegram_username': telegram_username,
                    'wallet_address': wallet_address,
                    'is_active': True
                }, on_conflict='telegram_id').execute()
                
                return {"success": True, "message": "Telegram account bound successfully"}
            
            return {"success": False, "error": "Supabase not configured"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def get_wallet_by_telegram(self, telegram_id: int) -> Optional[str]:
        """Get wallet address by Telegram ID"""
        try:
            if self.supabase:
                result = self.supabase.table('telegram_bindings').select(
                    'wallet_address'
                ).eq('telegram_id', telegram_id).eq('is_active', True).limit(1).execute()
                
                if result.data and len(result.data) > 0:
                    return result.data[0]['wallet_address']
            return None
        except Exception:
            return None
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


# Singleton instance
api_client = ETHMiningAPI()



