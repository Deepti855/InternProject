import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { postAPI } from "../services/api";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import Card from "../components/ui/Card";
import PostCard from "../components/PostCard";
import { motion, AnimatePresence } from "framer-motion";

function Dashboard() {
  const { user } = useAuth();
  const socket = useSocket();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const categoryFilters = [
    { label: "All", value: "" },
    { label: "Eco-friendly", value: "eco-friendly" },
    { label: "Zero-waste", value: "zero-waste" },
    { label: "Fair-trade", value: "fair-trade" },
  ];

  const sortFilters = [
    { label: "Newest", value: "newest" },
    { label: "Trending", value: "trending" },
  ];

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    if (!socket) return;

    socket.on("new_post", (post) => {
      setPosts((prev) => [post, ...prev]);
    });

    socket.on("delete_post", (postId) => {
      setPosts((prev) => prev.filter((p) => p.id !== parseInt(postId)));
    });

    socket.on("like_update", ({ post_id, delta }) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === parseInt(post_id)
            ? { ...p, likesCount: (p.likesCount || 0) + delta }
            : p,
        ),
      );
    });

    socket.on("new_comment", (comment) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === parseInt(comment.post_id)
            ? { ...p, commentsCount: (p.commentsCount || 0) + 1 }
            : p,
        ),
      );
    });

    return () => {
      socket.off("new_post");
      socket.off("delete_post");
      socket.off("like_update");
      socket.off("new_comment");
    };
  }, [socket]);

  const fetchPosts = async () => {
    try {
      const params = {};
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      if (sortBy) {
        params.sort = sortBy;
      }
      const response = await postAPI.getAll(params);
      setPosts(response.data);
      setError("");
    } catch (err) {
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await postAPI.delete(postId);
      // We don't need to manually filter here anymore if socket bounces it back,
      // but pessimistic update is fine for speed.
      setPosts(posts.filter((p) => p.id !== postId));
    } catch (err) {
      setError("Failed to delete post");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto w-full flex flex-col space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-vibin-card/50 border border-vibin-border/20 rounded-xl h-64 shimmer"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:gap-3 sm:flex-row sm:justify-between mb-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {categoryFilters.map((filter) => (
              <button
                key={filter.value || "all"}
                onClick={() => setSelectedCategory(filter.value)}
                aria-pressed={selectedCategory === filter.value}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  selectedCategory === filter.value
                    ? "bg-vibin-primary text-white border-vibin-primary"
                    : "bg-vibin-card text-vibin-text border-vibin-border hover:bg-vibin-border/20"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {sortFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSortBy(filter.value)}
                aria-pressed={sortBy === filter.value}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  sortBy === filter.value
                    ? "bg-vibin-primary text-white border-vibin-primary"
                    : "bg-vibin-card text-vibin-text border-vibin-border hover:bg-vibin-border/20"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border border-vibin-border bg-vibin-card text-sm"
            >
              <option value="">All categories</option>
              <option value="eco-friendly">Eco-friendly</option>
              <option value="zero-waste">Zero-waste</option>
              <option value="fair-trade">Fair-trade</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border border-vibin-border bg-vibin-card text-sm"
            >
              <option value="newest">Newest</option>
              <option value="trending">Trending products</option>
            </select>
          </div>
        </div>
        <Link to="/create">
          <button className="w-full sm:w-auto px-5 py-2 rounded-lg font-semibold text-sm border border-vibin-primary text-vibin-primary hover:bg-vibin-primary hover:text-white transition-all shadow-sm">
            Create Post
          </button>
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 glass-card border border-red-200/50 rounded-lg text-red-600 font-semibold text-sm">
          {error}
        </div>
      )}

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <Card className="glass-card flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <span className="text-2xl text-gray-400">📝</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">No posts yet</h3>
          <p className="text-gray-300 font-medium mb-6 max-w-sm">
            When you follow people, their posts will show up here.
          </p>
          <Link to="/create">
            <Button variant="secondary">Create your first post</Button>
          </Link>
        </Card>
      ) : (
        <div className="flex flex-col space-y-6">
          <AnimatePresence>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
