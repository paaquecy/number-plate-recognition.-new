# Netlify Deployment Guide for ANPR Project

## Prerequisites
- Your project is already pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- You have a Netlify account

## Step 1: Connect to Netlify

### Option A: Deploy via Netlify UI
1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Connect your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your ANPR repository: `number-plate-recognition.-new`
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`
6. Click "Deploy site"

### Option B: Deploy via Netlify CLI
1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Initialize and deploy:
   ```bash
   cd number-plate-recognition.-new
   netlify init
   ```

## Step 2: Environment Variables (if needed)

If your app uses environment variables (like API keys), add them in Netlify:
1. Go to Site settings → Environment variables
2. Add any required environment variables

## Step 3: Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Add your custom domain
3. Configure DNS settings as instructed

## Step 4: Continuous Deployment

Your site will automatically redeploy when you push changes to your main branch.

## Build Configuration

The project is configured with:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18
- **SPA redirects**: Configured for React Router

## Troubleshooting

### Common Issues:
1. **Build fails**: Check the build logs in Netlify dashboard
2. **404 errors**: The `netlify.toml` includes SPA redirects for React Router
3. **Environment variables**: Make sure to add them in Netlify dashboard

### Local Testing:
Test the build locally before deploying:
```bash
npm run build
npm run preview
```

## Project Structure for Deployment

```
number-plate-recognition.-new/
├── netlify.toml          # Netlify configuration
├── vite.config.ts        # Vite build configuration
├── package.json          # Dependencies and scripts
├── src/                  # React source code
└── dist/                 # Build output (generated)
```

## Next Steps

After deployment:
1. Test your application thoroughly
2. Set up any required environment variables
3. Configure custom domain if needed
4. Set up form handling if your app has forms
5. Configure analytics if needed

Your ANPR application should now be live on Netlify! 🚀
