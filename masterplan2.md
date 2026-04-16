# MOTORWAY OIL - ENTERPRISE EDITION v4.0
## PART 2: IMPLEMENTATION ROADMAP & TECHNICAL ARCHITECTURE

---

# SECTION 1: TECHNOLOGY STACK SELECTION

## 1.1 FRONTEND ARCHITECTURE

### Core Framework: ** React 18.3 + with TypeScript **

** Rationale:**
    - Component reusability(90 % code sharing across desktop / mobile)
        - Strong typing prevents 70 % of runtime errors
            - Massive ecosystem(500K + packages)
                - React 18 features: Concurrent rendering, automatic batching, Suspense for better UX

                    ** Alternative Considered:** Vue 3, Angular 17
                        ** Decision:** React wins due to larger talent pool and superior performance with large datasets

---

### State Management: ** Zustand + React Query **

** Zustand ** (for global UI state):
    ```typescript
// stores/authStore.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  theme: 'light' | 'dark';
  login: (pin: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      theme: 'light',
      login: async (pin) => {
        // Authentication logic
        const user = await authenticateUser(pin);
        set({ user });
      },
      logout: () => set({ user: null }),
    }),
    { name: 'auth-storage' }
  )
);
```

        ** React Query ** (for server state):
            ```typescript
// hooks/useShifts.ts
import { useQuery } from '@tanstack/react-query';

export const useShifts = (stationId: string) => {
  return useQuery({
    queryKey: ['shifts', stationId],
    queryFn: () => fetchShifts(stationId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true,
  });
};
```

                ** Why not Redux ?**
                    - Zustand : 90 % less boilerplate
                        - React Query handles server state better(auto - caching, refetching, optimistic updates)

---

### UI Component Library: ** shadcn / ui + Tailwind CSS **

** shadcn / ui Benefits:**
    - Copy - paste components(no npm package bloat)
        - Full customization(we own the code)
            - Built on Radix UI(accessibility built -in)
                - Tailwind integration(utility - first styling)

                    ** Tailwind CSS Configuration:**
                        ```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Glassy White Theme
        'gw-bg': '#F8FAFC',
        'gw-surface': '#FFFFFF',
        'gw-text': '#0F172A',
        
        // Deep Obsidian Theme
        'do-bg': '#0B1121',
        'do-surface': '#1E293B',
        'do-text': '#F1F5F9',
        
        // Accents
        'accent-blue': '#3B82F6',
        'accent-emerald': '#10B981',
        'accent-rose': '#F43F5E',
        'accent-amber': '#F59E0B',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
};
```

---

### Form Management: ** React Hook Form + Zod **

** Example: Shift Closing Form **
    ```typescript
// components/ShiftClosingForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const shiftSchema = z.object({
  staffId: z.string().min(1, 'Staff selection required'),
  nozzles: z.array(z.object({
    nozzleId: z.string(),
    closingReading: z.number().positive(),
    photoProof: z.string().url(),
  })).min(1),
  actualCash: z.number().positive(),
  expenses: z.number().nonnegative(),
});

type ShiftFormData = z.infer<typeof shiftSchema>;

export const ShiftClosingForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema),
  });

  const onSubmit = async (data: ShiftFormData) => {
    // Submit logic
    await closeShift(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
};
```

    ** Benefits:**
        - Type - safe validation(compile - time + runtime)
            - 50 % less code than manual validation
                - Accessible error messages automatically

---

### Charting Library: ** Recharts **

** Example: Variance Trend Chart **
    ```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const VarianceChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line 
        type="monotone" 
        dataKey="variance" 
        stroke="#F43F5E" 
        strokeWidth={2} 
      />
    </LineChart>
  </ResponsiveContainer>
);
```

    ** Why Recharts ?**
        - Built for React(not wrapper)
            - Responsive by default
- 50KB gzipped(lightweight)

    ** Alternative:** Chart.js(considered but heavier)

---

### Offline Support: ** Workbox(PWA) **

** Service Worker Configuration:**
    ```javascript
// sw.js (generated by Workbox)
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';

// Precache all build assets
precacheAndRoute(self.__WB_MANIFEST);

// API calls: Network-first strategy
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
  })
);

// Images: Cache-first strategy
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      {
        cacheWillUpdate: async ({ response }) => {
          return response.status === 200 ? response : null;
        },
      },
    ],
  })
);
```

    ** Offline Queue(IndexedDB):**
        ```typescript
// utils/offlineQueue.ts
import Dexie from 'dexie';

class OfflineDatabase extends Dexie {
  pendingSales: Dexie.Table<PendingSale, number>;

  constructor() {
    super('MotorwayOfflineDB');
    this.version(1).stores({
      pendingSales: '++id, timestamp, synced',
    });
  }
}

const db = new OfflineDatabase();

export const queueSale = async (saleData: Sale) => {
  await db.pendingSales.add({
    ...saleData,
    timestamp: Date.now(),
    synced: false,
  });
};

export const syncPendingSales = async () => {
  const pending = await db.pendingSales.where('synced').equals(false).toArray();
  
  for (const sale of pending) {
    try {
      await api.createSale(sale);
      await db.pendingSales.update(sale.id, { synced: true });
    } catch (error) {
      console.error('Sync failed for sale:', sale.id, error);
    }
  }
};
```

