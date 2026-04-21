import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sustainabilityAPI, checkoutAPI } from '../services/api';
import { Radar } from 'react-chartjs-2';
import CountUp from 'react-countup';
import { FiArrowLeft, FiMapPin, FiTruck, FiShield, FiGlobe, FiZap } from 'react-icons/fi';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { calculateEcoScore, calculateDistanceKm } from '../utils/calculateEcoScore';
import { Link } from 'react-router-dom';

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const mapRecyclability = (r) => {
    if (r === 'High') return 100;
    if (r === 'Medium') return 60;
    return 20;
};

export default function ShowcaseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkingOut, setCheckingOut] = useState(false);
  const [includeCarbonOffset, setIncludeCarbonOffset] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await sustainabilityAPI.getProductById(id);
                const score = calculateEcoScore(res.data);
                setProduct({
                    ...res.data,
                    eco_score: score,
                    carbon_offset: ((5.0 - res.data.carbon_per_unit) * 10).toFixed(1)
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handlePurchase = async () => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }
        setCheckingOut(true);
        try {
            const carbonOffsetFee = includeCarbonOffset ? Number((Math.max(0, Number(product.carbon_offset)) * 0.15).toFixed(2)) : 0;
            const res = await checkoutAPI.createSession({
                productId: product.id,
                ecoScore: product.eco_score,
                carbonOffset: product.carbon_offset,
                includeCarbonOffset,
                carbonOffsetFee,
            });
            // Redirect to Stripe
            window.location.href = res.data.url;
        } catch (err) {
            console.error('Checkout failed', err);
            setCheckingOut(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center">Product Not Found</div>;
    const userLat = Number(user?.home_lat ?? 40.7128);
    const userLong = Number(user?.home_long ?? -74.0060);
    const distanceKm = calculateDistanceKm(
      Number(product.warehouse_lat),
      Number(product.warehouse_long),
      userLat,
      userLong
    );
    const carbonOffsetFee = Number((Math.max(0, Number(product.carbon_offset)) * 0.15).toFixed(2));

    const radarData = {
        labels: ['Carbon Efficiency', 'Water Conservation', 'Recyclability', 'Material Purity', 'Lifecycle Score'],
        datasets: [
            {
                label: 'This Product',
                data: [
                    (10 - product.carbon_per_unit) * 10, 
                    (1000 - product.water_usage) / 10,
                    mapRecyclability(product.recyclability),
                    85,
                    product.eco_score
                ],
                backgroundColor: 'rgba(167, 201, 143, 0.4)',
                borderColor: '#A7C98F',
                borderWidth: 2,
            },
            {
                label: 'Industry Average',
                data: [40, 50, 30, 60, 45],
                backgroundColor: 'rgba(200, 200, 200, 0.2)',
                borderColor: '#E2E8F0',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="bg-[#FBFAF8] min-h-screen">
            <AnimatePresence>
                {checkingOut && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-vibin-primary/90 flex flex-col items-center justify-center text-white"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="text-9xl mb-8"
                        >
                            <FiGlobe />
                        </motion.div>
                        <h2 className="text-3xl font-black mb-2">Redirecting to Secure Checkout...</h2>
                        <p className="font-medium opacity-80 italic">Connecting to verified payment gateway...</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900 transition-colors mb-8">
                    <FiArrowLeft /> Back to Showcase
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Left side: Gallery */}
                    <div className="space-y-6">
                        <motion.div 
                            layoutId={`product-image-${product.id}`}
                            className="aspect-[4/5] bg-white rounded-[3rem] overflow-hidden shadow-2xl relative group cursor-crosshair"
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                        >
                            <img 
                                src={`https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=2000`} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                alt={product.name}
                            />
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                        
                        <div className="grid grid-cols-4 gap-4">
                            {[1,2,3,4].map(n => (
                                <div key={n} className="aspect-square bg-white rounded-2xl overflow-hidden border-2 border-transparent hover:border-vibin-primary cursor-pointer transition-all shadow-md">
                                     <img src={`https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=500`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right side: Eco-Dashboard */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-[#A7C98F]/20 text-[#2D3E33] text-xs font-black rounded-full uppercase tracking-widest border border-[#A7C98F]/30">
                                    {product.material_name} Verified
                                </span>
                            </div>
                            <h1 className="text-5xl font-black text-gray-900 leading-tight mb-4">{product.name}</h1>
                            <p className="text-lg text-gray-500 font-medium">Revolutionary sustainability meets premium design. A testament to circular economy principles.</p>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sustainability Score</p>
                                <div className="text-6xl font-black text-vibin-primary">
                                    <CountUp end={product.eco_score} duration={3} />
                                    <span className="text-2xl ml-1">/100</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Carbon Saved</p>
                                <div className="text-6xl font-black text-gray-900 group">
                                     <span className="text-vibin-primary group-hover:text-green-600 transition-colors">
                                        <CountUp end={product.carbon_offset} decimals={1} duration={3} />
                                     </span>
                                     <span className="text-2xl ml-1">kg</span>
                                </div>
                            </div>
                        </div>

                        {/* Radar Chart */}
                        <div className="bg-[#2B4C63] p-8 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
                             <div className="absolute top-0 right-0 p-8 text-white/5 text-8xl font-black select-none pointer-events-none">IMPACT</div>
                             <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                                <FiZap className="text-vibin-primary" /> Multi-Dimensional Impact Analysis
                             </h3>
                             <div className="h-[300px]">
                                <Radar 
                                    data={radarData} 
                                    options={{
                                        scales: {
                                            r: {
                                                grid: { color: 'rgba(255,255,255,0.05)' },
                                                angleLines: { color: 'rgba(255,255,255,0.05)' },
                                                pointLabels: { color: 'rgba(255,255,255,0.5)', font: { weight: 'bold' } },
                                                ticks: { display: false }
                                            }
                                        },
                                        plugins: { legend: { display: false } }
                                    }} 
                                />
                             </div>
                        </div>

                        {/* Map Component Placeholder */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
                             <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FiTruck className="text-vibin-primary" /> Traceability Route
                             </h3>
                             <div className="bg-gray-50 rounded-2xl h-32 flex items-center justify-between px-12 relative overflow-hidden">
                                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-vibin-primary/5 to-transparent animate-shimmer" />
                                 <div className="flex flex-col items-center relative z-10">
                                     <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center"><FiMapPin /></div>
                                     <span className="text-[10px] font-black mt-2 uppercase text-gray-400">Warehouse</span>
                                 </div>
                                 <div className="flex-1 mx-4 h-[2px] bg-dashed border-t-2 border-dashed border-vibin-primary/30 relative">
                                      <motion.div 
                                        className="absolute top-[-4px] left-0 text-vibin-primary"
                                        animate={{ left: "100%" }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                      >
                                          <FiTruck size={14} />
                                      </motion.div>
                                 </div>
                                 <div className="flex flex-col items-center relative z-10">
                                     <div className="w-10 h-10 bg-vibin-primary text-white rounded-full flex items-center justify-center"><FiShield /></div>
                                     <span className="text-[10px] font-black mt-2 uppercase text-vibin-primary">You</span>
                                 </div>
                             </div>
                             <p className="text-[10px] text-center mt-4 text-gray-400 font-bold uppercase tracking-widest">
                               Distance to you: {distanceKm.toFixed(1)} km | Estimated Delivery Footprint: {(distanceKm * 0.004).toFixed(2)}kg CO2
                             </p>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-gray-100">
                          <h3 className="font-bold text-gray-900 mb-3">Seller Info</h3>
                          <p className="text-sm text-gray-600">
                            Listed by verified sustainability seller. Want to see updates and community reactions?
                          </p>
                          <Link to="/dashboard" className="inline-block mt-3 text-sm font-semibold text-vibin-primary hover:underline">
                            View seller activity in Social Feed
                          </Link>
                        </div>

                        <div className="flex items-center gap-6 pt-4">
                             <div className="flex-1">
                                 <div className="text-4xl font-black text-gray-900 mb-1">${product.price}</div>
                                 <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Free Climate-Positive Shipping</div>
                                 <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-gray-700">
                                   <input
                                     type="checkbox"
                                     checked={includeCarbonOffset}
                                     onChange={(e) => setIncludeCarbonOffset(e.target.checked)}
                                   />
                                   Add Carbon Offset Fee (${carbonOffsetFee.toFixed(2)})
                                 </label>
                             </div>
                             <button 
                                className={`flex-1 h-16 rounded-2xl text-lg font-black tracking-widest bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-lg ${checkingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handlePurchase}
                                disabled={checkingOut}
                             >
                                 BUY NOW
                             </button>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
              {showAuthModal && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm"
                    onClick={() => setShowAuthModal(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed z-[121] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 border border-white/40 backdrop-blur-xl rounded-3xl p-6 w-[90vw] max-w-md shadow-2xl"
                  >
                    <h3 className="text-xl font-bold text-white mb-2">Login Required</h3>
                    <p className="text-sm text-white/90 mb-5">
                      Please log in to continue checkout and track your eco-impact.
                    </p>
                    <div className="flex gap-3">
                      <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowAuthModal(false)}>
                        Cancel
                      </Button>
                      <Button type="button" className="flex-1" onClick={() => navigate('/login')}>
                        Go to Login
                      </Button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
        </div>
    );
}
