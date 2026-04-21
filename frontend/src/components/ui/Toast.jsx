import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// Simple global toast export (in a real app, use Context or Zustand)
export const toastEmitter = {
  listeners: [],
  success: (msg) => toastEmitter.listeners.forEach(l => l({ msg, type: 'success' })),
  error: (msg) => toastEmitter.listeners.forEach(l => l({ msg, type: 'error' })),
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = (toast) => {
        const id = Date.now();
        setToasts(prev => [...prev, { ...toast, id }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };
    
    toastEmitter.listeners.push(listener);
    return () => {
        toastEmitter.listeners = toastEmitter.listeners.filter(l => l !== listener);
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3">
        <AnimatePresence>
            {toasts.map(t => (
                <motion.div
                   key={t.id}
                   initial={{ opacity: 0, x: 50, scale: 0.9 }}
                   animate={{ opacity: 1, x: 0, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   className={`px-6 py-4 rounded-xl shadow-2xl font-bold text-white flex items-center space-x-3 ${
                       t.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                   }`}
                >
                   <span>{t.type === 'error' ? '❌' : '✅'}</span>
                   <span>{t.msg}</span>
                </motion.div>
            ))}
        </AnimatePresence>
    </div>
  );
}
