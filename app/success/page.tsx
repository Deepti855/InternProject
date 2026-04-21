import React from 'react';
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBFAF8] text-center p-4">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
        Thank you for your sustainable purchase!
      </h1>
      <Link 
        href="/shop" 
        className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transition-transform hover:scale-105"
      >
        Back to Gallery
      </Link>
    </div>
  );
}
