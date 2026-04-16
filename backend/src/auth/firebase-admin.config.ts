import * as admin from 'firebase-admin';

// Firebase Admin SDK configuration
const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID || 'motorwayoil-multi-business',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin (only if not already initialized)
let firebaseApp: admin.app.App;

if (!admin.apps.length) {
    // For development: allow initialization without service account
    if (process.env.NODE_ENV === 'development' && !firebaseConfig.clientEmail) {
        console.warn(
            '⚠️  Firebase Admin SDK: No service account configured. Using default credentials.'
        );
        firebaseApp = admin.initializeApp();
    } else {
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
        });
    }
} else {
    firebaseApp = admin.app();
}

export const firebaseAuth = admin.auth(firebaseApp);
export { firebaseApp };
