import { Link } from "react-router-dom";
import {
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiMoreHorizontal,
  FiTrash2,
  FiEdit2,
} from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { postAPI } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import Poll from "./Poll";

ChartJS.register(ArcElement, Tooltip, Legend);

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return "Unknown";
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

export default function PostCard({ post, currentUserId, onDelete }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Interactive State
  const [liked, setLiked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(post.likesCount || 0);

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [localCommentsCount, setLocalCommentsCount] = useState(
    post.commentsCount || 0,
  );
  const [newComment, setNewComment] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserCoords({ lat: 45.52, lng: -122.67 }), // Fallback to Portland for demo
    );
  }, []);

  const isOwner = post.user_id === currentUserId;
  const initial = post.username?.charAt(0).toUpperCase() || "U";

  const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const hasProductReview = !!(
    post.product_name ||
    post.brand ||
    post.sustainability_category
  );
  const score = Number.isFinite(Number(post.sustainability_score))
    ? Number(post.sustainability_score)
    : null;
  const scoreBadgeClass =
    score === null
      ? "bg-gray-100 text-gray-700"
      : score >= 80
        ? "bg-green-100 text-green-700"
        : score >= 60
          ? "bg-amber-100 text-amber-700"
          : "bg-red-100 text-red-700";
  const stars =
    score === null ? 0 : Math.max(1, Math.min(5, Math.round(score / 20)));

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);

    // Fetch initial like status
    if (currentUserId) {
      postAPI
        .checkLike(post.id)
        .then((res) => setLiked(res.data.liked))
        .catch(() => {});
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef, post.id, currentUserId]);

  const [triggerPop, setTriggerPop] = useState(false);

  // Sync external props update (socket bouncing)
  useEffect(() => {
    setLocalLikesCount(post.likesCount || 0);
  }, [post.likesCount]);

  useEffect(() => {
    setLocalCommentsCount(post.commentsCount || 0);
  }, [post.commentsCount]);

  const handleLike = async () => {
    const willLike = !liked;
    if (willLike) {
      setTriggerPop(true);
      setTimeout(() => setTriggerPop(false), 300); // 0.3s haptic pop duration
    }
    try {
      // Optimistic UI
      setLiked(willLike);
      setLocalLikesCount((prev) => (willLike ? prev + 1 : prev - 1));
      await postAPI.like(post.id);
    } catch (err) {
      // Revert
      setLiked(!willLike);
      setLocalLikesCount((prev) => (willLike ? prev - 1 : prev + 1));
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    setShareOpen(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin + `/posts/${post.id}`);
    setShareOpen(false);
  };

  const toggleComments = async () => {
    if (!commentsOpen) {
      try {
        const res = await postAPI.getComments(post.id);
        setComments(res.data);
      } catch (err) {}
    }
    setCommentsOpen(!commentsOpen);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const optimisticComment = {
      id: Date.now(),
      username: "You", // placeholder
      content: newComment,
      created_at: new Date().toISOString(),
    };

    try {
      // Optimistic UI
      setComments((prev) => [...prev, optimisticComment]);
      setLocalCommentsCount((prev) => prev + 1);
      setNewComment("");

      await postAPI.addComment(post.id, { content: newComment });

      // Refetch to sync real IDs mapping
      const res = await postAPI.getComments(post.id);
      setComments(res.data);
    } catch (err) {
      // Revert on fail
      setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
      setLocalCommentsCount((prev) => prev - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
    >
      <Card className="bg-vibin-card rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-vibin-border transition-transform duration-300 ease-in-out hover:scale-[1.01] overflow-hidden">
        <div className="p-6 relative z-10">
          {/* Post Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-vibin-primary/10 text-vibin-primary rounded-full flex items-center justify-center font-bold text-lg">
                {initial}
              </div>
              <div className="flex flex-col">
                <p className="font-semibold text-vibin-text text-base">
                  {post.username || "User"}
                </p>
                <p className="text-sm text-vibin-muted">{formattedDate}</p>
              </div>
            </div>

            {isOwner && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="p-2 text-vibin-muted hover:text-vibin-text rounded-full hover:bg-vibin-bg transition-colors focus:outline-none"
                >
                  <FiMoreHorizontal className="w-6 h-6" />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-full mt-1 w-36 bg-white/80 backdrop-blur-lg rounded-xl shadow-2xl border border-white p-1 z-10"
                    >
                      <Link
                        to={`/edit/${post.id}`}
                        className="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-white hover:text-primary-600 rounded-lg transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        <span>Edit Post</span>
                      </Link>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onDelete(post.id);
                        }}
                        className="w-full text-left flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Post Content */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-vibin-text mb-2 tracking-tight">
              {post.title}
            </h3>
            {hasProductReview && (
              <div className="mb-3 rounded-xl border border-vibin-border/50 bg-vibin-bg/50 p-3 text-sm">
                {post.product_name && (
                  <p className="text-vibin-text font-semibold">
                    {post.product_name}
                  </p>
                )}
                {post.brand && (
                  <p className="text-vibin-muted">Brand: {post.brand}</p>
                )}
                {post.sustainability_category && (
                  <span className="inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    {post.sustainability_category}
                  </span>
                )}
                {post.product_link && (
                  <p className="mt-2">
                    <a
                      href={post.product_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 underline"
                    >
                      View product link
                    </a>
                  </p>
                )}
                {score !== null && (
                  <div className="mt-3 relative group">
                    <div
                      onMouseEnter={() => setShowChart(true)}
                      onMouseLeave={() => setShowChart(false)}
                      className={`inline-flex flex-col gap-1 cursor-help px-3 py-2 rounded-xl transition-all ${scoreBadgeClass} border border-current/10`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌿</span>
                        <span className="font-bold text-sm tracking-tight">
                          {score}/100 Eco-Score
                        </span>
                        <span className="text-[10px] opacity-70">
                          {"★".repeat(stars)}
                          {"☆".repeat(5 - stars)}
                        </span>
                      </div>

                      {post.communityImpact && (
                        <div className="flex items-center gap-1.5 mt-1 animate-pulse">
                          <span className="text-xs font-black uppercase tracking-tighter bg-emerald-600 text-white px-1.5 py-0.5 rounded-md">
                            Community Offset
                          </span>
                          <span className="text-xs font-bold">
                            {post.communityImpact.message}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold opacity-80 uppercase tracking-widest">
                        <span>
                          📍{" "}
                          {calculateDistance(
                            userCoords?.lat,
                            userCoords?.lng,
                            post.warehouse_lat,
                            post.warehouse_long,
                          )}{" "}
                          km away
                        </span>
                      </div>
                    </div>

                    <AnimatePresence>
                      {showChart && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          className="fixed left-1/2 top-1/2 z-[70] w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-xl p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white"
                        >
                          <h4 className="text-sm font-black text-gray-800 mb-3 uppercase tracking-widest border-b pb-2">
                            Sustainability Breakdown
                          </h4>
                          <div className="h-40 flex items-center justify-center">
                            <Doughnut
                              data={{
                                labels: ["Eco", "Carbon", "Water"],
                                datasets: [
                                  {
                                    data: [score, 100 - score, 50],
                                    backgroundColor: [
                                      "#A7C98F",
                                      "#FFB7B7",
                                      "#B7D9E8",
                                    ],
                                    borderWidth: 0,
                                    hoverOffset: 10,
                                  },
                                ],
                              }}
                              options={{
                                plugins: { legend: { display: false } },
                                cutout: "70%",
                              }}
                            />
                            <div className="absolute flex flex-col items-center">
                              <span className="text-2xl font-black text-[#4A5D4E]">
                                {score}%
                              </span>
                              <span className="text-[8px] font-bold text-gray-400 uppercase">
                                Impact
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-4 leading-relaxed font-medium italic">
                            "{post.sustainability_explanation}"
                          </p>
                          <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-[9px] font-black uppercase text-gray-400">
                            <div>
                              Material:{" "}
                              <span className="text-gray-800">
                                {post.material_name}
                              </span>
                            </div>
                            <div>
                              Packaging:{" "}
                              <span className="text-gray-800">Minimal</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
            <p className="text-vibin-body whitespace-pre-wrap leading-relaxed text-base">
              {post.content}
            </p>
            {post.image_url && (
              <div className="mt-4 overflow-hidden rounded-xl bg-gray-50">
                <img
                  src={`${API_BASE_URL}${post.image_url}`}
                  alt="Post attachment"
                  className="w-full object-cover h-auto rounded-xl hover:scale-[1.01] transition-transform duration-700"
                />
              </div>
            )}
            {/* Render Poll Component Mock for demonstration */}
            {post.title.toLowerCase().includes("poll") && (
              <Poll
                pollData={{
                  question: "Cast your vote:",
                  options: [
                    { id: 1, text: "Option A", votes: 12 },
                    { id: 2, text: "Option B", votes: 45 },
                  ],
                }}
                onVote={() => console.log("Mock Vote action")}
              />
            )}
          </div>

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-5 border-t border-vibin-border/50 mt-6">
            <div className="flex items-center space-x-8">
              <motion.button
                onClick={handleLike}
                className={`flex items-center space-x-2 font-medium transition-colors ${liked ? "text-vibin-primary" : "text-vibin-muted hover:text-vibin-primaryHover"}`}
              >
                <FiHeart
                  className={`w-5 h-5 stroke-[1.5] ${triggerPop ? "haptic-pop" : ""} ${liked ? "fill-current stroke-none text-vibin-primary" : ""}`}
                />
                <span>{localLikesCount}</span>
              </motion.button>

              <motion.button
                onClick={toggleComments}
                className="flex items-center space-x-2 text-vibin-muted hover:text-vibin-primaryHover font-medium transition-colors"
              >
                <FiMessageCircle className="w-5 h-5 stroke-[1.5]" />
                <span>{localCommentsCount}</span>
              </motion.button>
            </div>

            <motion.button
              onClick={handleShare}
              className="flex items-center space-x-2 text-vibin-muted hover:text-vibin-primaryHover font-medium transition-colors"
            >
              <FiShare2 className="w-5 h-5 stroke-[1.5]" />
            </motion.button>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {commentsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-4 pt-4 border-t border-gray-200/60"
              >
                <form
                  onSubmit={submitComment}
                  className="flex items-center space-x-3 mb-4"
                >
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 glass-input rounded-full h-10 px-5 text-sm font-medium outline-none text-white placeholder-gray-300"
                  />
                  <Button
                    size="sm"
                    type="submit"
                    className="rounded-full px-6 font-bold hover:scale-105 transition-transform"
                  >
                    Post
                  </Button>
                </form>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-start space-x-3 bg-black/20 p-4 rounded-2xl border border-white/10"
                    >
                      <div className="w-8 h-8 bg-gradient-to-tr from-gray-700 to-gray-500 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm flex-shrink-0">
                        {c.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-200">
                          {c.username}
                        </p>
                        <p className="text-sm text-gray-100 leading-relaxed mt-0.5">
                          {c.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Share Modal */}
          <AnimatePresence>
            {shareOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm"
                  onClick={() => setShareOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm bg-gray-900 border border-white/20 p-6 rounded-3xl shadow-2xl glass-card"
                >
                  <h3 className="text-2xl font-extrabold text-white mb-6 text-center tracking-tight">
                    Share this post
                  </h3>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {["Twitter", "Facebook", "LinkedIn", "Copy Link"].map(
                      (app, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={
                            app === "Copy Link"
                              ? copyLink
                              : () => setShareOpen(false)
                          }
                          className="flex flex-col items-center space-y-2"
                        >
                          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white text-2xl shadow-inner border border-white/5">
                            {app === "Copy Link" ? "🔗" : "📱"}
                          </div>
                          <span className="text-xs font-bold text-gray-300">
                            {app}
                          </span>
                        </motion.button>
                      ),
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setShareOpen(false)}
                  >
                    Cancel
                  </Button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}
