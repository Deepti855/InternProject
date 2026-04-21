import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const Input = forwardRef(
  ({ className, type = 'text', label, error, icon: Icon, ...props }, ref) => {
    return (
      <div className="w-full mb-4">
        {label && (
          <label className="block text-sm font-semibold text-gray-800 mb-2 tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-gray-500" aria-hidden="true" />
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={clsx(
              'block w-full rounded-2xl outline-none glass-input sm:text-sm h-12 px-4 shadow-inner text-gray-800 font-medium placeholder-gray-500',
              {
                'pl-12': Icon,
                'border-red-400 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/50': error
              },
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm font-medium text-red-500" id="email-error">
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
