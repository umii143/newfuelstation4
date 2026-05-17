/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { initializeApp } from 'firebase/app';
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';

type FirebaseEnvKey =
    | 'VITE_FIREBASE_API_KEY'
    | 'VITE_FIREBASE_AUTH_DOMAIN'
    | 'VITE_FIREBASE_PROJECT_ID'
    | 'VITE_FIREBASE_STORAGE_BUCKET'
    | 'VITE_FIREBASE_MESSAGING_SENDER_ID'
    | 'VITE_FIREBASE_APP_ID';

const getRequiredEnv = (key: FirebaseEnvKey): string => {
    const value = import.meta.env[key];
    if (!value || !value.trim()) {
        throw new Error(`Missing required Firebase environment variable: ${key}`);
    }
    return value;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
};

const firebaseConfig = {
    apiKey: getRequiredEnv('VITE_FIREBASE_API_KEY'),
    authDomain: getRequiredEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getRequiredEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: getRequiredEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getRequiredEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getRequiredEnv('VITE_FIREBASE_APP_ID'),
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Google provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account',
});

// Auth helper functions
export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error: unknown) {
        console.error('Google login error:', error);
        if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'auth/popup-closed-by-user'
        ) {
            throw new Error('Sign-in cancelled. Please try again.');
        }
        throw new Error(getErrorMessage(error, 'Failed to sign in with Google'));
    }
};

export const loginWithEmail = async (email: string, password: string) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error: unknown) {
        console.error('Email login error:', error);
        throw new Error('Invalid email or password');
    }
};

export const signupWithEmail = async (email: string, password: string) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Send email verification
        await sendEmailVerification(result.user);
        return result.user;
    } catch (error: unknown) {
        console.error('Signup error:', error);
        const code =
            typeof error === 'object' && error !== null && 'code' in error ? error.code : '';
        if (code === 'auth/email-already-in-use') {
            throw new Error('Email already in use');
        } else if (code === 'auth/weak-password') {
            throw new Error('Password should be at least 6 characters');
        }
        throw new Error(getErrorMessage(error, 'Failed to create account'));
    }
};

export const resetPassword = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
        console.error('Password reset error:', error);
        throw new Error('Failed to send password reset email');
    }
};

export const logout = async () => {
    try {
        await firebaseSignOut(auth);
    } catch (error: unknown) {
        console.error('Logout error:', error);
        throw new Error('Failed to logout');
    }
};

// Auth state observer
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
};
