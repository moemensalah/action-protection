#!/bin/bash

# Manage dual projects on same server
echo "🔧 Managing Dual Projects on Same Server"
echo "========================================"

# Check current PM2 processes
echo "1. Current PM2 processes:"
pm2 list

echo ""
echo "2. Project Analysis:"
echo "==================="

# Check latelounge project
echo "LateLounge Project:"
if [ -d "/home/actionprotection/latelounge" ]; then
    echo "   ✅ Directory: /home/actionprotection/latelounge"
    cd /home/actionprotection/latelounge
    if [ -f "package.json" ]; then
        echo "   ✅ Package.json exists"
        PORT_LATELOUNGE=$(grep -o '"PORT"[^,]*' package.json 2>/dev/null | head -1 | grep -o '[0-9]*' || echo "not found")
        echo "   📌 Port: $PORT_LATELOUNGE"
    fi
else
    echo "   ❌ Directory not found"
fi

echo ""
echo "Action Protection Project:"
if [ -d "/home/actionprotection/action-protection" ]; then
    echo "   ✅ Directory: /home/actionprotection/action-protection"
    cd /home/actionprotection/action-protection
    if [ -f "package.json" ]; then
        echo "   ✅ Package.json exists"
        PORT_ACTION=$(grep -o '"PORT"[^,]*' package.json 2>/dev/null | head -1 | grep -o '[0-9]*' || echo "not found")
        echo "   📌 Port: $PORT_ACTION"
    fi
else
    echo "   ❌ Directory not found"
fi

echo ""
echo "3. Port Usage:"
echo "=============="
echo "Active ports:"
ss -tlnp | grep -E ":(3000|4000|5000|8000)" | while read line; do
    echo "   $line"
done

echo ""
echo "4. Recommended Configuration:"
echo "============================"
echo "LateLounge:"
echo "   - Process name: latelounge"
echo "   - Port: 4000"
echo "   - Directory: /home/actionprotection/latelounge"
echo ""
echo "Action Protection:"
echo "   - Process name: actionprotection"
echo "   - Port: 3000"
echo "   - Directory: /home/actionprotection/action-protection"

echo ""
echo "5. Management Commands:"
echo "======================"
echo "Check both projects:"
echo "   pm2 list"
echo ""
echo "Restart specific project:"
echo "   pm2 restart latelounge"
echo "   pm2 restart actionprotection"
echo ""
echo "View logs:"
echo "   pm2 logs latelounge"
echo "   pm2 logs actionprotection"
echo ""
echo "Stop specific project:"
echo "   pm2 stop latelounge"
echo "   pm2 stop actionprotection"
echo ""
echo "Access applications:"
echo "   LateLounge: curl http://localhost:4000"
echo "   Action Protection: curl http://localhost:3000"

echo ""
echo "6. Current Status Summary:"
echo "========================="
LATELOUNGE_STATUS=$(pm2 describe latelounge 2>/dev/null | grep -o "status.*online\|status.*stopped" || echo "not running")
ACTION_STATUS=$(pm2 describe actionprotection 2>/dev/null | grep -o "status.*online\|status.*stopped" || echo "not running")

echo "LateLounge: $LATELOUNGE_STATUS"
echo "Action Protection: $ACTION_STATUS"

echo ""
echo "✅ Both projects can run simultaneously on different ports!"
echo "   Make sure they use different ports and database names."