const fs = require('fs');

// Fix 1: authStore.ts - Remove the backend sync call for Google Login
let authStorePath = 'src/stores/authStore.ts';
let authStoreContent = fs.readFileSync(authStorePath, 'utf8');

authStoreContent = authStoreContent.replace(
    /const response = await authApi\.loginWithGoogle\(\);\s+set\(\{\s+user: response\.user as BackendUser,\s+organization: response\.organization,\s+stations: response\.stations \|\| \[\],\s+currentStation: response\.stations\?\.\[0\] \|\| null,\s+isAuthenticated: true,\s+isLoading: false,\s+error: null,\s+\}\);/,
    `// The App.tsx listener will automatically set isAuthenticated to true.
                    set({
                        isLoading: false,
                        error: null,
                        authMethod: 'GOOGLE',
                    });`
);

fs.writeFileSync(authStorePath, authStoreContent);


// Fix 2: App.tsx - Don't let onAuthChange wipe PIN login sessions
let appTsxPath = 'src/App.tsx';
let appTsxContent = fs.readFileSync(appTsxPath, 'utf8');

appTsxContent = appTsxContent.replace(
    /\} else \{\s+\/\/ No Firebase user - clear auth state\s+useAuthStore\.setState\(\{\s+isAuthenticated: false,\s+user: null,\s+\}\);\s+\}/g,
    `} else {
                        // No Firebase user - only clear auth state if we are tracking a GOOGLE auth session
                        const authMethod = useAuthStore.getState().authMethod;
                        if (authMethod === 'GOOGLE' || !authMethod) {
                            useAuthStore.setState({
                                isAuthenticated: false,
                                user: null,
                            });
                        }
                    }`
);

fs.writeFileSync(appTsxPath, appTsxContent);

console.log('Auth fixes applied!');
