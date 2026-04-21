const db = require('../config/db');

// Add missing columns to existing tables using safe alter
const upgradeSchema = () => {
  db.serialize(() => {
    // Add image_url to posts
    db.run(`ALTER TABLE posts ADD COLUMN image_url TEXT`, () => {});
    db.run(`ALTER TABLE posts ADD COLUMN product_name TEXT`, () => {});
    db.run(`ALTER TABLE posts ADD COLUMN brand TEXT`, () => {});
    db.run(`ALTER TABLE posts ADD COLUMN sustainability_category TEXT`, () => {});
    db.run(`ALTER TABLE posts ADD COLUMN product_link TEXT`, () => {});
    db.run(`ALTER TABLE posts ADD COLUMN sustainability_score INTEGER`, () => {});
    db.run(`ALTER TABLE posts ADD COLUMN sustainability_explanation TEXT`, () => {});
    db.run(`ALTER TABLE posts ADD COLUMN sustainability_source TEXT`, () => {});

    // Create Comments table
    db.run(`CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      parent_id INTEGER,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(parent_id) REFERENCES comments(id) ON DELETE CASCADE
    )`);

    // Create Likes table
    db.run(`CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(post_id, user_id),
      FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Create Messages table for DM
    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(receiver_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Create Eco Assistant chat history table
    db.run(`CREATE TABLE IF NOT EXISTS eco_assistant_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // New Eco-Trace Schema
    db.run(`CREATE TABLE IF NOT EXISTS sustainability_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_name TEXT UNIQUE NOT NULL,
      carbon_per_unit REAL NOT NULL,
      water_usage REAL NOT NULL,
      recyclability TEXT NOT NULL
    )`);

    db.run(`INSERT OR IGNORE INTO sustainability_data (id, material_name, carbon_per_unit, water_usage, recyclability) VALUES 
      (1, 'Recycled Steel', 1.5, 50, 'High'),
      (2, 'Virgin Plastic', 6.0, 200, 'Low'),
      (3, 'Organic Cotton', 2.0, 500, 'Medium'),
      (4, 'Bamboo', 0.5, 10, 'High')`);
      
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      warehouse_lat REAL NOT NULL,
      warehouse_long REAL NOT NULL,
      material_id INTEGER NOT NULL,
      creator_id INTEGER NOT NULL,
      FOREIGN KEY(material_id) REFERENCES sustainability_data(id)
    )`);

    db.run(`ALTER TABLE posts ADD COLUMN product_id INTEGER`, () => {});
    db.run(`ALTER TABLE posts ADD COLUMN purchases_count INTEGER DEFAULT 100`, () => {});
    db.run(`ALTER TABLE posts ADD COLUMN warehouse_lat REAL`, () => {});
    db.run(`ALTER TABLE posts ADD COLUMN warehouse_long REAL`, () => {});

    // Coordinates for distance-aware experiences (shop/detail eco logic)
    db.run(`ALTER TABLE users ADD COLUMN home_lat REAL`, () => {});
    db.run(`ALTER TABLE users ADD COLUMN home_long REAL`, () => {});

    // Backfill missing coordinates with NYC defaults for demo/test users
    db.run(
      `UPDATE users
       SET home_lat = COALESCE(home_lat, 40.7128),
           home_long = COALESCE(home_long, -74.0060)`
    );
  });
};

upgradeSchema();

module.exports = {
  // Model functions for comments, likes, messages
};
