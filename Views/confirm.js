const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const bcrypt = require('bcrypt');
const useragent = require('useragent');
const { v4: uuidv4 } = require('uuid');

// Route to display login page
router.get('/', (req, res) => {
    const errorMessage = req.session.errorMessage || '';
    req.session.errorMessage = ''; // Reset error message

    const lockedOutUntil = req.session.lockedOutUntil || 0;
    const currentTime = Date.now();
    const isLockedOut = currentTime < lockedOutUntil;
    const remainingTime = isLockedOut ? Math.ceil((lockedOutUntil - currentTime) / 1000) : 0;

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login</title>
            <style>
                body { background-color: #fce4ec; font-family: Arial, sans-serif; }
                .container { max-width: 400px; margin: 100px auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); }
                h1 { color: #e91e63; text-align: center; }
                .form-group { margin-bottom: 15px; }
                label { display: block; margin-bottom: 5px; }
                input, select, button { width: 100%; padding: 10px; }
                button { background-color: #e91e63; color: white; border: none; cursor: pointer; }
                .error { color: red; text-align: center; }
            </style>
            <script>
                window.onload = function() {
                    var remainingTime = ${remainingTime};
                    if (remainingTime > 0) {
                        var countdown = setInterval(function() {
                            document.getElementById('countdown').textContent = remainingTime + ' seconds remaining';
                            remainingTime--;
                            if (remainingTime <= 0) clearInterval(countdown);
                        }, 1000);
                    }
                };
            </script>
        </head>
        <body>
            <div class="container">
                <h1>Login</h1>
                <form action="/login" method="POST">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit">Login</button>
                    <p id="countdown" class="error"></p>
                    <p class="error">${errorMessage}</p>
                </form>
            </div>
        </body>
        </html>
    `);
});

// Route to handle login form submission
router.post('/', async (req, res) => {
    const { email, password } = req.body;
    const db = getDb();
    const currentTime = Date.now();

    // Lockout logic
    if (req.session.lockedOutUntil && currentTime < req.session.lockedOutUntil) {
        req.session.errorMessage = 'Too many failed login attempts. Please try again later.';
        return res.redirect('/');
    }

    try {
        const user = await db.collection('users').findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            req.session.attempts = (req.session.attempts || 0) + 1;
            if (req.session.attempts >= 3) {
                req.session.lockedOutUntil = currentTime + 30 * 1000; // Lock for 30 seconds
                req.session.errorMessage = 'Too many failed attempts. Try again in 30 seconds.';
            } else {
                req.session.errorMessage = `Invalid credentials. ${3 - req.session.attempts} attempts left.`;
            }
            return res.redirect('/');
        }

        // Reset attempts and set session
        req.session.attempts = 0;
        req.session.user = {
            id: user._id,
            email: user.email,
            sessionCode: uuidv4(),
        };

        // Log details
        const agent = useragent.parse(req.headers['user-agent']);
        await db.collection('logs').insertOne({
            userId: user._id,
            loginTime: new Date(),
            device: `${agent.family} on ${agent.os.family} (${agent.device.family})`,
            sessionCode: req.session.user.sessionCode,
        });

        res.redirect('/dashboard'); // Redirect to dashboard or another page

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
