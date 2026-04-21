const db = require("../config/db");

exports.getStats = (req, res) => {
  const stats = {};

  db.get("SELECT COUNT(*) as count FROM users", [], (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching stats" });
    stats.totalUsers = result.count;

    db.get("SELECT COUNT(*) as count FROM posts", [], (err, result) => {
      if (err) return res.status(500).json({ message: "Error fetching stats" });
      stats.totalPosts = result.count;

      db.get("SELECT COUNT(*) as count FROM users WHERE is_banned = 0", [], (err, result) => {
        if (err) return res.status(500).json({ message: "Error fetching stats" });
        stats.activeUsers = result.count;

        res.json(stats);
      });
    });
  });
};

exports.getAllPosts = (req, res) => {
  db.all(
    `SELECT posts.*, users.username
     FROM posts
     JOIN users ON posts.user_id = users.id
     ORDER BY posts.created_at DESC`,
    [],
    (err, posts) => {
      if (err) return res.status(500).json({ message: "Error fetching posts" });
      res.json(posts);
    }
  );
};

exports.deletePost = (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM posts WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ message: "Error deleting post" });
    if (this.changes === 0) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted successfully" });
  });
};
