const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");

// All admin routes require authentication
router.use(auth);

// Admin middleware - check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

router.use(isAdmin);

router.get("/stats", adminController.getStats);
router.get("/posts", adminController.getAllPosts);
router.delete("/posts/:id", adminController.deletePost);

module.exports = router;
