const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { v4: uuidv4 } = require('uuid');
const useragent = require('useragent');
const bcrypt = require('bcrypt');

// Handle GET request for login page
router.get('/', (req, res) => {
    const lockedOutUntil = req.session.lockedOutUntil || 0;
    const currentTime = Date.now();
    const isLockedOut = currentTime < lockedOutUntil;

    const remainingTime = isLockedOut ? Math.ceil((lockedOutUntil - currentTime) / 1000) : 0; // Calculate remaining time in seconds

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login - My Node.js App</title>
        <style>
            /* Pink Theme Styling */
            body {
                font-family: Arial, sans-serif;
                background-color: #fce4ec;
                color: #7b3f7f;
                margin: 0;
                padding: 0;
            }
            header {
                background-color: #e91e63;
                padding: 15px;
                text-align: center;
                color: white;
            }
            header h1 {
                margin: 0;
            }
            a {
                color: #f8bbd0;
                text-decoration: none;
                font-size: 1.1em;
            }
            a:hover {
                color: #fff;
            }
            main {
                display: flex;
                justify-content: center;
                padding: 50px;
            }
            .login-container {
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
                padding: 30px;
                width: 300px;
            }
            .login-card h2 {
                text-align: center;
                color: #e91e63;
                margin-bottom: 20px;
            }
            .form-group {
                margin-bottom: 20px;
            }
            .form-group label {
                display: block;
                font-size: 1.1em;
                color: #7b3f7f;
            }
            .form-group input {
                width: 100%;
                padding: 10px;
                font-size: 1em;
                border: 1px solid #e91e63;
                border-radius: 5px;
                color: #7b3f7f;
                margin-top: 5px;
            }
            button[type="submit"] {
                width: 100%;
                padding: 10px;
                background-color: #e91e63;
                color: white;
                border: none;
                border-radius: 5px;
                font-size: 1.1em;
                cursor: pointer;
            }
            button[type="submit"]:hover {
                background-color: #d81b60;
            }
            p {
                font-size: 0.9em;
                color: #7b3f7f;
                text-align: center;
            }
            .error-message {
                color: red;
                text-align: center;
            }
            footer {
                background-color: #e91e63;
                padding: 10px;
                text-align: center;
                color: white;
            }
        </style>
        <script>
            // JavaScript for countdown timer
            window.onload = function() {
                var remainingTime = ${remainingTime};
                var countdownElement = document.getElementById('countdown');
                var submitButton = document.querySelector('button[type="submit"]');
                var emailInput = document.getElementById('email');
                var passwordInput = document.getElementById('password');

                if (remainingTime > 0) {
                    // Disable form inputs and button
                    submitButton.disabled = true;
                    emailInput.disabled = true;
                    passwordInput.disabled = true;

                    // Start countdown
                    var interval = setInterval(function() {
                        countdownElement.textContent = remainingTime + ' seconds remaining';
                        remainingTime--;

                        if (remainingTime <= 0) {
                            clearInterval(interval);
                            countdownElement.textContent = '';
                            // Enable form inputs and button
                            submitButton.disabled = false;
                            emailInput.disabled = false;
                            passwordInput.disabled = false;
                        }
                    }, 1000);
                }
            };
        </script>
    </head>
    <body>
        <header>
            <h1>Welcome Back</h1>
            <a href="/" style="color: #f8bbd0; margin: 0 15px; text-decoration: none; font-size: 1.1em;">Home</a>
        </header>
        <main>
            <section class="login-container">
                <div class="login-card">
                    <h2>Login</h2>
                    ${req.session.errorMessage ? `<p class="error-message">${req.session.errorMessage}</p>` : ''}
                    <p id="countdown" style="color: red;"></p>
                    <form action="/login" method="POST" class="login-form">
                        <div class="form-group">
                            <label for="email">Email:</label>
                            <input type="email" id="email" name="email" placeholder="Enter your email" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password:</label>
                            <input type="password" id="password" name="password" placeholder="Enter your password" required>
                        </div>
                        <button type="submit">Login</button>
                    </form>
                    <p>Don't have an account? <a href="/register">Register here</a></p>
                    <p><a href="/forgotpassword">Forgot your password?</a></p>
                </div>
            </section>
        </main>
        <footer>
            <p>&copy; 2024 My Node.js App</p>
        </footer>
    </body>
    </html>
    `;
    res.send(htmlContent);
});

// Handle login form submission
router.post('/', async (req, res) => {
    const { email, password } = req.body;
    const db = getDb();

    // Initialize login attempt tracking for the session if it doesn't exist
    if (!req.session.attempts) {
        req.session.attempts = 0;
    }

    const currentTime = Date.now();

    // Check if the user is locked out
    if (req.session.lockedOutUntil && currentTime < req.session.lockedOutUntil) {
        req.session.errorMessage = 'Too many failed login attempts. Please try again later.';
        return res.redirect('/login');
    }

    try {
        // Check user credentials
        const user = await db.collection('users').findOne({ email: email });

        if (user) {
            // Compare the entered password with the hashed password
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                // Reset login attempts after successful login
                req.session.attempts = 0;

                // Log user login time and device info
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

                // Redirect to dashboard after login
                res.redirect('/dashboard');
            } else {
                // Increment login attempts for the session
                req.session.attempts++;

                // If login attempts reach 3, lock the user out for 30 seconds
                if (req.session.attempts >= 3) {
                    req.session.lockedOutUntil = currentTime + 30 * 1000; // 30 seconds from now
                    req.session.errorMessage = 'Too many failed login attempts. Please wait for 30 seconds.';
                } else {
                    req.session.errorMessage = `Invalid email or password. You have ${3 - req.session.attempts} attempts remaining.`;
                }

                res.redirect('/login');
            }
        } else {
            req.session.errorMessage = 'Invalid email or password.';
            res.redirect('/login');
        }
    } catch (err) {
        console.error('Error querying the database:', err);
        req.session.errorMessage = 'An error occurred. Please try again.';
        res.redirect('/login');
    }
});

module.exports = router;