---

## 1.2 BACKEND ARCHITECTURE

### Primary Backend: ** Firebase(BaaS) **

** Services Used:**
    1. ** Firestore ** - NoSQL database
2. ** Cloud Functions ** - Serverless APIs
3. ** Authentication ** - User management
4. ** Cloud Storage ** - File uploads
5. ** Hosting ** - Static site hosting
6. ** Cloud Messaging ** - Push notifications

    ** Why Firebase ?**
        - ✅ 99.95 % uptime SLA
            - ✅ Real - time sync(perfect for multi - user shifts)
    - ✅ Automatic scaling(0 to 1M users)
        - ✅ Built -in security rules
            - ✅ Generous free tier($25 / month for 50K reads)

** Alternative:** Supabase(considered but Firebase has better offline support)

---

### Cloud Functions(Backend Logic)

    ** Example 1: Auto - Calculate Shift Variance **
        ```typescript
// functions/src/shifts/calculateVariance.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const onShiftClose = functions.firestore
  .document('shifts/{shiftId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    
    if (newData.status !== 'CLOSED') return;

    // Calculate expected revenue
    const expectedRevenue = newData.nozzleSales.reduce((sum, nozzle) => {
      return sum + (nozzle.netSales * nozzle.rate);
    }, 0);

    const variance = newData.actualCash - (expectedRevenue - newData.expenses);
    const variancePercentage = (variance / expectedRevenue) * 100;

    // Update shift document
    await change.after.ref.update({
      expectedRevenue,
      variance,
      variancePercentage,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send alert if variance exceeds threshold
    if (Math.abs(variancePercentage) > 0.5) {
      await sendVarianceAlert(newData.stationId, shiftId, variance);
    }
  });
```

        ** Example 2: Automated Stock Level Alerts **
            ```typescript
// functions/src/inventory/stockAlerts.ts
export const checkStockLevels = functions.pubsub
  .schedule('every 6 hours')
  .onRun(async (context) => {
    const productsSnapshot = await admin.firestore()
      .collection('products')
      .where('currentStock', '<=', 'reorderPoint')
      .get();

    const alerts = [];
    productsSnapshot.forEach(doc => {
      const product = doc.data();
      alerts.push({
        productId: doc.id,
        name: product.name,
        currentStock: product.currentStock,
        reorderPoint: product.reorderPoint,
      });
    });

    if (alerts.length > 0) {
      await sendStockAlertEmail(alerts);
      await createNotification('LOW_STOCK', alerts);
    }
  });
```

            ** Example 3: Customer Credit Limit Enforcement **
                ```typescript
// functions/src/sales/validateCreditSale.ts
export const validateCreditSale = functions.https.onCall(async (data, context) => {
  const { customerId, saleAmount } = data;

  const customerDoc = await admin.firestore()
    .collection('customers')
    .doc(customerId)
    .get();

  if (!customerDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Customer not found');
  }

  const customer = customerDoc.data();
  const newBalance = customer.currentBalance + saleAmount;

  if (newBalance > customer.creditLimit) {
    return {
      allowed: false,
      message: `Credit limit exceeded.Available: ${ customer.creditLimit - customer.currentBalance } `,
      requiresApproval: true,
    };
  }

  return { allowed: true };
});
```

---

### Authentication Strategy

    ** Custom PIN - Based Auth(Firebase Auth Extension):**
        ```typescript
// functions/src/auth/pinAuth.ts
import * as bcrypt from 'bcrypt';

export const authenticateWithPIN = functions.https.onCall(async (data, context) => {
  const { userId, pin } = data;

  const userDoc = await admin.firestore()
    .collection('users')
    .doc(userId)
    .get();

  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }

  const user = userDoc.data();

  // Check if PIN is expired
  if (new Date() > new Date(user.pinExpiry)) {
    throw new functions.https.HttpsError('failed-precondition', 'PIN expired. Please reset.');
  }

  // Verify PIN
  const isValid = await bcrypt.compare(pin, user.pin);

  if (!isValid) {
    // Increment failed attempts
    await userDoc.ref.update({
      failedAttempts: admin.firestore.FieldValue.increment(1),
    });

    if (user.failedAttempts + 1 >= 3) {
      await userDoc.ref.update({ status: 'LOCKED' });
      throw new functions.https.HttpsError('permission-denied', 'Account locked after 3 failed attempts.');
    }

    throw new functions.https.HttpsError('unauthenticated', 'Invalid PIN');
  }

  // Reset failed attempts
  await userDoc.ref.update({ 
    failedAttempts: 0,
    lastLogin: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Generate custom token
  const customToken = await admin.auth().createCustomToken(userId);

  return { 
    token: customToken,
    user: {
      id: userId,
      name: user.name,
      role: user.role,
      theme: user.theme,
    },
  };
});
```

---

## 1.3 MOBILE ARCHITECTURE

### Cross - Platform: ** React Native(Expo) **

