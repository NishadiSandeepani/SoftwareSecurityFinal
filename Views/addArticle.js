const express = require('express');
const router = express.Router();
const { getDb } = require('../db'); // Import MongoDB connection

// Route to display form to add an article
router.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Add Article</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #E0BFB8; /* Light Beige */
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            form {
                background-color: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                max-width: 500px;
                width: 100%;
            }
            h1 {
                text-align: center;
                color: #A95C68; /* Dusty Rose for heading */
                margin-bottom: 20px;
            }
            label {
                display: block;
                margin-bottom: 8px;
                font-weight: bold;
                color: #333;
            }
            input, textarea, button {
                width: 100%;
                padding: 10px;
                margin-bottom: 15px;
                border: 1px solid #A95C68; /* Dusty Rose border */
                border-radius: 4px;
            }
            button {
                background-color: #A95C68; /* Dusty Rose button */
                color: #fff;
                border: none;
                cursor: pointer;
                font-size: 1.1em;
            }
            button:hover {
                background-color: #8A4857; /* Darker Dusty Rose on hover */
            }
        </style>
    </head>
    <body>
        <form action="/addArticle" method="POST">
            <h1>Add Panda Article</h1>
            <label for="title">Title:</label>
            <input type="text" id="title" name="title" required>

            <label for="content">Content:</label>
            <textarea id="content" name="content" rows="6" required></textarea>

            <button type="submit">Add Article</button>
        </form>
    </body>
    </html>
    `);
});

// Route to handle article submission
router.post('/', async (req, res) => {
    const { title, content } = req.body;
    const db = getDb();

    try {
        await db.collection('articles').insertOne({ title, content, date: new Date() });
        res.redirect('/article'); // Redirect to view articles after adding
    } catch (error) {
        console.error('Error adding article:', error);
        res.status(500).send('Error adding article. Please try again later.');
    }
});

module.exports = router;
