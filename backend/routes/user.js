const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

router.get("/", auth, userController.getAllUsers);
router.get("/me", auth, userController.getMe);
router.get("/:id", auth, userController.getUserById);
router.patch("/:id/toggle-ban", auth, userController.toggleBan);
router.delete("/:id", auth, userController.deleteUser);

module.exports = router;
