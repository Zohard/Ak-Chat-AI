# Deployment Guide: AI Anime Admin Agent

## Quick Start (5 Minutes)

### Step 1: Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key

### Step 2: Configure Environment
```bash
cd /home/zohardus/www/ai-orchestrator
cp .env.local.example .env.local.local
```

Edit `.env.local`:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
NESTJS_API_BASE=https://ak-api-production.up.railway.app
NUXT_ORIGIN=http://localhost:3000
```

### Step 3: Install & Run
```bash
# Install Next.js dependencies
npm install

# Install Nuxt dependencies
cd ../frontendv2
npm install @ai-sdk/vue marked

# Start AI Orchestrator (Terminal 1)
cd ../ai-orchestrator
npm run dev

# Start Nuxt Frontend (Terminal 2)
cd ../frontendv2
npm run dev
```

### Step 4: Test
1. Open `http://localhost:3000/admin/ai-assistant`
2. Type: "Find anime Attack on Titan"
3. The AI should search and respond!

## Production Deployment

### Option A: Vercel (Recommended)

#### Deploy Next.js AI Orchestrator
```bash
cd ai-orchestrator
vercel
```

Follow prompts:
- Project name: `anime-kun-ai`
- Framework: Next.js
- Root directory: `./`

Add environment variables in Vercel Dashboard:
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `NESTJS_API_BASE`
- `NUXT_ORIGIN` (your production Nuxt URL)

#### Setup Rate Limiting (Optional)
1. In Vercel Dashboard → Storage → Create Database → KV
2. Link to your project
3. Environment variables will be auto-added

### Option B: Self-Hosted (Docker)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

Build & Run:
```bash
docker build -t anime-ai .
docker run -p 3001:3001 \
  -e GOOGLE_GENERATIVE_AI_API_KEY=your_key \
  -e NESTJS_API_BASE=https://your-api.com \
  -e NUXT_ORIGIN=https://your-frontend.com \
  anime-ai
```

### Update Nuxt Production Config

In `frontendv2/.env.production`:
```env
AI_CHAT_ENDPOINT=https://your-ai-orchestrator.vercel.app/api/chat
```

## Monitoring

### Check Gemini Usage
- Visit [Google AI Studio Quotas](https://aistudio.google.com/app/prompts)
- Free tier: 60 requests/minute

### Check Rate Limits
If using Vercel KV:
- Visit Vercel Dashboard → Storage → KV
- Check usage stats

### Logs
```bash
# Next.js logs
vercel logs

# Self-hosted logs
docker logs anime-ai
```

## Troubleshooting

### AI Not Responding
1. Check Gemini API key is valid
2. Check CORS settings (NUXT_ORIGIN matches your frontend)
3. Check browser console for errors

### Rate Limit Issues
1. Increase `RATE_LIMIT_MAX` in environment
2. Or disable by not setting KV variables

### Authentication Errors
Ensure Nuxt sends:
```typescript
headers: {
  Authorization: `Bearer ${auth.token}`,
  'X-User-Id': String(auth.user?.idUtilisateur),
}
```

## Cost Estimation

### Free Tier (Development)
- **Gemini**: 60 requests/min = ~86,400 requests/day
- **Vercel**: 100GB bandwidth/month
- **KV Redis**: 30,000 commands/month
- **Total**: $0/month ✅

### Paid Tier (Production, 1000 users/day)
Assuming 5 requests/user/day = 5,000 requests/day:

- **Gemini**: Free (under 60/min)
- **Vercel Pro**: $20/month
- **KV Redis**: $10/month (upgrade if >30k commands)
- **Total**: ~$30/month

## Security Checklist

- [x] JWT authentication required
- [x] CORS restricted to allowed origins
- [x] Rate limiting enabled
- [x] Environment variables not committed
- [x] HTTPS in production
- [x] Input validation with Zod
- [x] Error messages don't leak sensitive info

## Backup Plan

If Gemini is down or quota exceeded:

1. **Fallback to Basic Search**: Disable AI chat, show traditional search form
2. **Increase Rate Limits**: Upgrade to paid Gemini tier
3. **Switch Models**: Change to `gemini-1.5-pro` for higher quota

## Next Steps

1. **Add More Tools**: Bulk operations, advanced filters
2. **Voice Input**: Add speech-to-text for mobile
3. **Analytics**: Track common questions to improve prompts
4. **Multi-language**: Support English, Japanese queries

## Support

- **Documentation**: See `README.md`
- **Issues**: Create GitHub issue
- **Contact**: Development team

---

Last updated: 2025-12-24
