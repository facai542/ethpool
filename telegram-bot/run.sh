#!/bin/bash

echo "Starting ETH Mining Telegram Bot..."
echo

# Check if .env exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please copy .env.example to .env and fill in the values."
    exit 1
fi

# Activate virtual environment if exists
if [ -f venv/bin/activate ]; then
    source venv/bin/activate
fi

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt -q

# Run the bot
echo
echo "Starting bot..."
python bot.py



