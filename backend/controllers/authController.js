const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { registerSchema, loginSchema } = require("../schemas/userSchema");
require("dotenv").config();

exports.register = (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const username = (req.body.username || req.body.name || "").trim();
  const email = (req.body.email || "").trim().toLowerCase();
  const { password } = req.body;

  db.get(
    "SELECT * FROM users WHERE LOWER(TRIM(email)) = ? OR LOWER(TRIM(username)) = ?",
    [email, username.toLowerCase()],
    async (err, existingUser) => {
      if (err) {
        return res.status(500).json({ message: "Error checking existing user" });
      }
      if (existingUser) {
        if ((existingUser.email || "").toLowerCase() === email) {
          return res.status(400).json({ message: "Email already registered. Please log in." });
        }
        return res.status(400).json({ message: "Username already taken. Please choose another one." });
      }

      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not set in .env");
        return res.status(500).json({ message: "Server misconfiguration: JWT_SECRET is missing" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const nycLat = 40.7128;
      const nycLong = -74.006;
      db.run(
        `INSERT INTO users (username, email, password, role, home_lat, home_long)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [username, email, hashedPassword, "user", nycLat, nycLong],
        function (insertErr) {
          if (insertErr) {
            console.error("Registration error:", insertErr.message);
            if (insertErr.message.includes("UNIQUE")) {
              return res.status(400).json({
                message: "Email or username already registered. Try logging in instead.",
              });
            }
            if (insertErr.message.includes("no such column")) {
              return res.status(500).json({
                message:
                  "Database schema is out of date. Stop the server, delete backend/database.sqlite, and restart once.",
              });
            }
            return res.status(500).json({ message: "Error registering user" });
          }

          let token;
          try {
            token = jwt.sign(
              { id: this.lastID, username, role: "user" },
              process.env.JWT_SECRET,
              { expiresIn: "1h" },
            );
          } catch (signErr) {
            console.error("JWT sign error:", signErr);
            return res.status(500).json({ message: "Could not create session. Check server logs." });
          }

          res.status(201).json({
            token,
            user: {
              id: this.lastID,
              username,
              email,
              role: "user",
              home_lat: nycLat,
              home_long: nycLong,
            },
          });
        },
      );
    }
  );
};

exports.login = (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const email = (req.body.email || "").trim().toLowerCase();
  const { password } = req.body;
  console.log(`Login attempt for: [${email}]`);
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) {
      console.error("Database error during login:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (!user) {
      console.log(`User not found for: [${email}]`);
      return res.status(400).json({ message: "Invalid credentials" });
    }
    console.log(`User found for: [${email}], comparing passwords...`);

    if (user.is_banned) {
      return res.status(403).json({ message: "Your account has been banned" });
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  });
};

exports.getProfile = (req, res) => {
  db.get("SELECT id, username, email, role, created_at FROM users WHERE id = ?",
    [req.user.id],
    (err, user) => {
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    }
  );
};

exports.updateProfile = (req, res) => {
  const username = (req.body.username || "").trim();
  const email = (req.body.email || "").trim().toLowerCase();

  // Check if email is already taken by another user
  db.get("SELECT * FROM users WHERE (email = ? OR username = ?) AND id != ?", [email, username, req.user.id],
    (err, existingUser) => {
      if (err) return res.status(500).json({ message: "Error checking user availability" });
      if (existingUser) {
        return res.status(400).json({ message: "Email or username already in use" });
      }

      db.run(
        "UPDATE users SET username = ?, email = ? WHERE id = ?",
        [username, email, req.user.id],
        function (err) {
          if (err) return res.status(500).json({ message: "Error updating profile" });
          res.json({ id: req.user.id, username, email });
        }
      );
    }
  );
};
