import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ErrorBoundary>
            <ToastProvider>
                <App />
            </ToastProvider>
        </ErrorBoundary>
    </StrictMode>
);

// Force unregister all service workers to fix the white screen issue
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) {
            registration.unregister();
        }
    });
}
