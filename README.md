# Yarn Uniforms - Bilingual Ordering Platform

A Next.js 14 application for ordering uniforms across four sectors: Schools, Factories, Companies, and Hospitals. Built with Arabic/English bilingual support and client-side logic to stay within Firebase Spark (free) plan.

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS with RTL support
- **Backend:** Firebase (Firestore, Storage, Auth)
- **Deployment:** GitHub Pages (Static Export)

## 📋 Features

1. **Dynamic Forms:** Sector-specific forms generated from `questionsConfig.js`
2. **Order Tracking:** Client-side order tracking with unique IDs (#YARN-XXXX)
3. **Admin Dashboard:** Protected route for order management
4. **Bilingual:** Full Arabic and English support with RTL

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database and Storage
3. Enable Authentication (Email/Password for admin)
4. Copy your Firebase config and paste it into `src/lib/firebase.js`

### 3. Deploy Firestore Rules

Copy the contents of `firestore.rules` to your Firebase Console:
- Go to Firestore Database → Rules
- Paste the rules and publish

### 4. Configure for GitHub Pages

In `next.config.js`, update the `basePath` if deploying to a subdirectory:
```javascript
basePath: '/your-repo-name', // Only if deploying to username.github.io/repo-name
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Build for Production

```bash
npm run build
```

This creates a static export in the `out/` directory.

## 🚢 Deployment

The project auto-deploys to GitHub Pages via GitHub Actions:

1. Push to `main` branch
2. GitHub Actions builds and deploys automatically
3. Enable GitHub Pages in repo settings (Source: GitHub Actions)

## 📝 Editing Questions

To modify sector questions, edit `src/config/questionsConfig.js`. Each sector has an array of question objects with bilingual labels.

## 🔒 Security

- Firestore rules prevent order ID collisions
- Client-side ID generation with server validation
- Admin-only access for order status updates
- No Cloud Functions required (stays on Spark plan)

## 📁 Project Structure

```
src/
├── app/          # Next.js pages (App Router)
├── components/   # React components
├── lib/          # Firebase & utilities
├── config/       # Questions configuration
├── hooks/        # Custom React hooks
└── utils/        # Helper functions
```

## 🌐 Domain Configuration

For custom domain (yarnuniforms.com.sa):
1. Add a `CNAME` file in `public/` with your domain
2. Configure DNS in your domain registrar
3. Enable custom domain in GitHub Pages settings

## 📧 Support

For questions or issues, contact the development team.

---

Built with ❤️ for Yarn Uniforms