** Why Expo ?**
    - Single codebase for iOS + Android + Web
        - Over - the - air updates(no app store delays)
        - Built -in camera, location, notifications
    - 95 % code sharing with web version

        ** Shared Code Structure:**
            ```
/packages
  /ui          → Shared components (Button, Input, Card)
  /utils       → Helpers (date formatting, currency)
  /types       → TypeScript definitions
  /hooks       → Custom hooks (useAuth, useShifts)
  
/apps
  /web         → Next.js web app
  /mobile      → Expo mobile app
```

            ** Example: Shared Button Component **
                ```typescript
// packages/ui/Button.tsx
import { Platform, Pressable, Text } from 'react-native';

export const Button = ({ onPress, children, variant = 'primary' }) => {
  const styles = getButtonStyles(variant);
  
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.text}>{children}</Text>
    </Pressable>
  );
};

// Platform-specific styles
const getButtonStyles = (variant) => {
  if (Platform.OS === 'web') {
    return {
      base: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: variant === 'primary' ? '#3B82F6' : 'transparent',
        borderRadius: 8,
        cursor: 'pointer',
      },
      pressed: { opacity: 0.8 },
      text: { color: '#FFFFFF', fontWeight: '600' },
    };
  }
  
  // Mobile-specific (larger touch targets)
  return {
    base: {
      paddingHorizontal: 32,
      paddingVertical: 16,
      backgroundColor: variant === 'primary' ? '#3B82F6' : 'transparent',
      borderRadius: 12,
    },
    pressed: { opacity: 0.7 },
    text: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  };
};
```

---

## 1.4 DEVELOPMENT TOOLS

### Version Control: ** Git + GitHub **

** Branching Strategy(Git Flow):**
    ```
main              → Production-ready code
  └─ develop      → Integration branch
      ├─ feature/fuel-module
      ├─ feature/pos-system
      ├─ feature/dashboard
      └─ hotfix/variance-calc-bug
```

    ** Commit Convention(Conventional Commits):**
        ```
feat: Add shift closing wizard
fix: Correct variance calculation for multi-nozzle
docs: Update README with setup instructions
test: Add unit tests for POS module
refactor: Optimize Firestore queries
perf: Lazy load dashboard charts
```

---

### Package Manager: ** pnpm **

** Why pnpm over npm / yarn ?**
    - 3x faster installs
        - Saves 50 % disk space(symlinks)
            - Strict dependency resolution(no phantom deps)

---

### Build Tool: ** Vite **

** Why Vite over Create React App ?**
    - 10x faster dev server(esbuild)
        - Instant HMR(Hot Module Replacement)
            - Optimized production builds(Rollup)

                ** vite.config.ts:**
                    ```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Motorway Oil - Enterprise',
        short_name: 'Motorway',
        theme_color: '#3B82F6',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: true,
  },
});
```

---

### Code Quality Tools

    ** ESLint Configuration:**
        ```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "react/prop-types": "off"
  }
}
```

        ** Prettier Configuration:**
            ```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

            ** Husky(Pre - commit Hooks):**
                ```bash
# .husky/pre-commit
#!/bin/sh
pnpm lint
pnpm test --passWithNoTests
pnpm build
```

---

### Testing Stack

    ** Unit Tests: Vitest **
        ```typescript
// __tests__/varianceCalculation.test.ts
import { describe, it, expect } from 'vitest';
import { calculateVariance } from '@/utils/shift';

describe('Variance Calculation', () => {
  it('should calculate variance correctly', () => {
    const shiftData = {
      expectedRevenue: 100000,
      actualCash: 99500,
      expenses: 1000,
    };

    const result = calculateVariance(shiftData);

    expect(result.variance).toBe(-500);
    expect(result.variancePercentage).toBeCloseTo(-0.5);
  });

  it('should handle zero revenue', () => {
    const shiftData = {
      expectedRevenue: 0,
      actualCash: 0,
      expenses: 0,
    };

    expect(() => calculateVariance(shiftData)).not.toThrow();
  });
});
```

        ** Integration Tests: Playwright **
            ```typescript
// e2e/pos.spec.ts
import { test, expect } from '@playwright/test';

test('complete a cash sale', async ({ page }) => {
  await page.goto('/pos');
  
  // Search for product
  await page.fill('[data-testid="product-search"]', 'Castrol');
  await page.click('text=Castrol Edge 5W-30');
  
  // Add to cart
  await page.click('[data-testid="add-to-cart"]');
  
  // Verify total
  await expect(page.locator('[data-testid="cart-total"]')).toHaveText('₨3,500');
  
  // Complete sale
  await page.click('[data-testid="pay-cash"]');
  await page.fill('[data-testid="cash-received"]', '5000');
  await page.click('[data-testid="complete-sale"]');
  
  // Verify success
  await expect(page.locator('[data-testid="sale-success"]')).toBeVisible();
});
```

            ** Component Tests: React Testing Library **
                ```typescript
// components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

