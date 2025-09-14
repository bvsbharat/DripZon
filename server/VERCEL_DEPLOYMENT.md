# Vercel Deployment Guide

This guide will help you deploy your Memory Service to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally with `npm i -g vercel`
3. **Environment Variables**: Have all your API keys ready

## Deployment Steps

### 1. Install Vercel CLI (if not already installed)
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Navigate to the server directory
```bash
cd /Users/admin/Desktop/next-gen-e-com/server
```

### 4. Deploy to Vercel
```bash
vercel
```

Follow the prompts:
- **Set up and deploy**: Yes
- **Which scope**: Choose your account/team
- **Link to existing project**: No (for first deployment)
- **Project name**: Accept default or choose a name
- **Directory**: `.` (current directory)
- **Override settings**: No

### 5. Set Environment Variables

After deployment, you need to add your environment variables:

```bash
vercel env add MEM0_API_KEY
vercel env add ELEVENLABS_API_KEY
vercel env add AGENT_ID
vercel env add GROQ_API_KEY
vercel env add MEMGRAPH_URI
vercel env add MEMGRAPH_USERNAME
vercel env add MEMGRAPH_PASSWORD
vercel env add MEMGRAPH_USE_SSL
vercel env add DEFAULT_USER_ID
vercel env add DEFAULT_USER_NAME
vercel env add DEFAULT_USER_EMAIL
```

For each variable, you'll be prompted to:
1. Enter the value
2. Select environments (choose Production, Preview, and Development)

### 6. Redeploy with Environment Variables
```bash
vercel --prod
```

## Alternative: Deploy via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Set the **Root Directory** to `server`
5. Add all environment variables in the Environment Variables section
6. Click "Deploy"

## Environment Variables Required

| Variable | Description | Example |
|----------|-------------|----------|
| `MEM0_API_KEY` | Mem0 API key | `m0-xxxxx` |
| `ELEVENLABS_API_KEY` | ElevenLabs API key | `sk_xxxxx` |
| `AGENT_ID` | ElevenLabs Agent ID | `agent_xxxxx` |
| `GROQ_API_KEY` | Groq API key | `gsk_xxxxx` |
| `MEMGRAPH_URI` | Memgraph connection URI | `bolt+ssc://host:7687` |
| `MEMGRAPH_USERNAME` | Memgraph username | `your-email@domain.com` |
| `MEMGRAPH_PASSWORD` | Memgraph password | `your-password` |
| `MEMGRAPH_USE_SSL` | Use SSL for Memgraph | `true` |
| `DEFAULT_USER_ID` | Default user ID | `nanu` |
| `DEFAULT_USER_NAME` | Default user name | `nanu` |
| `DEFAULT_USER_EMAIL` | Default user email | `user@domain.com` |

## Testing Your Deployment

Once deployed, test your endpoints:

1. **Health Check**:
   ```bash
   curl https://your-project.vercel.app/health
   ```

2. **Add Memory**:
   ```bash
   curl -X POST https://your-project.vercel.app/api/add \
     -H "Content-Type: application/json" \
     -d '{"message": "Test memory", "user_id": "test_user"}'
   ```

3. **Search Memories**:
   ```bash
   curl -X POST https://your-project.vercel.app/api/search \
     -H "Content-Type: application/json" \
     -d '{"message": "test", "user_id": "test_user"}'
   ```

## Updating Your Frontend

Update your frontend to use the new Vercel URL:

```javascript
// Replace localhost with your Vercel URL
const API_BASE_URL = 'https://your-project.vercel.app';
```

## Troubleshooting

### Common Issues:

1. **Function Timeout**: Vercel has a 10-second timeout for Hobby plans
2. **Environment Variables**: Make sure all required variables are set
3. **CORS Issues**: Update CORS origins in the code to include your frontend domain

### Checking Logs:
```bash
vercel logs your-project-url
```

### Redeploying:
```bash
vercel --prod
```

## Production Considerations

1. **Custom Domain**: Add a custom domain in Vercel dashboard
2. **Monitoring**: Set up monitoring and alerts
3. **Rate Limiting**: Consider implementing rate limiting
4. **Caching**: Implement caching for better performance
5. **Security**: Review and secure all API endpoints

## Support

If you encounter issues:
1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review function logs in Vercel dashboard
3. Test locally first with `vercel dev`

---

**Note**: This deployment uses Vercel's serverless functions. Each API call will be a separate function invocation, which is perfect for this type of service.