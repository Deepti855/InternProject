const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get chat history with a specific user
router.get('/:userId', auth, (req, res) => {
   const me = req.user.id;
   const other = req.params.userId;
   db.all(`SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC`, 
    [me, other, other, me],
    (err, rows) => {
       if (err) return res.status(500).json({ error: err.message });
       res.json(rows);
    }
   );
});

module.exports = router;
