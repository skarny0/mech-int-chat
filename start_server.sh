#!/bin/bash
# Start the Claude API proxy server

echo "Starting Claude API proxy server..."
echo "Make sure you have Python 3 installed"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    python3 proxy.py
elif command -v python &> /dev/null; then
    python proxy.py
else
    echo "Error: Python 3 is not installed or not in PATH"
    echo "Please install Python 3 and try again"
    exit 1
fi
