# Azure Deployment Guide

This guide walks you through deploying the Resume Screening application to Azure App Service using GitHub Actions.

## Prerequisites

- Azure account ([Get free account](https://azure.microsoft.com/free/))
- GitHub account
- Azure CLI installed ([Install guide](https://docs.microsoft.com/cli/azure/install-azure-cli))

## Step 1: Create Azure App Service

### Option A: Using Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource" → "Web App"
3. Configure:
   - **Subscription**: Your subscription
   - **Resource Group**: Create new (e.g., `resume-screening-rg`)
   - **Name**: `resume-screening-app` (or your unique name)
   - **Publish**: Code
   - **Runtime stack**: Python 3.11
   - **Operating System**: Linux
   - **Region**: Choose nearest region
   - **Pricing Plan**: B1 or higher (F1 may be too limited)
4. Click "Review + Create" → "Create"

### Option B: Using Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create --name resume-screening-rg --location eastus

# Create App Service plan
az appservice plan create \
  --name resume-screening-plan \
  --resource-group resume-screening-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name resume-screening-app \
  --resource-group resume-screening-rg \
  --plan resume-screening-plan \
  --runtime "PYTHON:3.11"
```

## Step 2: Configure Environment Variables

In Azure Portal:
1. Go to your App Service
2. Settings → Configuration → Application settings
3. Add these settings (choose OpenAI OR Azure OpenAI):

**Option A: Using Standard OpenAI**

| Name | Value |
|------|-------|
| `OPENAI_API_KEY` | Your OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o` |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` |
| `WEBSITE_HTTPLOGGING_RETENTION_DAYS` | `7` |

**Option B: Using Azure OpenAI** (Recommended for Azure deployments)

| Name | Value |
|------|-------|
| `AZURE_OPENAI_API_KEY` | Your Azure OpenAI key |
| `AZURE_OPENAI_ENDPOINT` | `https://your-resource.openai.azure.com/` |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | Your deployment name (e.g., `gpt-4o`) |
| `AZURE_OPENAI_API_VERSION` | `2024-02-15-preview` |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` |
| `WEBSITE_HTTPLOGGING_RETENTION_DAYS` | `7` |

4. Click "Save"

### Using Azure CLI:

**For Standard OpenAI:**
```bash
az webapp config appsettings set \
  --name resume-screening-app \
  --resource-group resume-screening-rg \
  --settings \
    OPENAI_API_KEY="your-openai-key" \
    OPENAI_MODEL="gpt-4o" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="true"
```

**For Azure OpenAI:**
```bash
az webapp config appsettings set \
  --name resume-screening-app \
  --resource-group resume-screening-rg \
  --settings \
    AZURE_OPENAI_API_KEY="your-azure-key" \
    AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/" \
    AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o" \
    AZURE_OPENAI_API_VERSION="2024-02-15-preview" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="true"
```

## Step 3: Configure Startup Command

In Azure Portal:
1. Go to your App Service
2. Settings → Configuration → General settings
3. **Startup Command**: 
   ```
   gunicorn --bind=0.0.0.0:8000 --workers=4 --worker-class=uvicorn.workers.UvicornWorker --timeout=120 main:app
   ```
4. Click "Save"

Or using Azure CLI:

```bash
az webapp config set \
  --name resume-screening-app \
  --resource-group resume-screening-rg \
  --startup-file "gunicorn --bind=0.0.0.0:8000 --workers=4 --worker-class=uvicorn.workers.UvicornWorker --timeout=120 main:app"
```

## Step 4: Get Publish Profile

1. In Azure Portal, go to your App Service
2. Click "Get publish profile" (top menu)
3. Save the downloaded `.PublishSettings` file
4. Open the file and copy its entire contents

## Step 5: Configure GitHub Repository

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ResumeScreening.git
git push -u origin main
```

2. In GitHub repository:
   - Go to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Value: Paste the publish profile content
   - Click "Add secret"

## Step 6: Update Workflow File

Edit `.github/workflows/azure-deploy.yml`:

```yaml
env:
  AZURE_WEBAPP_NAME: resume-screening-app  # Change to your app name
```

## Step 7: Deploy

The GitHub Action will automatically trigger when you push to `main`:

```bash
git add .
git commit -m "Configure Azure deployment"
git push
```

Or manually trigger:
1. Go to GitHub → Actions tab
2. Select "Build and Deploy to Azure App Service"
3. Click "Run workflow"

## Step 8: Verify Deployment

1. Wait for GitHub Action to complete (check Actions tab)
2. Visit your app: `https://resume-screening-app.azurewebsites.net`
3. Check logs in Azure Portal → App Service → Log stream

## Monitoring & Troubleshooting

### View Application Logs

Azure Portal:
1. Go to App Service
2. Monitoring → Log stream

Or using Azure CLI:
```bash
az webapp log tail --name resume-screening-app --resource-group resume-screening-rg
```

### Enable Detailed Logging

```bash
az webapp log config \
  --name resume-screening-app \
  --resource-group resume-screening-rg \
  --application-logging filesystem \
  --level verbose
```

### Common Issues

**Issue: App shows "Application Error"**
- Check logs in Log stream
- Verify environment variables are set
- Ensure startup command is correct

**Issue: 502 Bad Gateway**
- Check if app is starting (may take 2-3 minutes)
- Verify Python version compatibility
- Check worker timeout settings

**Issue: OpenAI API errors**
- Verify `OPENAI_API_KEY` is set correctly
- Check API key has sufficient credits

**Issue: Frontend not loading**
- Verify GitHub Action completed successfully
- Check that `frontend/dist` was created during build
- Ensure static files were copied to `backend/static`

## Cost Optimization

- **B1 Plan**: ~$13/month (recommended minimum)
- **F1 Free Plan**: Available but limited (60 min/day CPU time)
- **Scaling**: Can scale up/down in Azure Portal

To reduce costs:
```bash
# Scale down when not in use
az appservice plan update --name resume-screening-plan \
  --resource-group resume-screening-rg \
  --sku F1
```

## Custom Domain (Optional)

1. Purchase domain
2. In Azure Portal → App Service → Custom domains
3. Add custom domain and configure DNS
4. Add SSL certificate (free with App Service Managed Certificate)

## Continuous Deployment

The GitHub Action automatically deploys when you push to `main`:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push  # Automatically deploys!
```

## Cleanup Resources

When done testing:

```bash
# Delete resource group (removes all resources)
az group delete --name resume-screening-rg --yes
```

## Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [GitHub Actions for Azure](https://github.com/Azure/actions)
- [Troubleshooting Python on App Service](https://docs.microsoft.com/azure/app-service/configure-language-python)
