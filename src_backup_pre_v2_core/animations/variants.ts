/**
 * MOTORWAY OIL ENTERPRISE v4.0 — Animation Variants
 * Reusable Framer Motion variants for all page transitions and micro-interactions.
 * Per PRD Section 10.2
 */
import type { Variants, Transition } from 'framer-motion';

/* ── Page Transition Variants ──────────────────────────────────── */

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideRight: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const slideLeft: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const popIn: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

export const slideDown: Variants = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

/* ── Stagger Container/Item ────────────────────────────────────── */

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
};

export const staggerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

/* ── Transition Presets ────────────────────────────────────────── */

export const pageTransition: Transition = {
  type: 'tween',
  ease: [0.22, 1, 0.36, 1],
  duration: 0.35,
};

export const pageExitTransition: Transition = {
  type: 'tween',
  ease: [0.4, 0, 1, 1],
  duration: 0.15,
};

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const gentleSpring: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
};

export const snappySpring: Transition = {
  type: 'spring',
  bounce: 0.25,
  duration: 0.5,
};

/* ── Micro-Interaction Helpers ─────────────────────────────────── */

export const hoverLift = {
  whileHover: { y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' },
  whileTap: { scale: 0.97 },
  transition: { duration: 0.15 },
};

export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
};

export const tapPop = {
  whileTap: { scale: 0.85 },
  transition: { type: 'spring', stiffness: 400, damping: 20 },
};

export const navItemHover = {
  whileHover: { x: 4 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.08 },
};
