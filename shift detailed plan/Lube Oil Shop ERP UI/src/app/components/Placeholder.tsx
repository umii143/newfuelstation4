import React from 'react';
import { motion } from 'motion/react';
import { Construction } from 'lucide-react';

interface PlaceholderProps {
  title: string;
  description: string;
}

export function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center glass-card rounded-2xl p-12 shadow-3d max-w-md"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0066cc] to-[#00a896] flex items-center justify-center mx-auto mb-6">
          <Construction className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-glow px-6 py-3 rounded-xl bg-gradient-to-r from-[#0066cc] to-[#00a896] text-white font-medium shadow-lg"
        >
          Coming Soon
        </motion.button>
      </motion.div>
    </div>
  );
}
