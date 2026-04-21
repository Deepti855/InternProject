const db = require('../config/db');

exports.getMaterials = (req, res) => {
  db.all("SELECT * FROM sustainability_data", (err, materials) => {
    if (err) return res.status(500).json({ message: "Error fetching materials" });
    res.json(materials);
  });
};

exports.getProducts = (req, res) => {
  db.all("SELECT products.*, sd.material_name, sd.carbon_per_unit FROM products JOIN sustainability_data sd ON products.material_id = sd.id", (err, products) => {
      if (err) return res.status(500).json({ message: "Error fetching products" });
      res.json(products);
  });
};

exports.getProductById = (req, res) => {
    const { id } = req.params;
    db.get("SELECT products.*, sd.material_name, sd.carbon_per_unit, sd.water_usage, sd.recyclability FROM products JOIN sustainability_data sd ON products.material_id = sd.id WHERE products.id = ?", [id], (err, product) => {
        if (err || !product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    });
};
