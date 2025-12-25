# Deploy AI Orchestrator to Railway

## Why Railway?

✅ **Perfect fit** - Your NestJS backend is already on Railway
✅ **Easy deployment** - One command deploy
✅ **Free tier** - $5/month credit
✅ **Auto HTTPS** - Automatic SSL certificates
✅ **Environment variables** - Easy configuration

## Quick Deploy (5 Minutes)

### Step 1: Install Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
```

### Step 2: Initialize Project

```bash
cd /home/zohardus/www/ai-orchestrator

# Link to Railway (creates new project)
railway init
```

Choose:
- **Project name**: `anime-kun-ai-orchestrator`
- **Region**: Same as your NestJS backend (probably US West)

### Step 3: Add Environment Variables

```bash
# Add Gemini API key (get from https://makersuite.google.com/app/apikey)
railway variables set GOOGLE_GENERATIVE_AI_API_KEY="your_gemini_key_here"

# Add NestJS backend URL
railway variables set NESTJS_API_BASE="https://ak-api-production.up.railway.app"

# Add Nuxt origin (update after Nuxt is deployed)
railway variables set NUXT_ORIGIN="https://your-nuxt-app.up.railway.app"

# Optional: Rate limit
railway variables set RATE_LIMIT_MAX="500"
```

### Step 4: Deploy

```bash
# Deploy to Railway
railway up

# Get deployment URL
railway domain
```

Your AI orchestrator will be available at:
`https://anime-kun-ai-orchestrator-production.up.railway.app`

### Step 5: Update Nuxt Config

In your Nuxt project, update environment variable:

```bash
# In frontendv2/.env.local.production
AI_CHAT_ENDPOINT=https://anime-kun-ai-orchestrator-production.up.railway.app/api/chat
```

Or in Railway's Nuxt project settings:
```bash
railway variables set AI_CHAT_ENDPOINT="https://anime-kun-ai-orchestrator-production.up.railway.app/api/chat"
```

## Setup Rate Limiting with Upstash Redis

Railway doesn't have built-in Redis, but Upstash has a free tier!

### Option 1: Upstash Free Tier (Recommended)

1. **Create Upstash Account**: https://console.upstash.com/
2. **Create Redis Database**:
   - Click "Create Database"
   - Name: `anime-ai-ratelimit`
   - Region: Same as Railway (US West)
   - Type: Free (10,000 commands/day)

3. **Get Credentials**:
   - Click on your database
   - Copy `REST URL` and `REST Token`

4. **Add to Railway**:
```bash
railway variables set KV_REST_API_URL="https://your-db.upstash.io"
railway variables set KV_REST_API_TOKEN="your_token_here"
```

5. **Redeploy**:
```bash
railway up
```

### Option 2: Skip Rate Limiting (Development)

Just don't set the KV variables. Rate limiting will be disabled.

## Railway Configuration File

Create `railway.toml` for custom settings:

```toml
[build]
builder = "NIXPACKS"

[deploy]
numReplicas = 1
startCommand = "npm run start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[healthchecks]]
path = "/api/chat"
timeout = 30
interval = 60
```

## Environment Variables Checklist

| Variable | Required | Example |
|----------|----------|---------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | ✅ Yes | `AIzaSyC...` |
| `NESTJS_API_BASE` | ✅ Yes | `https://ak-api-production.up.railway.app` |
| `NUXT_ORIGIN` | ✅ Yes | `https://your-nuxt.up.railway.app` |
| `KV_REST_API_URL` | ❌ Optional | `https://your-db.upstash.io` |
| `KV_REST_API_TOKEN` | ❌ Optional | `AYxxx...` |
| `RATE_LIMIT_MAX` | ❌ Optional | `500` |
| `PORT` | ❌ Auto | Railway sets this |

## Monitoring in Railway

### View Logs
```bash
railway logs
```

Or in Railway Dashboard → Your Project → Deployments → Logs

### Check Metrics
Railway Dashboard shows:
- CPU usage
- Memory usage
- Request count
- Response times

### Set Alerts
Railway Dashboard → Settings → Notifications:
- Deployment failures
- High memory usage
- Crashes

