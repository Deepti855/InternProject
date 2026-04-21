const express = require("express");
const router = express.Router();
const sustainabilityController = require("../controllers/sustainabilityController");

router.get("/materials", sustainabilityController.getMaterials);
router.get("/products", sustainabilityController.getProducts);
router.get("/products/:id", sustainabilityController.getProductById);

module.exports = router;
