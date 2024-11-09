const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Route to display the forgot password form and handle verification code input
router.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Forgot Password</title>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #ffe6f0;
                color: #333;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .container {
                background-color: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
                width: 300px;
                text-align: center;
            }
            .container h2 {
                color: #d63384;
            }
            label, input, button {
                display: block;
                width: 100%;
                margin: 8px 0;
            }
            input {
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            button {
                padding: 10px;
                background-color: #d63384;
                color: #fff;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            button:hover {
                background-color: #c2185b;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Forgot Password</h2>
            <form action="/forgotpassword" method="POST">
                <label for="email">Enter your email:</label>
                <input type="email" id="email" name="email" required>
                <button type="submit">Send Verification Code</button>
            </form>

            ${req.session.verificationCodeSent ? `
                <h2>Enter Verification Code</h2>
                <form id="resetPasswordForm">
                    <label for="verificationCode">Verification Code:</label>
                    <input type="text" id="verificationCode" name="verificationCode" required>
                    <label for="newPassword">New Password:</label>
                    <input type="password" id="newPassword" name="newPassword" required>
                    <button type="submit">Reset Password</button>
                </form>
                <script>
                    document.getElementById('resetPasswordForm').addEventListener('submit', async function(e) {
                        e.preventDefault();
                        const verificationCode = document.getElementById('verificationCode').value;
                        const newPassword = document.getElementById('newPassword').value;

                        const response = await fetch('/forgotpassword/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ verificationCode, newPassword }),
                        });

                        const result = await response.json();

                        if (result.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Success!',
                                text: result.message,
                                confirmButtonColor: '#d63384'
                            }).then(() => {
                                window.location.href = '/login';
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: result.message,
                                confirmButtonColor: '#d63384'
                            });
                        }
                    });
                </script>
            ` : ''}
        </div>
    </body>
    </html>
    `);
});

// Route to send a verification code to the user's email
router.post('/', async (req, res) => {
    const { email } = req.body;
    const db = getDb();

    try {
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.send('Email not found.');
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Verification Code',
            text: `Your verification code is: ${verificationCode}`
        };

        await transporter.sendMail(mailOptions);
        console.log('Verification email sent.');

        req.session.verificationCode = verificationCode;
        req.session.email = email;
        req.session.verificationCodeSent = true;

        res.redirect('/forgotpassword');
    } catch (err) {
        console.error('Error sending verification code:', err);
        res.send('Error sending verification code.');
    }
});

// Route to verify the code and reset the password
router.post('/verify', async (req, res) => {
    const { verificationCode, newPassword } = req.body;

    if (verificationCode === req.session.verificationCode) {
        const db = getDb();

        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            await db.collection('users').updateOne(
                { email: req.session.email },
                { $set: { password: hashedPassword } }
            );

            req.session.verificationCode = null;
            req.session.email = null;
            req.session.verificationCodeSent = false;

            res.json({ success: true, message: 'Password successfully updated!' });
        } catch (err) {
            console.error('Error updating password:', err);
            res.json({ success: false, message: 'Error updating password. Please try again.' });
        }
    } else {
        res.json({ success: false, message: 'Invalid verification code.' });
    }
});

module.exports = router;
