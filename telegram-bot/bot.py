"""
ETH Mining Telegram Bot
Main bot logic with command handlers
"""
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    MessageHandler,
    ContextTypes,
    filters
)
from config import TELEGRAM_BOT_TOKEN, get_message, ETH_TO_USDT_RATE, EXCHANGE_FEE, MIN_EXCHANGE_ETH
from api_client import api_client

# Setup logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# User language preferences (in production, store in database)
user_languages = {}

def get_user_lang(user_id: int) -> str:
    return user_languages.get(user_id, 'en')

# Command Handlers
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Start command handler"""
    user = update.effective_user
    lang = get_user_lang(user.id)
    
    keyboard = [
        [InlineKeyboardButton("Check Balance", callback_data='balance')],
        [InlineKeyboardButton("Exchange ETH", callback_data='exchange')],
        [InlineKeyboardButton("Withdraw USDT", callback_data='withdraw')],
        [InlineKeyboardButton("View Earnings", callback_data='earnings')],
        [InlineKeyboardButton("Language", callback_data='language')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    welcome_text = f"""
Welcome to ETH Mining Bot!

Commands:
/balance - Check your balance
/exchange <amount> - Exchange ETH to USDT
/withdraw <amount> - Withdraw USDT
/earnings - View earnings history
/bind <wallet_address> - Bind your wallet
/help - Show help

Current Exchange Rate: 1 ETH = {ETH_TO_USDT_RATE} USDT
Fee: {EXCHANGE_FEE * 100}%
"""
    
    await update.message.reply_text(welcome_text, reply_markup=reply_markup)

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Help command handler"""
    help_text = """
ETH Mining Bot Commands:

/start - Start the bot
/balance - Check your balance
/exchange <amount> - Exchange ETH to USDT
  Example: /exchange 0.01
/withdraw <amount> - Withdraw USDT
  Example: /withdraw 100
/earnings - View earnings history
/transactions - View transaction history
/bind <wallet_address> - Bind wallet address
  Example: /bind 0x1234...abcd
/unbind - Unbind wallet address
/rate - Check current exchange rate
/help - Show this help message

Need support? Contact @YourSupportUsername
"""
    await update.message.reply_text(help_text)

