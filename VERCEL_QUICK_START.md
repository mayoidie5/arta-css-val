# Quick Start: Deploy to Vercel

## ⚡ 5-Minute Deployment

### Step 1: Prepare Your Code
```bash
# Navigate to project directory
cd "ARTA-Compliant CSS PWA Design (Copy)"

# Verify build works locally
npm install
npm run build

# Should see "✓ built in X.XXs"
```

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin Admin-Dashboard-Updating
```

### Step 3: Connect to Vercel
1. Go to **[vercel.com](https://vercel.com)** and sign in
2. Click **"Add New..." → "Project"**
3. Select your GitHub repository (may need to authorize first)
4. Click **"Import"**

### Step 4: Configure Build Settings
Vercel should auto-detect settings, but verify:

| Setting | Value |
|---------|-------|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `build` |
| Install Command | `npm install` |

### Step 5: Add Environment Variables
Click **"Environment Variables"** and add:

```
VITE_FIREBASE_API_KEY = AIzaSyAgZV5W_AauAn8X7r7kOjtIcjUSj0g_ISw
VITE_FIREBASE_AUTH_DOMAIN = arta-a6d0f.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = arta-a6d0f
VITE_FIREBASE_STORAGE_BUCKET = arta-a6d0f.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 714515987128
VITE_FIREBASE_APP_ID = 1:714515987128:web:264b4a9f4c807a834d124d
VITE_FIREBASE_MEASUREMENT_ID = G-RXZRSWQ14B
```

### Step 6: Deploy
Click **"Deploy"** and wait for the build to complete.

## ✅ Post-Deployment Checklist

- [ ] Dashboard loads without errors
- [ ] Admin login works
- [ ] Firebase data syncs in real-time
- [ ] Charts display correctly
- [ ] No console errors in browser DevTools
- [ ] Live indicator shows in header
- [ ] New survey responses appear instantly

## 🔗 Vercel Domain
After deployment, your app will be available at:
```
https://arta-[random].vercel.app
```

## 📝 Update Firebase Authorized Domains

Important: Add your Vercel URL to Firebase:

1. Go to **[Firebase Console](https://console.firebase.google.com)**
2. Select **"arta-a6d0f"** project
3. Go to **Authentication → Settings**
4. In **Authorized domains**, add:
   - Your Vercel URL (e.g., `arta-main.vercel.app`)
   - Your custom domain (if using one)

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check npm logs, ensure `npm install` succeeds locally |
| Firebase errors | Verify environment variables are set in Vercel dashboard |
| CORS errors | Add Vercel domain to Firebase authorized domains |
| Blank page | Open DevTools (F12), check console for errors |

## 🚀 Next Steps

1. **Set custom domain** (optional)
   - Vercel → Settings → Domains → Add Domain

2. **Enable continuous deployment**
   - Automatic redeploys on push to `Admin-Dashboard-Updating` branch

3. **Set up production environment**
   - Configure preview deployments
   - Add production domain to Firebase

## 📞 Need Help?

- Check **BUILD_INSTRUCTIONS.md** for detailed guide
- Review **VERCEL_DEPLOYMENT_FIXES.md** for technical details
- See **FIREBASE_INTEGRATION.md** for Firebase setup
