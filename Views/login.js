// login.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const { ObjectId } = require('mongodb');

// Setup session middleware
router.use(session({
    secret: 'your-secret-key', // Use a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 60 * 1000, secure: false } // 30-minute session expiry
}));

// Display login form
router.get('/', (req, res) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>User Login - My Node.js App</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background-color: #f5f5f5;
            }
            header {
                text-align: center;
                margin-bottom: 20px;
            }
            .login-container {
                width: 100%;
                max-width: 400px;
                padding: 20px;
            }
            .login-card {
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                padding: 20px;
                text-align: center;
            }
            .login-card h2 {
                color: #333;
            }
            .form-group {
                margin-bottom: 15px;
                text-align: left;
            }
            .form-group label {
                display: block;
                margin-bottom: 5px;
                color: #333;
            }
            .form-group input[type="email"],
            .form-group input[type="password"] {
                width: 100%;
                padding: 10px;
                font-size: 1em;
                border: 1px solid #ddd;
                border-radius: 5px;
            }
            .form-group input[type="checkbox"] {
                margin-right: 5px;
            }
            .form-group .forgot-password {
                text-align: right;
                margin-top: 5px;
            }
            .form-group .forgot-password a {
                color: #7B97D3;
                text-decoration: none;
                font-size: 0.9em;
            }
            button[type="submit"] {
                width: 100%;
                padding: 10px;
                background-color: #7B97D3;
                color: white;
                font-size: 1em;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            }
            footer {
                text-align: center;
                margin-top: 20px;
                color: #999;
            }
        </style>
    </head>
    <body>
        <header>
            <h1>User Login</h1>
            <a href="/" style="color: #7B97D3; margin: 0 15px; text-decoration: none; font-size: 1.1em;">Home</a>
        </header>
        <main>
            <section class="login-container">
                <div class="login-card">
                    <h2>Login to Your Account</h2>
                    <form action="/login" method="POST" class="login-form">
                        <div class="form-group">
                            <label for="email">Email:</label>
                            <input type="email" id="email" name="email" placeholder="Enter your email" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password:</label>
                            <input type="password" id="password" name="password" placeholder="Enter your password" required>
                            <input type="checkbox" id="showPassword"> Show Password
                        </div>
                        <div class="form-group forgot-password">
                            <a href="/forgotpassword">Forgot Password?</a>
                        </div>
                        <button type="submit">Login</button>
                    </form>
                    <p>Don't have an account? <a href="/register">Register here</a></p>
                </div>
            </section>
        </main>
        <footer>
            <p>&copy; 2024 My Node.js App</p>
        </footer>
        <script>
            document.getElementById('showPassword').addEventListener('change', function () {
                const passwordField = document.getElementById('password');
                if (this.checked) {
                    passwordField.type = 'text';
                } else {
                    passwordField.type = 'password';
                }
            });
        </script>
    </body>
    </html>
    `;
    res.send(htmlContent);
});

// Handle user login
router.post('/', async (req, res) => {
    const { email, password } = req.body;

    const db = getDb();

    try {
        // Find user by email
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.send('No account found with that email.');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.send('Invalid credentials.');
        }

        // Check if email is verified
        if (!user.emailVerified) {
            return res.send('Please verify your email before logging in.');
        }

        // Set user session with sessionCode
        req.session.userId = user._id;
        req.session.sessionCode = Math.random().toString(36).substr(2, 9); // Random session code

        // Redirect to dashboard
        res.redirect('/dashboard');

    } catch (err) {
        console.error('Error logging in:', err);
        res.send('Error logging in. Please try again later.');
    }
});

module.exports = router;
