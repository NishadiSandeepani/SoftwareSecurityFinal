const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const bcrypt = require('bcrypt');
const useragent = require('useragent');
const uuidv4 = require('uuid').v4;

// Route to display login page
router.get('/', (req, res) => {
    const errorMessage = req.session.errorMessage || '';
    req.session.errorMessage = ''; // Reset error message after displaying
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #E0BFB8;
                color: #333;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }
            h1 {
                color: #A95C68;
                text-align: center;
            }
            form {
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                width: 100%;
                max-width: 400px;
            }
            label {
                display: block;
                margin-bottom: 8px;
                font-weight: bold;
            }
            input, select, button {
                width: 100%;
                padding: 10px;
                margin-bottom: 15px;
                border: 1px solid #ccc;
                border-radius: 4px;
                font-size: 1em;
            }
            button {
                background-color: #A95C68;
                color: white;
                border: none;
                cursor: pointer;
            }
            button:hover {
                background-color: #8A4857;
            }
            .links {
                text-align: center;
                margin-top: 10px;
            }
            a {
                color: #A95C68;
                text-decoration: none;
            }
            a:hover {
                text-decoration: underline;
            }
            p {
                color: red;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <form action="/login" method="POST">
            <h1>Login</h1>
            <div>
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" placeholder="Enter your email" required>
            </div>
            <div>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" placeholder="Enter your password" required>
            </div>
            <div>
                <label for="role">Role:</label>
                <select id="role" name="role" required>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <button type="submit">Login</button>
            <p>${errorMessage}</p>
            <div class="links">
                <a href="/forgotpassword">Forgot Password?</a> | 
                <a href="/register">Register</a>
            </div>
        </form>
    </body>
    </html>
    `);
});

// Route to handle login form submission
router.post('/', async (req, res) => {
    const { email, password, role } = req.body;
    const db = getDb();
    const currentTime = Date.now();

    // Initialize attempts if not set
    if (!req.session.attempts) {
        req.session.attempts = 0;
    }

    // Check if user is locked out
    if (req.session.lockedOutUntil && currentTime < req.session.lockedOutUntil) {
        req.session.errorMessage = 'Too many failed login attempts. Please try again later.';
        return res.redirect('/login');
    }

    try {
        const user = await db.collection('users').findOne({ email });

        if (!user) {
            req.session.errorMessage = 'Invalid email or password.';
            return res.redirect('/login');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            req.session.attempts++;
            if (req.session.attempts >= 3) {
                req.session.lockedOutUntil = currentTime + 30 * 1000; // Lock out for 30 seconds
                req.session.errorMessage = 'Too many failed login attempts. Please wait for 30 seconds.';
            } else {
                req.session.errorMessage = `Invalid email or password. You have ${3 - req.session.attempts} attempts remaining.`;
            }
            return res.redirect('/login');
        }

        // Reset attempts after successful login
        req.session.attempts = 0;

        // Log user details
        const agent = useragent.parse(req.headers['user-agent']);
        const deviceDetails = `${agent.family} on ${agent.os.family} (${agent.device.family})`;
        const sessionCode = uuidv4();
        const loginTime = new Date();

        console.log(`User ${user._id} logging in. Session code: ${sessionCode}, Device: ${deviceDetails}, Time: ${loginTime}`);

        await db.collection('logs').insertOne({
            userId: user._id,
            loginTime: loginTime,
            device: deviceDetails,
            sessionCode: sessionCode
        });

        // Set session details
        req.session.user = {
            id: user._id,
            email: user.email,
            sessionCode: sessionCode
        };

        // Redirect based on role
        if (role === 'admin') {
            return res.redirect('/confirm'); 
        } else {
            return res.redirect('/dashboard'); 
        }

    } catch (err) {
        console.error('Error querying the database:', err);
        req.session.errorMessage = 'An error occurred. Please try again.';
        return res.redirect('/login');
    }
});

module.exports = router;
