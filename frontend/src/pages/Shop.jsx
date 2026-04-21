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

export default function Shop() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">
        Premium <span className="text-vibin-primary">Showcase</span>
      </h1>
      
      {/* The Grid: 1 column on mobile, 3 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {mockProducts.map((product) => (
          /* The Squares: aspect-ratio: 1/1 */
          <div 
            key={product.id} 
            className="aspect-square w-full rounded-3xl overflow-hidden relative group shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100"
          >
            {/* The Content: product image (object-cover) */}
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

            <div className="absolute bottom-0 left-0 p-6 w-full">
              {/* Product Name */}
              <h3 className="text-white text-2xl font-bold drop-shadow-md">{product.name}</h3>
            </div>
            
            {/* "Eco-Score" badge in the corner */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-vibin-primary text-sm font-black px-4 py-2 rounded-full shadow-lg border border-white/50 flex items-center gap-2">
              <span className="text-green-600">🌿</span> Score: {product.ecoScore}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
