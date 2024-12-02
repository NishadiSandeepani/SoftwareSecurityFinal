const express = require('express');
const router = express.Router();

// Admin confirmation route
router.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Confirmation</title>
        <style>
            /* General reset */
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            /* Body styling */
            body {
                font-family: 'Arial', sans-serif;
                background-color: #E0BFB8; /* Light Beige background */
                color: #333;
                padding: 20px;
            }

            /* Header styling */
            h1 {
                text-align: center;
                color: #A95C68; /* Dusty Rose */
                margin-bottom: 20px;
            }

            /* Form container */
            .form-container {
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                height: 80vh;
                background-color: white;
                padding: 30px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                border-radius: 10px;
                width: 100%;
                max-width: 400px;
                margin: auto;
            }

            label {
                font-size: 1.2em;
                color: #555;
                margin-bottom: 10px;
            }

            input[type="password"] {
                width: 100%;
                padding: 12px;
                margin-bottom: 20px;
                border-radius: 5px;
                border: 1px solid #A95C68; /* Dusty Rose border */
                font-size: 1em;
                background-color: #E0BFB8; /* Light Beige background */
            }

            button {
                width: 100%;
                padding: 12px;
                background-color: #A95C68; /* Dusty Rose button */
                color: white;
                border: none;
                border-radius: 5px;
                font-size: 1.2em;
                cursor: pointer;
            }

            button:hover {
                background-color: #8A4857; /* Darker Dusty Rose on hover */
            }

            p {
                text-align: center;
                color: #A95C68;
            }
        </style>
    </head>
    <body>
        <h1>Confirm Admin Access</h1>
        <div class="form-container">
            <form action="/confirm" method="POST">
                <label for="password">Enter Confirmation Password:</label>
                <input type="password" name="password" required>
                <button type="submit">Confirm</button>
            </form>
            
        </div>
    </body>
    </html>
    `);
});

router.post('/', (req, res) => {
    const { password } = req.body;

    if (password === 'root') {
        res.redirect('/adminDashboard'); 
    } else {
        res.send('Incorrect confirmation password. Please try again.');
    }
});

module.exports = router;
