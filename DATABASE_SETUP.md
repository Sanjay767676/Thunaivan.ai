# Database Setup Guide - Neon PostgreSQL

## Why Neon PostgreSQL?

Your application is already configured for **PostgreSQL** (not MongoDB). Neon is the best choice because:
- ✅ Free tier available
- ✅ Serverless (no server management)
- ✅ Works with your existing Drizzle ORM setup
- ✅ Easy to set up

## Step-by-Step Setup

### 1. Create a Neon Account
1. Go to https://neon.tech
2. Sign up for a free account (GitHub/Google login available)
3. Create a new project

### 2. Get Your Connection String
1. In your Neon dashboard, click on your project
2. Go to "Connection Details" or "Connection String"
3. Copy the connection string (it looks like):
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

### 3. Add to Your .env File
Add this line to your `.env` file:
```env
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

### 4. Run Database Migrations
After setting up DATABASE_URL, run:
```bash
npm run db:push
```

This will create the necessary tables in your Neon database.

## Alternative: Local PostgreSQL

If you prefer to run PostgreSQL locally:

### Using Docker:
```bash
docker run --name thunaivan-db -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=thunaivan -p 5432:5432 -d postgres
```

Then in `.env`:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/thunaivan
```

### Using PostgreSQL Installation:
1. Install PostgreSQL from https://www.postgresql.org/download/
2. Create a database:
   ```sql
   CREATE DATABASE thunaivan;
   ```
3. Add to `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/thunaivan
   ```

## Database Schema

Your application uses these tables:
- `pdf_metadata` - Stores uploaded PDF information
- `conversations` - Stores chat conversations
- `messages` - Stores chat messages

All tables are automatically created when you run `npm run db:push`.

## Troubleshooting

### Connection Issues
- Make sure your connection string includes `?sslmode=require` for Neon
- Check that your IP is allowed (Neon allows all by default on free tier)
- Verify the connection string is correct

### Migration Issues
- Ensure DATABASE_URL is set before running `npm run db:push`
- Check that you have write permissions on the database

## Free Tier Limits (Neon)

- **Storage**: 3 GB
- **Compute**: 0.5 vCPU, 1 GB RAM
- **Projects**: Unlimited
- **Perfect for development and small projects!**

