# Port Configuration Options

## Current Standard Setup (Recommended):
```bash
APP_PORT="3000"           # Node.js application
DATABASE_PORT="5432"      # PostgreSQL (standard)
```

## Option 1: Custom Database Port (Same as App + 1):
```bash
APP_PORT="3000"           # Node.js application  
DATABASE_PORT="3001"      # PostgreSQL (custom)
DATABASE_URL="postgresql://user:pass@localhost:3001/dbname"
```

## Option 2: Sequential Port Assignment:
```bash
BASE_PORT="3000"
APP_PORT="${BASE_PORT}"           # 3000 - Application
DATABASE_PORT="$((BASE_PORT+1))" # 3001 - Database
```

## Option 3: Different Port Range:
```bash
APP_PORT="8000"           # Application
DATABASE_PORT="8001"      # Database
```

## Why Same Port Won't Work:
- Both services need to bind to a port
- Only one service can listen on a specific port
- Attempting to use the same port causes "Address already in use" error

## Port Conflict Resolution:
If you want related ports, use sequential numbering:
- App: 3000
- Database: 3001
- Redis (if added): 3002
- etc.