test('calls onClick when clicked', () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click Me</Button>);
  
  fireEvent.click(screen.getByText('Click Me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

---

## 1.5 MONITORING & ANALYTICS

### Error Tracking: ** Sentry **

    ```typescript
// sentry.config.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Filter out 404 errors
    if (event.exception?.values?.[0]?.value?.includes('404')) {
      return null;
    }
    return event;
  },
});
```

---

### Analytics: ** Google Analytics 4 + Mixpanel **

** GA4 for traffic metrics:**
    ```typescript
// utils/analytics.ts
import ReactGA from 'react-ga4';

ReactGA.initialize('G-XXXXXXXXXX');

export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};

export const trackEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({ category, action, label });
};
```

    ** Mixpanel for user behavior:**
        ```typescript
import mixpanel from 'mixpanel-browser';

mixpanel.init('YOUR_MIXPANEL_TOKEN');

export const trackShiftClosed = (shiftData) => {
  mixpanel.track('Shift Closed', {
    variance: shiftData.variance,
    revenue: shiftData.totalRevenue,
    staff: shiftData.staffId,
  });
};
```

---

### Performance Monitoring: ** Firebase Performance **

    ```typescript
import { getPerformance } from 'firebase/performance';

const perf = getPerformance();

// Auto-tracks page loads, network requests
// Manual custom traces:
const trace = perf.trace('shift_closing_process');
trace.start();
// ... process ...
trace.stop();
```

---

# SECTION 2: DEVELOPMENT PHASES(AGILE SPRINTS)

## 2.1 SPRINT PLANNING OVERVIEW

    ** Total Duration:** 16 Weeks(4 Months)
        ** Sprint Length:** 2 Weeks
            ** Total Sprints:** 8

                ** Team Composition:**
                    - 1 Product Manager
                        - 1 UI / UX Designer
                            - 3 Frontend Developers(React / React Native)
                                - 1 Backend Developer(Firebase Functions)
                                    - 1 QA Engineer
                                        - 1 DevOps Engineer

---

## 2.2 DETAILED SPRINT BREAKDOWN

### ** SPRINT 0: Project Setup & Design System(Week - 2 to 0) **

** Goals:**
    - Finalize PRD
        - Create high - fidelity mockups(Figma)
            - Set up development environment
                - Initialize repositories

                    ** Deliverables:**
                        - ✅ Figma design system(50 + components)
                            - ✅ GitHub repos(frontend, backend, mobile)
                                - ✅ CI / CD pipeline(GitHub Actions)
                                    - ✅ Firebase project setup
                                        - ✅ Domain purchased + SSL configured

                                            ** Tasks:**
| Task | Owner | Hours |
| ------| -------| -------|
| Create Figma design system | Designer | 40 |
| Set up monorepo with pnpm workspaces | DevOps | 16 |
| Configure Firebase(Firestore, Auth, Functions) | Backend Dev | 20 |
| Set up ESLint / Prettier / Husky | Frontend Dev | 8 |
| Create shared UI components library | Frontend Dev | 32 |

** Definition of Done:**
    -[] All developers can run project locally
        - [] CI / CD deploys to staging on every commit to`develop`
            - [] Figma designs approved by stakeholders

---

### ** SPRINT 1: Authentication & Dashboard(Week 1 - 2) **

** User Stories:**
    1. As an ** Owner **, I want to log in with a 4 - digit PIN so I can access the system securely
2. As a ** Manager **, I want to see today's revenue on the dashboard so I can monitor performance
3. As a ** Cashier **, I want to see my assigned shift details on the dashboard

    ** Features:**
        - PIN - based login screen
            - Role - based dashboard(Owner, Manager, Cashier views)
                - Basic navigation sidebar

                    ** Technical Tasks:**
                        ```
✓ Implement PIN authentication (Firebase Auth + Cloud Function)
✓ Create reusable dashboard grid layout
✓ Build KPI cards (Revenue, Variance, Stock Value)
✓ Implement role-based routing
✓ Add session management (auto-logout after 15 min)
```

                        ** Testing:**
                            - Unit: Login logic, PIN validation
                                - Integration: Dashboard data fetching
                                    - E2E: Complete login flow

                                        ** Sprint Demo:**
                                            - Login as different roles(Owner, Manager, Cashier)
                                                - Show personalized dashboards
                                                    - Demonstrate auto - logout

---

### ** SPRINT 2: Fuel Module - Tank Management(Week 3 - 4) **

** User Stories:**
    1. As a ** Manager **, I want to view real - time fuel levels so I can reorder before running out
2. As an ** Attendant **, I want to log tank deliveries so stock is updated automatically
3. As an ** Owner **, I want to see variance trends per tank

    ** Features:**
        - Tank visualization(3D tank with fill animation)
- Stock -in workflow(record deliveries)
    - Evaporation calculation
        - Low - level alerts

            ** Technical Tasks:**
                ```
✓ Create Firestore collections: tanks, stockMovements
✓ Build tank card component with Recharts gauge
✓ Implement delivery logging form
✓ Create Cloud Function: auto-calculate evaporation (runs daily)
✓ Add push notifications for low stock
```

                ** Testing:**
                    - Unit: Evaporation calculation logic
                        - Integration: Stock -in updates tank levels
                            - E2E: Complete delivery workflow

                                ** Sprint Demo:**
                                    - Add 10,000L to Tank 1, show instant update
                                        - Simulate evaporation over 7 days
                                            - Trigger low - level alert

---

### ** SPRINT 3: Fuel Module - Shift Management(Week 5 - 6) **

** User Stories:**
    1. As a ** Manager **, I want to close a shift in under 3 minutes
2. As an ** Attendant **, I want to upload nozzle photos for accountability
3. As an ** Owner **, I want to see variance explanations for every shift

    ** Features:**
        - Shift closing wizard(7 steps)
            - Nozzle reading entry with photo upload
                - Variance calculation & approval
                    - Digital shift report(PDF generation)

                        ** Technical Tasks:**
                            ```
✓ Build multi-step form with validation
✓ Integrate camera API (Expo ImagePicker for mobile)
✓ Create Cloud Function: calculateShiftVariance (on shift close)
✓ Generate PDF reports (use jsPDF)
✓ Send email notifications (SendGrid integration)
```

                            ** Testing:**
                                - Unit: Variance formula validation
                                    - Integration: Photo upload to Cloud Storage
                                        - E2E: Complete shift closing(happy path + error scenarios)

                                            ** Sprint Demo:**
                                                - Close a shift with 4 nozzles
                                                    - Show variance calculation in real - time
                                                        - Download PDF report

---

### ** SPRINT 4: CNG Module(Week 7 - 8) **

** User Stories:**
    1. As a ** Manager **, I want to monitor compressor pressure so I can schedule trailer refills
2. As an ** Attendant **, I want to log CNG sales per shift
3. As an ** Owner **, I want to compare Petrol vs CNG profitability

    ** Features:**
        - Compressor dashboard(pressure gauges, temperature)
            - Trailer refill logging
                - CNG shift closing(simplified for KG - based sales)
    - Comparative analytics(Petrol vs CNG revenue)

        ** Technical Tasks:**
            ```
✓ Create Firestore collections: cngShifts, trailerRefills
✓ Build pressure gauge component (custom SVG)
✓ Implement cascade bank logic (auto-switch banks)
✓ Create analytics chart (comparison view)
```

            ** Testing:**
                - Unit: Pressure calculation(PSI to Bar conversion)
                    - Integration: Trailer refill updates cascade banks
                        - E2E: Log CNG shift, verify stock deduction

                            ** Sprint Demo:**
                                - Show compressor dashboard with real - time pressure
                                    - Log trailer refill, show cascade reset
                                        - Display 30 - day Petrol vs CNG comparison chart

---

### ** SPRINT 5: Lube Shop - Inventory & Products(Week 9 - 10) **

** User Stories:**
    1. As a ** Manager **, I want to add new products with barcodes
2. As a ** Cashier **, I want to search products by name or scan barcode
3. As an ** Owner **, I want to see which products are low stock

    ** Features:**
        - Product CRUD operations
            - Barcode generation & scanning
                - Stock adjustment workflow
                    - Low stock alerts

                        ** Technical Tasks:**
                            ```
✓ Create Firestore collections: products, stockAdjustments
✓ Build product form (with image upload)
✓ Integrate barcode scanner (QuaggaJS for web, Expo Barcode Scanner for mobile)
✓ Create stock alert Cloud Function (runs every 6 hours)
✓ Build low stock dashboard widget
```

                            ** Testing:**
                                - Unit: Reorder point calculation
                                    - Integration: Stock adjustment updates product quantity
                                        - E2E: Add product, scan barcode, trigger low stock alert

                                            ** Sprint Demo:**
                                                - Add 10 products with photos
                                                - Scan barcode to find product
                                                    - Show low stock alerts

---

### ** SPRINT 6: Lube Shop - POS System(Week 11 - 12) **

** User Stories:**
    1. As a ** Cashier **, I want to complete a sale in 3 taps
2. As a ** Customer **, I want to receive a professional invoice
3. As a ** Manager **, I want to void a sale within 24 hours

    ** Features:**
        - Lightning - fast POS interface
            - Hold order queue
                - Credit sale with limit check
                    - Receipt printing & email
                        - Void /return mechanism

                            ** Technical Tasks:**
                                ```
✓ Build POS component (optimized for speed)
✓ Implement hold order logic (save to IndexedDB)
✓ Create credit limit check (Cloud Function)
✓ Generate receipts (HTML template + PDF)
✓ Build void workflow with approval
```

                                ** Testing:**
                                    - Unit: Cart total calculation
                                        - Integration: Credit sale updates customer balance
                                            - E2E: Complete sale, void sale, hold & resume order
                                                - Performance: POS load time < 0.8s

                                                    ** Sprint Demo:**
                                                        - Complete 5 sales in 2 minutes
                                                            - Show hold order retrieval
                                                                - Attempt credit sale exceeding limit(blocked)
                                                                    - Void a sale with manager PIN

---

### ** SPRINT 7: Financials - Customer & Supplier Ledgers(Week 13 - 14) **

** User Stories:**
    1. As an ** Owner **, I want to see aging analysis of customer credit
2. As a ** Manager **, I want to record customer payments
3. As an ** Accountant **, I want to track supplier payables

    ** Features:**
        - Customer Khata(digital ledger)
            - Payment recovery workflow
                - Supplier management
                    - Aging reports(30 / 60 / 90 days)

                        ** Technical Tasks:**
                            ```
✓ Create Firestore collections: customers, customerTransactions, suppliers
✓ Build customer ledger view (transaction history)
✓ Implement payment recording
✓ Create aging analysis chart
✓ Build supplier payable dashboard
```

                            ** Testing:**
                                - Unit: Aging bucket calculation
                                    - Integration: Payment updates customer balance
                                        - E2E: Record credit sale, add payment, verify balance

                                            ** Sprint Demo:**
                                                - Show customer ledger with 90 - day history
                                                    - Record partial payment
                                                        - Display aging analysis chart
                                                            - Show supplier payable summary

---

### ** SPRINT 8: HR, Settings & Polish(Week 15 - 16) **

** User Stories:**
    1. As a ** Manager **, I want to mark staff attendance with GPS verification
2. As an ** Owner **, I want to rank staff by performance
3. As a ** User **, I want to switch between light / dark themes

    ** Features:**
        - Clock in/out with GPS + photo
        - Performance leaderboard
            - Theme switcher(Glassy White / Deep Obsidian)
                - Data export (JSON, CSV)
                    - Backup / restore

                    ** Technical Tasks:**
                        ```
✓ Build attendance module (Expo Location API)
✓ Create performance ranking algorithm
✓ Implement theme switcher (persist to Firestore)
✓ Add export functionality (CSV, JSON)
✓ Create backup Cloud Function (scheduled daily)
✓ Polish UI (animations, micro-interactions)
✓ Accessibility audit (WCAG compliance)
```

                        ** Testing:**
                            - Unit: Performance score calculation
                                - Integration: Attendance updates timesheet
                                    - E2E: Full user journey(login → sale → shift close → logout)
                                        - Accessibility: Screen reader testing

                                            ** Sprint Demo:**
                                                - Mark attendance with GPS check
                                                    - Show performance leaderboard
                                                        - Switch themes
                                                            - Export 30 - day sales data

---

## 2.3 POST - LAUNCH SPRINTS(Optional Phase 2)

### ** SPRINT 9 - 10: Advanced Features **
    - AI - powered demand forecasting
        - Automated re - ordering(PO generation)
            - WhatsApp integration(receipts, alerts)
                - Multi - language support(Urdu, Arabic)

### ** SPRINT 11 - 12: Enterprise Features **
    - Multi - station management(franchise mode)
        - Consolidated reporting
            - API for third - party integrations
                - Custom branding per station

---

# SECTION 3: TESTING STRATEGY

## 3.1 TESTING PYRAMID

    ```
       /\
      /  \  E2E Tests (10%)
     /----\ Integration Tests (30%)
    /------\ Unit Tests (60%)
```

### ** Unit Tests(Target: 80 % Coverage) **

** Tools:** Vitest, React Testing Library

    ** What to Test:**
        - Pure functions(calculations, formatters)
            - React components(props, events, rendering)
                - Custom hooks
                    - Utility functions

                        ** Example Test Suite:**
                            ```typescript
// __tests__/utils/currency.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, parseCurrency } from '@/utils/currency';

describe('Currency Utils', () => {
  describe('formatCurrency', () => {
    it('formats PKR correctly', () => {
      expect(formatCurrency(1234567.89, 'PKR')).toBe('₨1,234,567.89');
    });

    it('handles zero', () => {
      expect(formatCurrency(0, 'PKR')).toBe('₨0.00');
    });

    it('handles negative numbers', () => {
      expect(formatCurrency(-500, 'PKR')).toBe('-₨500.00');
    });
  });

  describe('parseCurrency', () => {
    it('removes currency symbols', () => {
      expect(parseCurrency('₨1,234.56')).toBe(1234.56);
    });

    it('handles invalid input', () => {
      expect(parseCurrency('invalid')).toBe(0);
    });
  });
});
```

---

### ** Integration Tests(Target: 50 % Coverage) **

** Tools:** Vitest + Firebase Emulators

    ** What to Test:**
        - API calls(CRUD operations)
            - Cloud Functions
                - Database triggers
                    - File uploads

                        ** Example:**
                            ```typescript
// __tests__/integration/shifts.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { closeShift } from '@/api/shifts';

describe('Shift API', () => {
  let testEnv;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'motorway-test',
      firestore: {
        host: 'localhost',
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it('should close shift and calculate variance', async () => {
    const shiftData = {
      staffId: 'test-user',
      nozzleSales: [
        { nozzleId: 'NOZ-1', closingReading: 1000, openingReading: 500, rate: 280 },
      ],
      actualCash: 140000,
      expenses: 500,
    };

    const result = await closeShift(shiftData);

    expect(result.variance).toBe(0);
    expect(result.status).toBe('CLOSED');
  });
});
```

---

### ** E2E Tests(Target: Critical Paths) **

** Tools:** Playwright

    ** Test Scenarios:**
        1. ** Happy Path:** Login → Dashboard → Close Shift → Logout
2. ** POS Sale:** Search Product → Add to Cart → Cash Payment → Receipt
3. ** Credit Sale:** Search Customer → Check Limit → Complete Sale
4. ** Error Handling:** Invalid PIN → Locked Account

    ** Example:**
        ```typescript
// e2e/critical-path.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Critical User Journey', () => {
  test('Manager can close a shift successfully', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="user-select"]', 'Manager-001');
    await page.fill('[data-testid="pin-input"]', '1234');
    await page.click('[data-testid="login-btn"]');

    // Navigate to shift closing
    await page.click('text=Fuel Management');
    await page.click('text=Close Shift');

    // Fill shift data
    await page.fill('[data-testid="nozzle-1-closing"]', '246890.2');
    await page.click('[data-testid="upload-photo-1"]');
    // ... (simulate photo upload)

    await page.fill('[data-testid="actual-cash"]', '340000');
    await page.click('[data-testid="submit-shift"]');

    // Verify success
    await expect(page.locator('[data-testid="variance-display"]')).toContainText('₨-500');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
```

---

## 3.2 PERFORMANCE TESTING

### ** Load Testing(K6) **

** Scenario:** 100 concurrent users during peak hours

    ```javascript
// k6/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp up to 50 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete in 2s
    http_req_failed: ['rate<0.01'],     // Error rate <1%
  },
};

export default function () {
  // Simulate POS transaction
  const res = http.post('https://api.motorwayoil.com/sales', {
    items: [{ productId: 'PRD-001', qty: 1 }],
    paymentMethod: 'CASH',
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 1s': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}
```

    ** Run Command:**
        ```bash
k6 run --vus 100 --duration 10m k6/load-test.js
```

---

### ** Lighthouse Performance Audit **

** Target Scores:**
    - Performance: > 90
        - Accessibility: > 95
            - Best Practices: > 90
                - SEO: > 90

                    ** Automated CI Check:**
                        ```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://staging.motorwayoil.com
            https://staging.motorwayoil.com/dashboard
            https://staging.motorwayoil.com/pos
          uploadArtifacts: true
```

---

## 3.3 SECURITY TESTING

### ** OWASP ZAP(Automated Scans) **

    ```bash
# Run in Docker
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://staging.motorwayoil.com \
  -r zap-report.html
```

### ** Manual Penetration Testing **

** Test Cases:**
    1. SQL Injection in product search
2. XSS in product descriptions
3. CSRF in payment forms
4. Authentication bypass(PIN brute force)
5. File upload vulnerabilities(Shell upload)

---

## 3.4 ACCESSIBILITY TESTING

### ** Automated Tools:**
    - axe DevTools(browser extension)
        - Pa11y(CLI tool)
        - Lighthouse Accessibility Audit

### ** Manual Testing:**
    - Keyboard navigation(Tab, Enter, Escape)
        - Screen reader(NVDA on Windows, VoiceOver on Mac)
            - Color contrast checker
                - Focus indicators

                    ** Example Pa11y Test:**
                        ```bash
pa11y --standard WCAG2AAA https://motorwayoil.com/dashboard
```

---

# SECTION 4: DEPLOYMENT ARCHITECTURE

## 4.1 HOSTING INFRASTRUCTURE

### ** Frontend Hosting: Vercel **

** Why Vercel ?**
    - Automatic deployments from Git
        - Global CDN(300 + edge locations)
            - Built -in SSL certificates
                - Preview deployments for PRs

                    ** vercel.json:**
                        ```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

### ** Backend: Firebase(Serverless) **

** Why Firebase ?**
    - Zero server management
        - Auto - scaling
        - Pay - per - use pricing
            - 99.95 % uptime SLA

                ** firebase.json:**
                    ```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18",
    "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run lint"]
  },
  "storage": {
    "rules": "storage.rules"
  },
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

