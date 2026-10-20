# Daymark task manager

A responsive React + Vite task manager backed by Firebase Authentication and Cloud Firestore. Tasks are scoped to the signed-in user, synchronized in real time, and cached for offline use.

Use the moon/sun appearance control to switch between light and dark themes. The selection is saved in the browser; the first visit follows the device's appearance preference.

## Run locally

1. Create a Firebase project and register a Web app.
2. Enable **Email/Password** and **Google** providers in Firebase Authentication.
3. Create a Cloud Firestore database.
4. Copy `.env.example` to `.env.local` and enter the Web app configuration values. In PowerShell, run `Copy-Item .env.example .env.local`; then replace each placeholder with its matching value from Firebase Console → Project settings → Your apps → SDK setup and configuration.
5. Install and run:

   ```sh
   npm install
   npm run dev
   ```

6. Deploy `firestore.rules` and `firestore.indexes.json` to the Firebase project. The index supports the per-user task query ordered by newest first.

Restart the Vite development server after changing `.env.local`; Vite reads environment variables when it starts. The app shows setup instructions instead of initializing Firebase when configuration is missing.

The included `firebase.json` also configures Firebase Hosting to serve the Vite build and apply the Firestore rules/indexes. After installing the Firebase CLI and selecting your project, deploy with `firebase deploy`.

Firestore's persistent local cache uses IndexedDB and supports multiple tabs. Browser storage restrictions or private-browsing policies may disable persistence; online synchronization continues to work.

## Data model

Documents in `tasks` use an auto-generated document ID and include `userId`, `title`, `description`, `isCompleted`, `priority`, `createdAt`, and `updatedAt`. `dueDate` is omitted unless set. Timestamps are written using Firestore server timestamps. Security rules validate task ownership and the document shape.

## Firebase environment variables

Vite exposes only variables prefixed with `VITE_` to browser code. Firebase web configuration is public client configuration, not a service-account credential. Keep privileged credentials out of this application.
