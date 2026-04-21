import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { checkoutAPI } from '../services/api';
import { FiCheckCircle, FiShare2, FiArrowRight, FiShield, FiZap, FiTarget } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Success() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [sharing, setSharing] = useState(false);
    const [shared, setShared] = useState(false);
    const [finalized, setFinalized] = useState(false);

    useEffect(() => {
        if (!sessionId) return;
        const fetchSession = async () => {
            try {
                const res = await checkoutAPI.getSession(sessionId);
                setSession(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchSession();
    }, [sessionId]);

    useEffect(() => {
      if (!sessionId || finalized) return;
      checkoutAPI.complete(sessionId).then(() => setFinalized(true)).catch(() => {});
    }, [sessionId, finalized]);

    const handleShare = async () => {
        setSharing(true);
        try {
            await checkoutAPI.complete(sessionId);
            setShared(true);
            setTimeout(() => navigate('/dashboard'), 3000);
        } catch (err) {
            console.error('Sharing failed', err);
        } finally {
            setSharing(false);
        }
    };

    if (!session) return <div className="min-h-screen flex items-center justify-center">Verifying Payment Status...</div>;

    return (
        <div className="bg-[#FBFAF8] min-h-screen py-20 px-4">
            <div className="max-w-3xl mx-auto">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center mb-12"
                >
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiCheckCircle className="text-vibin-primary text-5xl" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Sustainable Choice Confirmed!</h1>
                    <p className="text-gray-500 font-medium tracking-tight">Your contribution to a greener planet is being processed.</p>
                </motion.div>

                {/* Digital Certificate Card */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="bg-[#2B4C63] border-none rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-12 text-white/5 text-9xl font-black opacity-30 select-none">CERTIFIED</div>
                        
                        <div className="flex justify-between items-start relative z-10 mb-16">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-3 py-1 bg-vibin-primary/20 rounded-full border border-vibin-primary/40 w-fit">
                                    <FiShield className="text-vibin-primary text-sm" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-vibin-primary">Eco-Trace Certificate</span>
                                </div>
                                <h2 className="text-3xl font-black">Digital Impact Certificate</h2>
                                <p className="text-white/60 font-medium italic">Traceability ID: {sessionId.substring(0, 12)}...</p>
                            </div>
                            <div className="w-20 h-20 bg-vibin-primary rounded-3xl flex items-center justify-center transform rotate-12 shadow-xl">
                                <FiCheckCircle size={40} className="text-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-12 relative z-10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><FiZap /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Sustainability Rank</p>
                                        <p className="text-2xl font-black text-vibin-primary">{session.metadata.eco_score}/100</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><FiTarget /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Carbon Neutralized</p>
                                        <p className="text-2xl font-black text-vibin-primary">-{session.metadata.carbon_offset}kg CO2</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex flex-col justify-center text-center">
                                 <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Authenticated By</p>
                                 <div className="text-vibin-primary font-black text-xl tracking-tighter">ECO-TRACE SOCIAL</div>
                                 <div className="text-[8px] text-white/20 mt-1 uppercase tracking-[0.2em]">Blockchain Verified Engine</div>
                            </div>
                        </div>

                        <div className="mt-16 pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
                            <div className="flex -space-x-4">
                                {[1,2,3,4].map(n => (
                                    <div key={n} className="w-10 h-10 border-2 border-[#2B4C63] rounded-full bg-gray-600 flex items-center justify-center text-[10px] font-bold">JD</div>
                                ))}
                                <div className="w-10 h-10 border-2 border-[#2B4C63] rounded-full bg-vibin-primary flex items-center justify-center text-[10px] font-black">+142</div>
                            </div>
                            <p className="text-[10px] text-white/40 font-medium">Join 2,400+ others choosing sustainable futures.</p>
                        </div>
                    </Card>
                </motion.div>

                <div className="mt-12 flex flex-col md:flex-row gap-4">
                    <Button 
                        size="lg" 
                        variant="primary" 
                        className="flex-1 rounded-[1.5rem] h-16 font-black tracking-widest"
                        onClick={handleShare}
                        isLoading={sharing}
                        disabled={shared}
                    >
                        {shared ? 'SHARED SUCCESSFULLY!' : (
                            <span className="flex items-center justify-center gap-3"><FiShare2 /> SHARE TO FEED</span>
                        )}
                    </Button>
                    <Button 
                        size="lg" 
                        variant="outline" 
                        className="flex-1 rounded-[1.5rem] h-16 font-black tracking-widest border-2 hover:bg-gray-100"
                        onClick={() => navigate('/dashboard')}
                    >
                        <span className="flex items-center justify-center gap-3">GO TO FEED <FiArrowRight /></span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
