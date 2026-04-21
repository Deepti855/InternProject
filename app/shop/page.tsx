import React from 'react';

const mockProducts = [
  {
    id: 1,
    name: 'Bamboo Toothbrush',
    image: 'https://images.unsplash.com/photo-1600181516264-3ea807ff44b9?auto=format&fit=crop&q=80&w=500',
    ecoScore: 95,
  },
  {
    id: 2,
    name: 'Recycled Steel Bottle',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=500',
    ecoScore: 88,
  },
  {
    id: 3,
    name: 'Organic Cotton Tote',
    image: 'https://images.unsplash.com/photo-1597484662317-9bd7bdda2907?auto=format&fit=crop&q=80&w=500',
    ecoScore: 92,
  },
  {
    id: 4,
    name: 'Beeswax Wraps',
    image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=500',
    ecoScore: 85,
  },
];

export default function PremiumShowcase() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">
        Premium Showcase
      </h1>
      
      {/* 1 column on mobile, 3 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {mockProducts.map((product) => (
          /* aspect-ratio: 1/1 square */
          <div 
            key={product.id} 
            className="aspect-square w-full rounded-2xl overflow-hidden relative shadow-lg group border border-gray-200"
          >
            {/* product image (using object-cover) */}
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

            <div className="absolute bottom-0 left-0 p-6 w-full">
              {/* Name */}
              <h3 className="text-white text-2xl font-bold">{product.name}</h3>
            </div>
            
            {/* Eco-Score badge in the corner */}
            <div className="absolute top-4 right-4 bg-white text-green-700 text-sm font-black px-3 py-1 rounded-full shadow-md">
              🌱 Score: {product.ecoScore}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