## 4.2 CI / CD PIPELINE

### ** GitHub Actions Workflow **

    ```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run linter
        run: pnpm lint
      
      - name: Run unit tests
        run: pnpm test:unit
      
      - name: Run E2E tests
        run: pnpm test:e2e
      
      - name: Build
        run: pnpm build

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: w9jds/firebase-action@master
        with:
          args: deploy --only functions,firestore,storage
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}

  notify:
    needs: [deploy-frontend, deploy-backend]
    runs-on: ubuntu-latest
    steps:
      - name: Send Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: '🚀 Production deployment successful!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 4.3 ENVIRONMENT MANAGEMENT

### ** Environments:**
    1. ** Development ** (`dev` branch) → Deployed to`dev.motorwayoil.com`
2. ** Staging ** (`develop` branch) → Deployed to`staging.motorwayoil.com`
3. ** Production ** (`main` branch) → Deployed to`motorwayoil.com`

### ** Environment Variables:**

**.env.development:**
    ```
VITE_FIREBASE_API_KEY=dev-api-key
VITE_FIREBASE_PROJECT_ID=motorway-dev
VITE_API_URL=https://dev-api.motorwayoil.com
VITE_SENTRY_DSN=https://sentry-dev.io
```

    **.env.production:**
        ```
VITE_FIREBASE_API_KEY=prod-api-key
VITE_FIREBASE_PROJECT_ID=motorway-prod
VITE_API_URL=https://api.motorwayoil.com
VITE_SENTRY_DSN=https://sentry-prod.io
```

---

## 4.4 DATABASE MIGRATION STRATEGY

    ** Firestore Data Migrations:**

        ```typescript
