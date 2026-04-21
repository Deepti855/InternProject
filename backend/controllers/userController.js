const db = require("../config/db");

exports.getMe = (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role
  });
};

exports.getAllUsers = (req, res) => {
  db.all(
    "SELECT id, username, email, role, is_banned, created_at FROM users",
    [],
    (err, users) => {
      if (err) return res.status(500).json({ message: "Error fetching users" });
      res.json(users);
    }
  );
};

exports.getUserById = (req, res) => {
  const { id } = req.params;
  db.get(
    "SELECT id, username, email, role, created_at FROM users WHERE id = ?",
    [id],
    (err, user) => {
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    }
  );
};

exports.toggleBan = (req, res) => {
  const { id } = req.params;

  db.get("SELECT role FROM users WHERE id = ?", [id], (err, user) => {
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot ban admin user" });
    }

    db.get("SELECT is_banned FROM users WHERE id = ?", [id], (err, currentUser) => {
      const newBanStatus = currentUser.is_banned ? 0 : 1;
      db.run(
        "UPDATE users SET is_banned = ? WHERE id = ?",
        [newBanStatus, id],
        (err) => {
          if (err) return res.status(500).json({ message: "Error updating user status" });
          res.json({ message: newBanStatus ? "User banned" : "User unbanned", is_banned: newBanStatus });
        }
      );
    });
  });
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;

  db.get("SELECT role FROM users WHERE id = ?", [id], (err, user) => {
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot delete admin user" });
    }

    // First delete user's posts
    db.run("DELETE FROM posts WHERE user_id = ?", [id], (err) => {
      if (err) return res.status(500).json({ message: "Error deleting user posts" });

      // Then delete the user
      db.run("DELETE FROM users WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ message: "Error deleting user" });
        res.json({ message: "User deleted successfully" });
      });
    });
  });
};
