const db = require("../config/db");
const { postSchema } = require("../schemas/postSchema");
const { getSustainabilityScore, getCommunityImpact } = require("../services/sustainabilityScorer");

exports.createPost = async (req, res) => {
  const { error } = postSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  
  const { title, content, product_name, brand, sustainability_category, product_link, material_id } = req.body;
  const user_id = req.user.id;
  
  // Use uploaded file if present
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  const normalizedCategory = sustainability_category || null;
  const normalizedLink = product_link || null;

  // New validation: Create or get product based on material
  // (In a real app, product creation might be separate, but for this task, 
  // we'll auto-link to a newly created product)
  db.run(
    "INSERT INTO products (name, price, warehouse_lat, warehouse_long, material_id, creator_id) VALUES (?, ?, ?, ?, ?, ?)",
    [product_name || "New Product", 99.99, 45.52, -122.67, material_id || 1, user_id],
    async function(err) {
      if (err) return res.status(500).json({ message: "Error creating product linkage" });
      
      const product_id = this.lastID;
      const scoringPayload = {
        title,
        content,
        product_name: product_name || null,
        brand: brand || null,
        sustainability_category: normalizedCategory,
        product_link: normalizedLink,
      };
      const sustainabilityResult = await getSustainabilityScore(scoringPayload);

      db.run(
        "INSERT INTO posts (title, content, user_id, image_url, product_name, brand, sustainability_category, product_link, sustainability_score, sustainability_explanation, sustainability_source, product_id, purchases_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          title,
          content,
          user_id,
          image_url,
          product_name || null,
          brand || null,
          normalizedCategory,
          normalizedLink,
          sustainabilityResult.score,
          sustainabilityResult.explanation,
          sustainabilityResult.source,
          product_id,
          120, // Default for task demo 
        ],
        function (err) {
          if (err) return res.status(500).json({ message: "Error creating post", err: err.message });
          res.status(201).json({ id: this.lastID });
        }
      );
    }
  );
};

exports.getAllPosts = (req, res) => {
  const { category, sort = "newest" } = req.query;
  const allowedCategories = ["eco-friendly", "zero-waste", "fair-trade"];
  const whereClauses = [];
  const params = [];

  if (category && allowedCategories.includes(category)) {
    whereClauses.push("posts.sustainability_category = ?");
    params.push(category);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
  const orderBySql =
    sort === "trending"
      ? "ORDER BY ((SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) * 2 + (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id)) DESC, posts.created_at DESC"
      : "ORDER BY posts.created_at DESC";

  const query = `
    SELECT posts.*, users.username, users.id as author_id,
      p.warehouse_lat, p.warehouse_long, p.price as product_price,
      sd.carbon_per_unit, sd.material_name,
      (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) as likesCount,
      (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id) as commentsCount
    FROM posts 
    JOIN users ON posts.user_id = users.id
    LEFT JOIN products p ON posts.product_id = p.id
    LEFT JOIN sustainability_data sd ON p.material_id = sd.id
    ${whereSql}
    ${orderBySql}
  `;
  db.all(query, params, (err, posts) => {
    if (err) return res.status(500).json({ message: "Error fetching posts" });
    
    // Calculate Community Impact stat for each post
    const postsWithImpact = posts.map(p => ({
      ...p,
      communityImpact: getCommunityImpact({ carbon_per_unit: p.carbon_per_unit }, p.purchases_count)
    }));
    
    res.json(postsWithImpact);
  });
};

exports.getUserPosts = (req, res) => {
  const user_id = req.user.id;
  db.all("SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC", [user_id], (err, posts) => {
    if (err) return res.status(500).json({ message: "Error fetching user posts" });
    res.json(posts);
  });
};

exports.updatePost = (req, res) => {
  const { error } = postSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const { id } = req.params;
  const { title, content } = req.body;
  const user_id = req.user.id;
  db.run(
    "UPDATE posts SET title = ?, content = ? WHERE id = ? AND user_id = ?",
    [title, content, id, user_id],
    function (err) {
      if (err) return res.status(500).json({ message: "Error updating post" });
      if (this.changes === 0)
        return res.status(404).json({ message: "Post not found or unauthorized" });
      res.json({ id, title, content });
    },
  );
};

exports.deletePost = (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  db.run(
    "DELETE FROM posts WHERE id = ? AND user_id = ?",
    [id, user_id],
    function (err) {
      if (err) return res.status(500).json({ message: "Error deleting post" });
      if (this.changes === 0)
        return res.status(404).json({ message: "Post not found or unauthorized" });
      
      req.app.get("io").emit("delete_post", id);
      res.json({ message: "Post deleted" });
    },
  );
};

exports.getOnePost = (req, res) => {
  const { id } = req.params;
  db.get(
    "SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = ?",
    [id],
    (err, post) => {
      if (err) return res.status(500).json({ message: "Error fetching post" });
      if (!post) return res.status(404).json({ message: "Post not found" });
      res.json(post);
    }
  );
};

// --- NEW CAPABILITIES ---

exports.toggleLike = (req, res) => {
  const { id: post_id } = req.params;
  const user_id = req.user.id;

  // Check if like exists
  db.get("SELECT * FROM likes WHERE post_id = ? AND user_id = ?", [post_id, user_id], (err, like) => {
      if (err) return res.status(500).json({ message: "DB Error" });
      
      if (like) {
          db.run("DELETE FROM likes WHERE post_id = ? AND user_id = ?", [post_id, user_id], function(err) {
              if (err) return res.status(500).json({ message: "Error unliking" });
              req.app.get("io").emit("like_update", { post_id, delta: -1 });
              res.json({ message: "Unliked successfully", liked: false });
          });
      } else {
          db.run("INSERT INTO likes (post_id, user_id) VALUES (?, ?)", [post_id, user_id], function(err) {
              if (err) return res.status(500).json({ message: "Error liking" });
              req.app.get("io").emit("like_update", { post_id, delta: 1 });
              res.json({ message: "Liked successfully", liked: true });
          });
      }
  });
};

exports.addComment = (req, res) => {
  const { id: post_id } = req.params;
  const user_id = req.user.id;
  const { content, parent_id } = req.body;
  if (!content) return res.status(400).json({ message: "Content is required" });

  db.run("INSERT INTO comments (post_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)", [post_id, user_id, parent_id || null, content], function(err) {
      if (err) return res.status(500).json({ message: "Error posting comment", err: err.message });
      
      const newComment = { id: this.lastID, post_id, user_id, username: req.user.username, parent_id: parent_id || null, content, created_at: new Date().toISOString() };
      req.app.get("io").emit("new_comment", newComment);
      res.status(201).json(newComment);
  });
};

exports.getComments = (req, res) => {
  const { id: post_id } = req.params;
  db.all("SELECT comments.*, users.username FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = ? ORDER BY created_at ASC", [post_id], (err, comments) => {
      if (err) return res.status(500).json({ message: "Error fetching localized comments", err: err.message });
      res.json(comments);
  });
};

exports.checkLikeStatus = (req, res) => {
    const { id: post_id } = req.params;
    const user_id = req.user.id;
    db.get("SELECT 1 FROM likes WHERE post_id = ? AND user_id = ?", [post_id, user_id], (err, row) => {
        if (err) return res.status(500).json({ message: "DB Error" });
        res.json({ liked: !!row });
    });
};
