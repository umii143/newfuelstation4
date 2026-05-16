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

// Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'motorway-oil.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'motorway-oil',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'motorway-oil.appspot.com',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abc123',
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
    } catch (error: any) {
        console.error('Google login error:', error);
        if (error.code === 'auth/popup-closed-by-user') {
            throw new Error('Sign-in cancelled. Please try again.');
        }
        throw new Error(error.message || 'Failed to sign in with Google');
    }
};

export const loginWithEmail = async (email: string, password: string) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error: any) {
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
    } catch (error: any) {
        console.error('Signup error:', error);
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('Email already in use');
        } else if (error.code === 'auth/weak-password') {
            throw new Error('Password should be at least 6 characters');
        }
        throw new Error(error.message || 'Failed to create account');
    }
};

export const resetPassword = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        console.error('Password reset error:', error);
        throw new Error('Failed to send password reset email');
    }
};

export const logout = async () => {
    try {
        await firebaseSignOut(auth);
    } catch (error: any) {
        console.error('Logout error:', error);
        throw new Error('Failed to logout');
    }
};

// Auth state observer
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
};
