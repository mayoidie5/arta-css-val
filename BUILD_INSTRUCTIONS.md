# Vercel Deployment Guide for ARTA CSS Dashboard

## Prerequisites

1. Node.js 18.x or higher...
2. A Vercel account
3. Firebase project with Firestore configured
4. GitHub repository with your code

## Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/mayoidie5/Arta1.git
cd Arta1
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Firebase
Create a `.env.local` file in the root directory and add your Firebase credentials:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

See `.env.example` for the template.

### 4. Run development server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. Build for production
```bash
npm run build
```

This creates a `build/` directory with the production-ready files.

## Vercel Deployment

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy
vercel
```

When prompted, configure your project settings:
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `build`

### Option 2: Deploy via GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Vite configuration
6. Add environment variables in Project Settings:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`

7. Click "Deploy"

## Firestore Security Setup

Make sure your Firestore rules allow read/write access for authenticated users:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /responses/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /users/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Build Fails with "Module not found"
- Run `npm install` to ensure all dependencies are installed
- Check that all imported modules are listed in `package.json`

### Firebase authentication errors
- Verify environment variables are set correctly
- Check that Firestore rules allow authenticated access
- Ensure Firebase project credentials are valid

### CORS errors
- Add your Vercel domain to Firebase authorized domains:
  - Firebase Console → Authentication → Settings → Authorized domains
  - Add your Vercel production URL (e.g., `your-app.vercel.app`)

## File Structure

```
ARTA-Compliant CSS PWA Design (Copy)/
├── src/                      # Source files
│   ├── App.tsx              # Main app component
│   ├── components/          # React components
│   ├── services/            # Firebase services
│   ├── context/             # React context (Auth)
│   └── firebase.ts          # Firebase configuration
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── vercel.json              # Vercel deployment config
├── package.json             # Dependencies and scripts
├── .env.example             # Environment variables template
└── .gitignore               # Git ignore rules
```

## Next Steps

After successful deployment:

1. Test the admin dashboard login
2. Verify Firebase data sync works in production
3. Configure custom domain (optional)
4. Set up analytics and monitoring
5. Configure automatic deployments for new commits

## Support

For issues:
1. Check Vercel deployment logs
2. Review Firebase Firestore rules
3. Verify environment variables are set
4. Check browser console for errors
