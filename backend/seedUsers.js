const db = require('./config/db');
const bcrypt = require('bcrypt');

async function seed() {
    const users = ['testuser1', 'testuser2', 'testuser3', 'testuser4'];
    const password = 'password123';
    const saltRaw = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, saltRaw);

    users.forEach(username => {
        const email = `${username}@test.com`;
        db.run(
            "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
            [username, email, hashedPassword, 'user'],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        console.log(`${username} already exists.`);
                    } else {
                        console.error('Error inserting', username, err.message);
                    }
                } else {
                    console.log(`Inserted ${username} successfully (ID: ${this.lastID})`);
                }
            }
        );
    });
}

seed();
