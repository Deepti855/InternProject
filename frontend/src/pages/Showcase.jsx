import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Masonry from 'react-masonry-css';
import { sustainabilityAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { FiSearch, FiFeather } from 'react-icons/fi';
import Card from '../components/ui/Card';
import { calculateEcoScore } from '../utils/calculateEcoScore';

const breakpointCols = {
  default: 3,
  1100: 2,
  700: 1
};

const getTier = (score) => {
  if (score >= 80) return { label: 'Gold', color: 'text-amber-500', bg: 'bg-amber-100' };
  if (score >= 60) return { label: 'Silver', color: 'text-gray-400', bg: 'bg-gray-100' };
  return { label: 'Bronze', color: 'text-orange-400', bg: 'bg-orange-100' };
};

export default function Showcase() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await sustainabilityAPI.getProducts();
        const enriched = res.data.map(p => ({
          ...p,
          eco_score: p.eco_score || calculateEcoScore(p),
          carbon_saved: ((5.0 - (p.carbon_per_unit || 1.0)) * 10).toFixed(1)
        }));
        setProducts(enriched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    if (!searchQuery) return true;
    return p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           p.material_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center gap-3 mb-2">
          Premium <span className="text-vibin-primary">Purchase Gallery</span>
        </h1>
        <p className="text-gray-500 mb-8">Curated selection of sustainable innovation.</p>

        <div className="w-full max-w-md relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 bg-white/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-vibin-primary/50 transition-all shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-80 bg-gray-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <Masonry
          breakpointCols={breakpointCols}
          className="flex -ml-6 w-auto"
          columnClassName="pl-6 bg-clip-padding"
        >
          {filteredProducts.map(product => {
            const tier = getTier(product.eco_score);
            return (
              <motion.div
                key={product.id}
                layout
                layoutId={`product-card-${product.id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 group"
              >
                <Link to={`/shop/${product.id}`}>
                  <Card className="bg-white/30 backdrop-blur-xl border border-white/50 rounded-[2.5rem] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500">
                    <motion.div
                      layoutId={`product-image-${product.id}`}
                      className="aspect-square bg-gray-100 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#A7C98F]/20 to-transparent z-10" />
                      <div className="w-full h-full flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-700">
                        {product.material_name === 'Bamboo'
                          ? '🪴'
                          : product.material_name === 'Recycled Steel'
                          ? '⛓️'
                          : '🌿'}
                      </div>

                      <div
                        className={`absolute top-6 right-6 ${tier.bg} ${tier.color} px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-white/50 z-20`}
                      >
                        {tier.label} Tier
                      </div>
                    </motion.div>

                    <div className="p-8 relative">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-sm font-medium text-vibin-primary uppercase tracking-widest">
                        {product.material_name}
                      </p>

                      <motion.div
                        className="mt-6 p-4 rounded-3xl bg-[#A7C98F]/10 border border-[#A7C98F]/20 hidden group-hover:block"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex items-center gap-3">
                          <FiFeather className="text-vibin-primary" />
                          <span className="text-xs font-bold text-[#2D3E33]">
                            SAVING {product.carbon_saved}kg CO2
                          </span>
                        </div>
                      </motion.div>

                      <div className="mt-6 flex justify-between items-center">
                        <span className="text-2xl font-black text-gray-900">${product.price}</span>
                        <span className="text-sm font-bold text-gray-400 group-hover:text-vibin-primary transition-colors">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </Masonry>
      )}
    </div>
  );
}