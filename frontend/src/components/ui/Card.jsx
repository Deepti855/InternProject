import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export default function Card({ className, children, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={clsx('glass-card rounded-3xl overflow-hidden backdrop-blur-md', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

