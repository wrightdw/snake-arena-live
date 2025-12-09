# Deploying Snake Arena to Render

## Prerequisites

1. **GitHub Account** - Code must be in a GitHub repository
2. **Render Account** - Sign up at https://render.com (free)

## Deployment Methods

### Method 1: Blueprint (Recommended) - One-Click Deploy

This uses the `render.yaml` file to automatically set up everything.

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Add Render deployment config"
   git push origin main
   ```

2. **Create New Blueprint on Render**
   - Go to https://dashboard.render.com/blueprints
   - Click "New Blueprint Instance"
   - Connect your GitHub repository
   - Render will detect `render.yaml` and set up:
     - PostgreSQL database
     - Web service (unified app)
     - Environment variables
     - Auto-deploy on git push

3. **Wait for deployment** (5-10 minutes first time)
   - Database provisioning: ~2 minutes
   - Docker build: ~3-5 minutes
   - Service start: ~1 minute

4. **Access your app**
   - URL will be: `https://snake-arena-app.onrender.com`
   - Or set up custom domain

### Method 2: Manual Setup

If you prefer manual control:

#### Step 1: Create PostgreSQL Database

1. Dashboard → New → PostgreSQL
2. Name: `snake-arena-db`
3. Database: `snake_arena`
4. User: `snake_admin`
5. Region: Oregon (or your preferred region)
6. Plan: Free or Starter ($7/month)
7. Click "Create Database"
8. **Save the Internal Database URL** (starts with `postgresql://`)

#### Step 2: Create Web Service

1. Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Name**: `snake-arena-app`
   - **Region**: Oregon (match database)
   - **Branch**: main
   - **Runtime**: Docker
   - **Dockerfile Path**: `./Dockerfile.unified`
   - **Docker Build Context Directory**: `.`

#### Step 3: Set Environment Variables

Add these in the "Environment" tab:

```
DATABASE_URL=<paste Internal Database URL from Step 1>
SECRET_KEY=<generate with: openssl rand -hex 32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
USE_SQLITE=false
VITE_API_URL=/api
```

#### Step 4: Configure Health Check

- **Health Check Path**: `/health`

#### Step 5: Deploy

- Click "Create Web Service"
- Wait for build and deployment (~5-10 minutes)

## Configuration Options

### Scaling

Edit `render.yaml` to change instance size:

```yaml
plan: starter      # $7/month  - 512 MB RAM, 0.5 CPU
plan: standard     # $25/month - 2 GB RAM, 1 CPU
plan: pro          # $85/month - 4 GB RAM, 2 CPU
```

### Auto-Deploy

Enabled by default. Every `git push` to main triggers deployment.

To disable:
```yaml
autoDeploy: false
```

### Custom Domain

1. Dashboard → Your Service → Settings
2. Scroll to "Custom Domain"
3. Add your domain (e.g., `snakearena.com`)
4. Update DNS records as instructed
5. Render handles SSL automatically

### Environment-Specific Branches

Deploy different branches to different services:

```yaml
# Production
branch: main

# Staging (create second service)
branch: staging
name: snake-arena-staging
```

## Monitoring & Logs

### View Logs
```bash
# Install Render CLI
npm install -g @renderinc/cli

# Login
render login

# Tail logs
render logs snake-arena-app
```

Or view in dashboard: Service → Logs

### Metrics

Dashboard shows:
- CPU usage
- Memory usage
- Request count
- Response times
- Error rates

### Alerts

Set up in Dashboard → Service → Settings → Notifications:
- Deploy failures
- Health check failures
- High resource usage

## Database Management

### Access Database

```bash
# Get connection string from dashboard
# Then connect with psql:
psql <EXTERNAL_DATABASE_URL>
```

### Backups

Render automatically backs up paid databases:
- Daily backups kept for 7 days
- Weekly backups kept for 4 weeks

Restore from Dashboard → Database → Backups

### Migrations

Run migrations after deployment:

```bash
# Via Render Shell (Dashboard → Service → Shell)
cd /app/backend
python -c "from app.db import init_db; init_db()"
```

Or add to `entrypoint.sh` to run automatically.

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run tests
        run: |
          cd frontend && npm install && npm test
          cd ../backend && pip install -r requirements.txt && pytest
      
      - name: Trigger Render Deploy
        if: success()
        run: |
          curl -X POST \
            https://api.render.com/deploy/srv-${{ secrets.RENDER_SERVICE_ID }}?key=${{ secrets.RENDER_API_KEY }}
```

Get API key from: Dashboard → Account Settings → API Keys

## Troubleshooting

### Build Fails

Check logs:
- Dashboard → Service → Events
- Look for Docker build errors
- Common issue: Missing files (check `.renderignore`)

### Health Check Fails

- Verify `/health` endpoint works locally
- Check `healthCheckPath` in render.yaml
- Increase startup time if needed

### Database Connection Issues

- Verify `DATABASE_URL` is set correctly
- Check database region matches service region
- Ensure database is running (Dashboard → Database → Status)

### Port Issues

Render expects your app on port 80 (or 443 for HTTPS). The unified container exposes port 80, so this should work automatically.

## Costs Estimate

### Development/Testing
- Free PostgreSQL: $0
- Starter Web Service: $7/month
- **Total: $7/month**

### Production
- Starter PostgreSQL: $7/month
- Standard Web Service: $25/month
- Custom domain: Included
- SSL: Included
- **Total: $32/month**

### Enterprise
- Pro+ PostgreSQL: $25+/month
- Pro Web Service: $85/month
- Multiple instances for HA
- **Total: $110+/month**

## Performance Optimization

### Enable CDN

Add to `render.yaml`:
```yaml
headers:
  - path: /assets/*
    name: Cache-Control
    value: public, max-age=31536000, immutable
```

### Add Redis (Optional)

For session storage or caching:

```yaml
databases:
  - name: snake-arena-redis
    plan: starter
    region: oregon
```

Then update app to use Redis.

## Next Steps

1. **Push to GitHub**: `git push origin main`
2. **Create Blueprint**: https://dashboard.render.com/blueprints
3. **Monitor deployment**: Watch the logs
4. **Test application**: Visit your Render URL
5. **Set up custom domain** (optional)
6. **Configure monitoring/alerts**

Your app will be live at: `https://snake-arena-app.onrender.com`

## Support

- Documentation: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com