// scripts/migrations/001_add_product_barcodes.ts
import * as admin from 'firebase-admin';

admin.initializeApp();

async function migrate() {
  const db = admin.firestore();
  const batch = db.batch();

  const productsSnapshot = await db.collection('products').get();

  productsSnapshot.docs.forEach((doc) => {
    const ref = db.collection('products').doc(doc.id);
    batch.update(ref, {
      barcode: null, // Add new field
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
  console.log(`✅ Migrated ${ productsSnapshot.size } products`);
}

migrate().catch(console.error);
```

    ** Run Migrations:**
        ```bash
pnpm migration:run 001_add_product_barcodes
```

---

## 4.5 BACKUP & DISASTER RECOVERY

### ** Automated Firestore Backups **

    ```typescript
// functions/src/scheduled/backup.ts
import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';

export const scheduledBackup = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const client = new firestore.v1.FirestoreAdminClient();
    const projectId = process.env.GCLOUD_PROJECT;
    const databaseName = client.databasePath(projectId, '(default)');

    const timestamp = new Date().toISOString().split('T')[0];
    const bucket = `gs://${projectId}-backups`;

const responses = await client.exportDocuments({
    name: databaseName,
    outputUriPrefix: `${bucket}/${timestamp}`,
    collectionIds: [], // Empty array exports all collections
});

console.log(`✅ Backup completed: ${responses[0].name}`);
  });
```

### **Retention Policy:**
- Daily backups: Keep for 30 days
- Weekly backups: Keep for 90 days
- Monthly backups: Keep for 1 year

---

# SECTION 5: MONITORING & OBSERVABILITY

## 5.1 LOGGING STRATEGY

### **Structured Logging (Winston)**

```typescript
// utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

export default logger;
```

**Usage:**
```typescript
logger.info('Shift closed', {
    shiftId: 'SH-2026-0145',
    variance: -500,
    staffId: 'USR-012',
});

logger.error('Payment failed', {
    error: err.message,
    customerId: 'CUST-047',
    amount: 12500,
});
```

---

## 5.2 ALERTING RULES

### **Firebase Cloud Monitoring Alerts**

**Critical Alerts (PagerDuty):**
1. Cloud Function error rate >5%
2. Firestore write latency >1s (p95)
3. Storage quota >90%
4. Authentication failures >100/min

**Warning Alerts (Slack):**
1. Daily active users drop >20%
2. Average shift closing time >5 min
3. Low stock alert for >10 products

---

## 5.3 DASHBOARDS

### **Grafana Dashboard (Firebase Metrics)**

**Panels:**
1. **System Health**
   - Cloud Functions invocations/min
   - Error rate
   - Execution duration (p50, p95, p99)

2. **Business Metrics**
   - Daily revenue
   - Average variance %
   - Top-selling products

3. **User Activity**
   - Active users (hourly, daily, monthly)
   - Session duration
   - Feature adoption (POS vs Fuel)

---

# CONCLUSION & NEXT STEPS

## Summary of Part 2

✅ **Technology Stack Finalized:**
- Frontend: React 18 + TypeScript + Tailwind + shadcn/ui
- Backend: Firebase (Firestore, Functions, Auth)
- Mobile: React Native (Expo)
- Testing: Vitest, Playwright, K6

✅ **Development Roadmap:**
- 8 sprints × 2 weeks = 16 weeks
- Sprint 0: Setup
- Sprints 1-8: Feature development
- Post-launch: Advanced features

✅ **Deployment Architecture:**
- CI/CD: GitHub Actions
- Hosting: Vercel (frontend) + Firebase (backend)
- 3 environments: Dev, Staging, Production

✅ **Quality Assurance:**
- Unit tests: 80% coverage
- E2E tests: Critical paths
- Performance: Lighthouse >90
- Security: OWASP compliance

---

## PART 3 PREVIEW: Marketing & Launch Plan

The final part will cover:
1. **Go-to-Market Strategy**
   - Target customer segments
   - Pricing tiers (Starter, Professional, Enterprise)
   - Sales channels

2. **Marketing Campaigns**
   - Landing page optimization
   - Content marketing (blogs, case studies)
   - Demo videos & tutorials

3. **Launch Checklist**
   - Beta testing program
   - Pre-launch PR
   - Launch day activities
   - Post-launch support

4. **Growth Metrics**
   - North Star metric
   - OKRs (Objectives & Key Results)
   - Customer acquisition cost (CAC)
   - Lifetime value (LTV)

5. **Internationalization Plan**
   - Localization (Urdu, Arabic)
   - Regional compliance (tax laws)
   - Partnership opportunities

**Would you like me to proceed with Part 3: Marketing, Launch & Growth Strategy?** 🚀