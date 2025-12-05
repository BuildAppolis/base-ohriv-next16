# Multi-Environment Setup Guide

This project supports multiple independent database environments, allowing you to run separate versions with different databases without affecting each other.

## Overview

- **V1 Environment**: Original database (junction.proxy.rlwy.net)
- **V2 Environment**: New database (yamabiko.proxy.rlwy.net)

Both environments share the same codebase but use completely separate databases.

## Environment Files

- `.env` - Active environment (loaded by Next.js by default)
- `.env.v1` - V1 environment configuration (original database)
- `.env.v2` - V2 environment configuration (new database)
- `.env.backup` - Automatic backup created when switching environments

All these files are git-ignored for security.

## Quick Start

### Option 1: Using npm scripts with specific environment (Recommended)

Run the project directly with a specific environment without switching:

```bash
# Development with V2 database
pnpm dev:v2

# Build with V2 database
pnpm build:v2

# Start production server with V2 database
pnpm start:v2

# Push Prisma schema to V2 database
pnpm db:push:v2

# Open Prisma Studio for V2 database
pnpm db:studio:v2
```

For V1 environment, use the standard commands (no suffix):

```bash
pnpm dev
pnpm build
pnpm start
```

### Option 2: Switching the active environment

Switch the active `.env` file to use a specific environment:

```bash
# Switch to V1 (original database)
pnpm env:v1

# Switch to V2 (new database)
pnpm env:v2

# Show current environment
./scripts/switch-env.sh
```

After switching, run standard commands:

```bash
pnpm dev
pnpm build
pnpm start
```

## Database Operations

### Working with V2 Database

```bash
# Push schema changes to V2 database
pnpm db:push:v2

# Open Prisma Studio for V2 database
pnpm db:studio:v2

# Or switch environment first
pnpm env:v2
prisma db push
prisma studio
```

### Working with V1 Database

```bash
# Standard commands work with V1 when .env points to V1
prisma db push
prisma studio
```

## PostgreSQL MCP Tool Usage

When using the PostgreSQL MCP tool, make sure it's connected to the correct database:

1. Check current connection:
   ```bash
   echo $DATABASE_URL
   ```

2. The MCP tool will use the connection string from your environment. To use a specific database:
   - **V1**: Make sure `.env` contains V1 database URL
   - **V2**: Either use `pnpm dev:v2` or switch to V2 with `pnpm env:v2`

## Safety Features

### Automatic Backups

When switching environments with the switcher script, your current `.env` is automatically backed up based on its database URL:

- V1 database → `.env.v1`
- V2 database → `.env.v2`
- Unknown database → `.env.backup`

### Verification

Always verify which database you're connected to:

```bash
# Check current database
grep '^DATABASE_URL=' .env

# Or use the switcher to see current environment
./scripts/switch-env.sh
```

## Important Notes

⚠️ **CRITICAL DATABASE SAFETY RULES** ⚠️

1. **NEVER** run destructive commands without knowing which database is active
2. **NEVER** use `prisma db push --force-reset` on either database
3. **NEVER** run `prisma migrate reset` without explicit permission
4. **ALWAYS** verify the database URL before running schema changes
5. **ALWAYS** use the PostgreSQL MCP tool for database operations when available

## Workflow Examples

### Scenario 1: Testing new features on V2 without affecting V1

```bash
# Start development with V2
pnpm dev:v2

# Push schema changes to V2 only
pnpm db:push:v2

# V1 database remains untouched
```

### Scenario 2: Switching between databases during development

```bash
# Work on V1
pnpm env:v1
pnpm dev

# Switch to V2
pnpm env:v2
pnpm dev

# Back to V1
pnpm env:v1
pnpm dev
```

### Scenario 3: Using both environments simultaneously

```bash
# Terminal 1: Run V1
pnpm dev

# Terminal 2: Run V2 (on different port)
PORT=3001 pnpm dev:v2
```

## Troubleshooting

### Wrong database being used

1. Check active environment: `grep '^DATABASE_URL=' .env`
2. Switch to correct environment: `pnpm env:v1` or `pnpm env:v2`
3. Restart dev server

### Environment variables not loading

1. Make sure the environment file exists
2. Check file has correct format (no syntax errors)
3. Restart your terminal/IDE
4. Verify dotenv-cli is installed: `pnpm list dotenv-cli`

### Database connection issues

1. Verify the DATABASE_URL is correct
2. Check database is accessible (network, credentials)
3. Use PostgreSQL MCP tool to test connection
4. Check if database server is running

## File Structure

```
.
├── .env                    # Active environment (git-ignored)
├── .env.v1                 # V1 environment backup (git-ignored)
├── .env.v2                 # V2 environment backup (git-ignored)
├── .env.example            # Template for new environments
├── scripts/
│   └── switch-env.sh       # Environment switcher script
└── docs/
    └── MULTI_ENVIRONMENT_SETUP.md  # This file
```

## Adding New Environments

To add a new environment (e.g., V3):

1. Copy an existing environment file:
   ```bash
   cp .env.v2 .env.v3
   ```

2. Update DATABASE_URL in `.env.v3`

3. Add to `.gitignore`:
   ```
   .env.v3
   ```

4. Add npm scripts to `package.json`:
   ```json
   "dev:v3": "dotenv -e .env.v3 -- next dev --turbopack",
   "db:push:v3": "dotenv -e .env.v3 -- prisma db push"
   ```

5. Update switch-env.sh to support v3

## Best Practices

1. **Always use npm scripts with `:v2` suffix for V2 operations**
2. **Verify environment before database operations**
3. **Use descriptive commit messages mentioning which environment was modified**
4. **Keep both environment files updated with new variables**
5. **Document any environment-specific configurations**
6. **Use PostgreSQL MCP tool for database operations when available**

## Support

If you encounter issues:

1. Check this documentation
2. Verify environment files are correct
3. Check database connectivity
4. Review git status to ensure no sensitive files are staged
5. Ask for help with specific error messages
