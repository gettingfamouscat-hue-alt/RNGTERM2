# Deployment Guide

## Vercel Deployment

### Prerequisites

1. **Neon Postgres Database** (free tier available)
   - Sign up at [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string (starts with `postgresql://`)

### Required Environment Variables

Set these in your Vercel project settings:

```bash
# Database (Neon Postgres connection string)
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# Admin credentials
ADMIN_USERNAME="your-admin-username"
ADMIN_PASSWORD="your-admin-password"

# Session secret (generate a secure random string, min 32 chars)
SESSION_SECRET="your-secure-random-secret-min-32-characters-long"
```

### Database Setup

After deploying with environment variables set:

1. Run migrations to create tables:
   ```bash
   npx prisma migrate deploy
   ```

2. Seed the database with badges:
   ```bash
   npx tsx prisma/seed.ts
   ```

You can run these commands:
- Locally (with DATABASE_URL pointing to Neon)
- Or via Vercel CLI: `vercel env pull .env.local && npm run db:setup`

### Post-Deployment

1. Visit your deployed URL
2. Click "ROLL NOW" to test the roll functionality
3. Navigate to `/admin` to access the admin panel
4. Log in with your ADMIN_USERNAME and ADMIN_PASSWORD

## Database Migration from SQLite

If you're migrating from the original SQLite version:

1. **Export existing data** (if needed):
   ```bash
   # Backup SQLite data
   sqlite3 dev.db .dump > backup.sql
   ```

2. **Update DATABASE_URL** to your Neon Postgres connection string

3. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

4. **Seed badges**:
   ```bash
   npx tsx prisma/seed.ts
   ```

## Troubleshooting

### "Failed to perform roll" or "Failed to get or create player"
- Check that DATABASE_URL is correctly set and accessible
- Verify migrations have been run: `npx prisma migrate status`
- Check Vercel logs for detailed error messages

### Admin login not working
- Verify ADMIN_USERNAME and ADMIN_PASSWORD are set in Vercel
- Check SESSION_SECRET is set and is at least 32 characters

### Database connection errors
- Ensure your Neon database is active (free tier sleeps after inactivity)
- Verify the connection string includes `?sslmode=require`
- Check that your Neon project allows connections from Vercel IPs

## Local Development

1. Create `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update DATABASE_URL with your Neon connection string

3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

4. Seed database:
   ```bash
   npx tsx prisma/seed.ts
   ```

5. Start dev server:
   ```bash
   npm run dev
   ```
