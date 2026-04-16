import { EnterpriseNavigation } from './components/EnterpriseNavigation';
import { Dashboard } from './components/Dashboard';
import { TopNavigation } from './components/TopNavigation';
import { LoadingScreen } from './components/LoadingScreen';
import { Toaster } from './components/ui/sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loading" />
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="size-full flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/20"
          >
            <div className="flex flex-1 overflow-hidden">
              <EnterpriseNavigation />
              <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavigation />
                <Dashboard />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster position="top-right" richColors />
    </>
  );
}