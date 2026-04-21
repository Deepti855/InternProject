'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';

export default function ProductPage() {
  const params = useParams();
  const id = params?.id || '1';
  const price = 99.99;
  const productName = 'Premium Eco Product';
  
  const [loading, setLoading] = useState(false);

  const handleBuyNow = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, price, productName })
      });
      
      if (!res.ok) {
        throw new Error('API failed to respond correctly');
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Stripe connection failed");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Stripe connection failed");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-12 text-center mt-12 bg-white rounded-3xl shadow-xl">
      <div className="bg-gray-100 aspect-square w-64 h-64 mx-auto mb-8 rounded-2xl"></div>
      
      <h1 className="text-4xl font-extrabold mb-4">{productName}</h1>
      <p className="text-2xl font-bold text-gray-700 mb-8">${price}</p>
      
      <button 
        onClick={handleBuyNow} 
        disabled={loading}
        className="w-full max-w-sm mx-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl transition-colors text-xl flex items-center justify-center shadow-lg"
      >
        {loading ? 'Redirecting to Secure Checkout...' : 'Buy Now'}
      </button>
    </div>
  );
}
