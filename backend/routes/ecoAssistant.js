const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ecoAssistantController = require("../controllers/ecoAssistantController");

router.get("/history", auth, ecoAssistantController.getHistory);
router.post("/stream", auth, ecoAssistantController.streamReply);

module.exports = router;