## Cost Estimation

### Free Tier
Railway gives **$5/month credit**:
- AI Orchestrator: ~$3/month (1GB RAM, low traffic)
- **Remaining**: $2/month for other services

### Paid Tier (if needed)
If you exceed $5/month:
- **Hobby Plan**: $5/month + usage (~$8-10/month total)
- **Pro Plan**: $20/month + usage (for production)

## Custom Domain (Optional)

### Add Custom Domain

1. Railway Dashboard → Your Project → Settings → Domains
2. Click "Add Domain"
3. Enter: `ai.anime-kun.com` (or your domain)
4. Add CNAME record to your DNS:
   ```
   CNAME ai [your-railway-url].up.railway.app
   ```

### Update CORS

```bash
railway variables set NUXT_ORIGIN="https://anime-kun.com,https://www.anime-kun.com"
```

## Troubleshooting

### Build Fails

**Error**: "Module not found"
```bash
# Ensure all dependencies are in package.json
npm install --save ai @ai-sdk/google zod

# Commit and redeploy
git add package.json package-lock.json
git commit -m "Fix dependencies"
railway up
```

### CORS Issues

**Error**: "Access-Control-Allow-Origin"
```bash
# Check NUXT_ORIGIN matches your frontend URL exactly
railway variables

# Update if needed
railway variables set NUXT_ORIGIN="https://your-exact-frontend-url.up.railway.app"
```

### Rate Limit Not Working

**Check KV variables**:
```bash
railway variables
```

If not set, rate limiting is disabled (this is OK for development).

### Port Issues

Railway automatically sets `PORT` environment variable. The app listens on port 3001 by default but Railway will proxy it.

**No action needed** - Railway handles port mapping.

## Deployment Workflow

### Development → Production

```bash
# 1. Test locally
cd /home/zohardus/www/ai-orchestrator
npm run dev

# 2. Commit changes
git add .
git commit -m "Update AI orchestrator"

# 3. Deploy to Railway
railway up

# 4. Verify
railway logs
curl https://your-app.up.railway.app/api/chat
```

### Rollback if Needed

```bash
# View deployments
railway status

# Rollback to previous deployment
railway rollback
```

## Connect to Existing Railway Services

If you want to use the same Railway project as your NestJS backend:

```bash
# Link to existing project
railway link [project-id]

# Create new service in the same project
railway service

# This keeps everything together in one Railway project
```

## Next Steps

1. **Deploy AI Orchestrator**:
   ```bash
   cd /home/zohardus/www/ai-orchestrator
   railway init
   railway variables set GOOGLE_GENERATIVE_AI_API_KEY="your_key"
   railway variables set NESTJS_API_BASE="https://ak-api-production.up.railway.app"
   railway up
   ```

2. **Get Deployment URL**:
   ```bash
   railway domain
   ```

3. **Update Nuxt**:
   - Add AI endpoint URL to Nuxt environment variables
   - Redeploy Nuxt frontend

4. **Test**:
   - Open `https://your-nuxt-app.up.railway.app/admin/ai-assistant`
   - Try: "Find anime Attack on Titan"

5. **Optional - Add Redis**:
   - Create Upstash account
   - Add KV variables
   - Redeploy

## Railway vs Vercel Comparison

| Feature | Railway | Vercel |
|---------|---------|--------|
| **Next.js Support** | ✅ Yes | ✅ Yes |
| **Free Tier** | $5/month credit | 100GB bandwidth |
| **Built-in Redis** | ❌ No (use Upstash) | ✅ Yes (KV) |
| **Same Platform as NestJS** | ✅ Yes | ❌ No |
| **Custom Domains** | ✅ Yes | ✅ Yes |
| **CLI** | ✅ Yes | ✅ Yes |
| **Best For** | Full-stack apps | Frontend apps |

**Recommendation**: Use **Railway** to keep everything together with your NestJS backend!

## Support

- **Railway Docs**: https://docs.railway.app/
- **Railway Discord**: https://discord.gg/railway
- **Upstash Docs**: https://docs.upstash.com/

---

Last updated: 2025-12-24
