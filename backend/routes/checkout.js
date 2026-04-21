const express = require("express");
const router = express.Router();
const checkoutController = require("../controllers/checkoutController");
const auth = require("../middleware/auth");

router.post("/create-session", auth, checkoutController.createCheckoutSession);
router.get("/session/:sessionId", auth, checkoutController.getSession);
router.post("/complete", auth, checkoutController.completeCheckout);

module.exports = router;
