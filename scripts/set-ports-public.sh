#!/bin/bash
# Script to set ports to public in GitHub Codespaces

echo "==========================================="
echo "Setting ports to public visibility..."
echo "==========================================="

# Get the codespace name from environment
CODESPACE_NAME="${CODESPACE_NAME}"

if [ -z "$CODESPACE_NAME" ]; then
    echo "❌ Not running in a Codespace"
    echo ""
    echo "Please manually set ports to public:"
    echo "1. Open the PORTS tab in VS Code"
    echo "2. Right-click port 3000 → Port Visibility → Public"
    echo "3. Right-click port 8000 → Port Visibility → Public"
    echo ""
    exit 0
fi

echo "Codespace: $CODESPACE_NAME"
echo ""

# Try multiple methods to set port visibility

# Method 1: Using gh CLI
echo "Attempting to set ports via gh CLI..."
gh codespace ports visibility 3000:public -c "$CODESPACE_NAME" 2>&1
gh codespace ports visibility 8000:public -c "$CODESPACE_NAME" 2>&1

# Method 2: Wait a moment and try again (sometimes it takes a moment)
sleep 2

# Method 3: Try without the -c flag (use current codespace)
echo "Attempting alternative method..."
gh cs ports visibility 3000:public 2>&1
gh cs ports visibility 8000:public 2>&1

echo ""
echo "==========================================="
echo "⚠️  IMPORTANT: Please verify port visibility"
echo "==========================================="
echo ""
echo "GitHub Codespaces may require manual port configuration."
echo "Please check the PORTS tab and ensure:"
echo ""
echo "  Port 3000 (Frontend)   → Visibility: Public"
echo "  Port 8000 (Backend)    → Visibility: Public"
echo ""
echo "If ports are still Private:"
echo "  1. Open PORTS tab (bottom panel)"
echo "  2. Right-click each port"
echo "  3. Select: Port Visibility → Public"
echo ""
echo "==========================================="
echo ""
