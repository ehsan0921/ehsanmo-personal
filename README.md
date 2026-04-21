# Personal WebsiteTools

Personal site and utilities by Ehsan Mokhtary: landing page at the root and tools (including the **Perforated Panel Designer** under `/Image-Panel-perforated-designer/`).

**GitHub:** Rename the repository to `Personal-WebsiteTools` (Settings → General → Repository name; spaces are not allowed). Then point your local remote:

`git remote set-url origin https://github.com/ehsan0921/Personal-WebsiteTools.git`

## Perforated Panel Designer

A client-side web application for designing perforated panels with customizable hole patterns based on image input.

## Features

- **Image-based Pattern Generation**: Upload an image to generate hole patterns
- **Flexible Panel Layout**: Subdivide panels with custom dimensions
- **Multiple Export Formats**: PNG, DXF, SVG, and settings file
- **User Authentication**: Firebase-based authentication with role-based access
- **Admin Panel**: User management and download statistics

## Setup

### 1. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable Email/Password
   - Enable Google Sign-in
3. Create Firestore Database:
   - Go to Firestore Database
   - Create database in test mode (or set up security rules)
4. Update `index.html` with your Firebase config:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT_ID.appspot.com",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

### 2. Firestore Security Rules

Add these rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can write to loginLogs and downloads
    match /loginLogs/{logId} {
      allow read, write: if request.auth != null;
    }
    
    match /downloads/{downloadId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Cloudflare Pages Deployment

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Set environment variables in Cloudflare Pages:
   - Go to your Pages project → Settings → Environment Variables
   - Add:
     - `ADMIN_USERNAME`: Your admin username
     - `ADMIN_PASSWORD`: Your admin password

4. Deploy:
   ```bash
   wrangler pages deploy .
   ```

Or connect your GitHub repository to Cloudflare Pages for automatic deployments.

## User Roles

### Guest Users
- Can download PNG images
- Can download settings (.txt) files
- Cannot download DXF or SVG files

### Registered Users
- All guest permissions
- Can download DXF files
- Can download SVG files
- Download activity is tracked

### Admin
- Access to admin panel
- View all users
- View download statistics
- Login with credentials set in environment variables

## Usage

1. Upload a source image
2. Configure panel dimensions and hole specifications
3. Adjust alignment and display options
4. Generate pattern
5. Download in your preferred format

## License

MIT License