async def bind_wallet(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Bind wallet address"""
    user = update.effective_user
    
    if not context.args or len(context.args) != 1:
        await update.message.reply_text(
            "Usage: /bind <wallet_address>\n"
            "Example: /bind 0x1234567890abcdef1234567890abcdef12345678"
        )
        return
    
    wallet_address = context.args[0]
    
    # Validate wallet address format
    if not wallet_address.startswith('0x') or len(wallet_address) != 42:
        await update.message.reply_text("Invalid wallet address format. Please provide a valid Ethereum address.")
        return
    
    # Bind wallet
    result = await api_client.bind_telegram(
        wallet_address=wallet_address,
        telegram_id=user.id,
        telegram_username=user.username
    )
    
    if result.get('success'):
        await update.message.reply_text(
            f"Wallet bound successfully!\n"
            f"Address: {wallet_address[:6]}...{wallet_address[-4:]}\n\n"
            f"You can now use /balance to check your balance."
        )
    else:
        await update.message.reply_text(f"Failed to bind wallet: {result.get('error', 'Unknown error')}")

async def balance(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Check balance command"""
    user = update.effective_user
    
    # Get wallet address from binding
    wallet_address = await api_client.get_wallet_by_telegram(user.id)
    
    if not wallet_address:
        await update.message.reply_text(
            "No wallet bound. Please use /bind <wallet_address> first."
        )
        return
    
    await update.message.reply_text("Fetching balance...")
    
    result = await api_client.get_user_balance(wallet_address)
    
    if result.get('success'):
        data = result['data']
        balance_text = f"""
Your Balance

Wallet: {wallet_address[:6]}...{wallet_address[-4:]}

ETH Balance: {data.get('eth_balance', 0):.6f} ETH
Total ETH Earned: {data.get('total_eth', 0):.6f} ETH

USDT Balance: {data.get('usdt_balance', 0):.2f} USDT
Withdrawable USDT: {data.get('withdrawable_usdt', 0):.2f} USDT

Authorization: {'Approved' if data.get('is_approved') else 'Pending'}

Current Rate: 1 ETH = {ETH_TO_USDT_RATE} USDT
"""
        
        keyboard = [
            [InlineKeyboardButton("Exchange ETH", callback_data='exchange')],
            [InlineKeyboardButton("Withdraw USDT", callback_data='withdraw')],
            [InlineKeyboardButton("Refresh", callback_data='refresh_balance')]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(balance_text, reply_markup=reply_markup)
    else:
        await update.message.reply_text(f"Failed to fetch balance: {result.get('error', 'Unknown error')}")

async def exchange(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Exchange ETH to USDT"""
    user = update.effective_user
    
    wallet_address = await api_client.get_wallet_by_telegram(user.id)
    
    if not wallet_address:
        await update.message.reply_text("No wallet bound. Please use /bind <wallet_address> first.")
        return
    
    if not context.args or len(context.args) != 1:
        # Show exchange info
        result = await api_client.get_user_balance(wallet_address)
        eth_balance = result.get('data', {}).get('eth_balance', 0) if result.get('success') else 0
        
        await update.message.reply_text(
            f"Exchange ETH to USDT\n\n"
            f"Your ETH Balance: {eth_balance:.6f} ETH\n"
            f"Exchange Rate: 1 ETH = {ETH_TO_USDT_RATE} USDT\n"
            f"Fee: {EXCHANGE_FEE * 100}%\n"
            f"Minimum: {MIN_EXCHANGE_ETH} ETH\n\n"
            f"Usage: /exchange <amount>\n"
            f"Example: /exchange 0.01\n"
            f"Or: /exchange all (to exchange all ETH)"
        )
        return
    
    amount_str = context.args[0]
    
    # Handle "all" keyword
    if amount_str.lower() == 'all':
        result = await api_client.get_user_balance(wallet_address)
        if not result.get('success'):
            await update.message.reply_text("Failed to fetch balance")
            return
        amount = result['data'].get('eth_balance', 0)
    else:
        try:
            amount = float(amount_str)
        except ValueError:
            await update.message.reply_text("Invalid amount. Please enter a valid number.")
            return
    
    if amount < MIN_EXCHANGE_ETH:
        await update.message.reply_text(f"Minimum exchange amount is {MIN_EXCHANGE_ETH} ETH")
        return
    
    # Calculate preview
    fee_amount = amount * EXCHANGE_FEE
    net_amount = amount - fee_amount
    usdt_amount = net_amount * ETH_TO_USDT_RATE
    
    # Confirm exchange
    keyboard = [
        [InlineKeyboardButton("Confirm Exchange", callback_data=f'confirm_exchange_{amount}')],
        [InlineKeyboardButton("Cancel", callback_data='cancel')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        f"Exchange Preview\n\n"
        f"ETH Amount: {amount:.6f} ETH\n"
        f"Fee ({EXCHANGE_FEE * 100}%): {fee_amount:.6f} ETH\n"
        f"Net Amount: {net_amount:.6f} ETH\n"
        f"Rate: 1 ETH = {ETH_TO_USDT_RATE} USDT\n\n"
        f"You will receive: {usdt_amount:.2f} USDT\n\n"
        f"Confirm this exchange?",
        reply_markup=reply_markup
    )

async def withdraw(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Withdraw USDT"""
    user = update.effective_user
    
    wallet_address = await api_client.get_wallet_by_telegram(user.id)
    
    if not wallet_address:
        await update.message.reply_text("No wallet bound. Please use /bind <wallet_address> first.")
        return
    
    if not context.args or len(context.args) != 1:
        # Show withdraw info
        result = await api_client.get_user_balance(wallet_address)
        withdrawable = result.get('data', {}).get('withdrawable_usdt', 0) if result.get('success') else 0
        
        await update.message.reply_text(
            f"Withdraw USDT\n\n"
            f"Withdrawable Balance: {withdrawable:.2f} USDT\n\n"
            f"Usage: /withdraw <amount>\n"
            f"Example: /withdraw 100\n"
            f"Or: /withdraw all (to withdraw all)"
        )
        return
    
    amount_str = context.args[0]
    
    if amount_str.lower() == 'all':
        result = await api_client.get_user_balance(wallet_address)
        if not result.get('success'):
            await update.message.reply_text("Failed to fetch balance")
            return
        amount = result['data'].get('withdrawable_usdt', 0)
    else:
        try:
            amount = float(amount_str)
        except ValueError:
            await update.message.reply_text("Invalid amount. Please enter a valid number.")
            return
    
    if amount <= 0:
        await update.message.reply_text("Amount must be greater than 0")
        return
    
    # Confirm withdrawal
    keyboard = [
        [InlineKeyboardButton("Confirm Withdrawal", callback_data=f'confirm_withdraw_{amount}')],
        [InlineKeyboardButton("Cancel", callback_data='cancel')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        f"Withdrawal Preview\n\n"
        f"Amount: {amount:.2f} USDT\n"
        f"To: {wallet_address[:6]}...{wallet_address[-4:]}\n\n"
        f"Confirm this withdrawal?",
        reply_markup=reply_markup
    )

async def earnings(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """View earnings history"""
    user = update.effective_user
    
    wallet_address = await api_client.get_wallet_by_telegram(user.id)
    
    if not wallet_address:
        await update.message.reply_text("No wallet bound. Please use /bind <wallet_address> first.")
        return
    
    await update.message.reply_text("Fetching earnings...")
    
    result = await api_client.get_user_earnings(wallet_address)
    
    if result.get('success'):
        data = result.get('data', {})
        earnings_text = f"""
Your Earnings

Total ETH Earned: {data.get('total_eth', 0):.6f} ETH
Total USDT Exchanged: {data.get('total_usdt', 0):.2f} USDT
Total Withdrawn: {data.get('total_withdrawn', 0):.2f} USDT

Today's Earnings: {data.get('today_earnings', 0):.6f} ETH
This Week: {data.get('week_earnings', 0):.6f} ETH
This Month: {data.get('month_earnings', 0):.6f} ETH
"""
        await update.message.reply_text(earnings_text)
    else:
        await update.message.reply_text(f"Failed to fetch earnings: {result.get('error', 'Unknown error')}")

async def rate(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Check current exchange rate"""
    result = await api_client.get_exchange_rate()
    
    if result.get('success'):
        data = result.get('data', {})
        rates = data.get('rates', {})
        fees = data.get('fees', {})
        
        await update.message.reply_text(
            f"Current Exchange Rates\n\n"
            f"ETH to USDT: {rates.get('ETH_TO_USDT', ETH_TO_USDT_RATE)} USDT\n"
            f"Fee: {fees.get('ETH_TO_USDT', EXCHANGE_FEE) * 100}%\n"
            f"Minimum: {MIN_EXCHANGE_ETH} ETH"
        )
    else:
        await update.message.reply_text(
            f"Current Exchange Rate\n\n"
            f"1 ETH = {ETH_TO_USDT_RATE} USDT\n"
            f"Fee: {EXCHANGE_FEE * 100}%\n"
            f"Minimum: {MIN_EXCHANGE_ETH} ETH"
        )

# Callback Query Handler
async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle button callbacks"""
    query = update.callback_query
    await query.answer()
    
    user = update.effective_user
    data = query.data
    
    if data == 'balance' or data == 'refresh_balance':
        wallet_address = await api_client.get_wallet_by_telegram(user.id)
        if not wallet_address:
            await query.edit_message_text("No wallet bound. Please use /bind <wallet_address> first.")
            return
        
        result = await api_client.get_user_balance(wallet_address)
        if result.get('success'):
            balance_data = result['data']
            balance_text = f"""
Your Balance

Wallet: {wallet_address[:6]}...{wallet_address[-4:]}

ETH Balance: {balance_data.get('eth_balance', 0):.6f} ETH
Total ETH Earned: {balance_data.get('total_eth', 0):.6f} ETH

USDT Balance: {balance_data.get('usdt_balance', 0):.2f} USDT
Withdrawable USDT: {balance_data.get('withdrawable_usdt', 0):.2f} USDT

Current Rate: 1 ETH = {ETH_TO_USDT_RATE} USDT
"""
            keyboard = [
                [InlineKeyboardButton("Exchange ETH", callback_data='exchange')],
                [InlineKeyboardButton("Withdraw USDT", callback_data='withdraw')],
                [InlineKeyboardButton("Refresh", callback_data='refresh_balance')]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            await query.edit_message_text(balance_text, reply_markup=reply_markup)
        else:
            await query.edit_message_text(f"Failed to fetch balance: {result.get('error', 'Unknown error')}")
    
    elif data == 'exchange':
        await query.edit_message_text(
            f"Exchange ETH to USDT\n\n"
            f"Rate: 1 ETH = {ETH_TO_USDT_RATE} USDT\n"
            f"Fee: {EXCHANGE_FEE * 100}%\n"
            f"Minimum: {MIN_EXCHANGE_ETH} ETH\n\n"
            f"Use /exchange <amount> to exchange\n"
            f"Example: /exchange 0.01"
        )
    
    elif data == 'withdraw':
        await query.edit_message_text(
            f"Withdraw USDT\n\n"
            f"Use /withdraw <amount> to withdraw\n"
            f"Example: /withdraw 100"
        )
    
    elif data.startswith('confirm_exchange_'):
        amount = float(data.replace('confirm_exchange_', ''))
        wallet_address = await api_client.get_wallet_by_telegram(user.id)
        
        if not wallet_address:
            await query.edit_message_text("No wallet bound.")
            return
        
        result = await api_client.exchange_eth_to_usdt(wallet_address, amount)
        
        if result.get('success'):
            exchange_data = result.get('data', {}).get('exchange', {})
            await query.edit_message_text(
                f"Exchange Successful!\n\n"
                f"Exchanged: {exchange_data.get('fromAmount', amount):.6f} ETH\n"
                f"Received: {exchange_data.get('toAmount', 0):.2f} USDT\n"
                f"Fee: {exchange_data.get('feeAmount', 0):.6f} ETH\n\n"
                f"Use /balance to check your new balance."
            )
        else:
            await query.edit_message_text(f"Exchange failed: {result.get('error', 'Unknown error')}")
    
    elif data.startswith('confirm_withdraw_'):
        amount = float(data.replace('confirm_withdraw_', ''))
        wallet_address = await api_client.get_wallet_by_telegram(user.id)
        
        if not wallet_address:
            await query.edit_message_text("No wallet bound.")
            return
        
        result = await api_client.request_withdrawal(wallet_address, amount)
        
        if result.get('success'):
            await query.edit_message_text(
                f"Withdrawal Request Submitted!\n\n"
                f"Amount: {amount:.2f} USDT\n"
                f"To: {wallet_address[:6]}...{wallet_address[-4:]}\n\n"
                f"Processing time: 1-24 hours"
            )
        else:
            await query.edit_message_text(f"Withdrawal failed: {result.get('error', 'Unknown error')}")
    
    elif data == 'cancel':
        await query.edit_message_text("Operation cancelled.")
    
    elif data == 'language':
        keyboard = [
            [InlineKeyboardButton("English", callback_data='lang_en')],
            [InlineKeyboardButton("Chinese", callback_data='lang_zh')],
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await query.edit_message_text("Select your language:", reply_markup=reply_markup)
    
    elif data.startswith('lang_'):
        lang = data.replace('lang_', '')
        user_languages[user.id] = lang
        await query.edit_message_text(f"Language set to {'English' if lang == 'en' else 'Chinese'}")

async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle errors"""
    logger.error(f"Exception while handling an update: {context.error}")

def main() -> None:
    """Start the bot"""
    if not TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN is not set!")
        return
    
    # Create application
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    
    # Add handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("bind", bind_wallet))
    application.add_handler(CommandHandler("balance", balance))
    application.add_handler(CommandHandler("exchange", exchange))
    application.add_handler(CommandHandler("withdraw", withdraw))
    application.add_handler(CommandHandler("earnings", earnings))
    application.add_handler(CommandHandler("rate", rate))
    application.add_handler(CallbackQueryHandler(button_callback))
    
    # Error handler
    application.add_error_handler(error_handler)
    
    # Run the bot
    logger.info("Starting bot...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()



