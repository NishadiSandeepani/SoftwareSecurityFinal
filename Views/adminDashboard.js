// dashboard.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../db'); // Import MongoDB connection

// Dashboard route
router.get('/', async (req, res) => {
    const db = getDb();
    let categoriesList = '';

    try {
        const categories = await db.collection('categories').find({}).toArray();
        categoriesList = categories.map(category => `
            <div class="category-card">
                <h3>${category.name}</h3>
                <button class="view-category">Learn More</button>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error fetching categories:', err);
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Panda Conservation Dashboard</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                display: flex;
                height: 100vh;
                background-color: #f5f5f5;
            }
            header {
                text-align: center;
                background-color: #87CEEB;
                padding: 20px;
                color: #fff;
            }
            nav {
                display: flex;
                flex-direction: column;
                width: 20%;
                padding: 20px;
                background-color: #f5f5f5;
                border-right: 2px solid #ddd;
            }
            nav button {
                background-color: #ff1493;
                color: white;
                padding: 10px;
                margin: 10px 0;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
            main {
                flex: 1;
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .category-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                margin-top: 20px;
            }
            .category-card {
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
                padding: 20px;
                width: 200px;
                text-align: center;
            }
            .category-card h3 {
                color: #d5006d;
            }
            .view-category {
                background-color: #ff1493;
                color: white;
                padding: 8px 16px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            }
            .image-container {
                margin-top: 20px;
                text-align: center;
            }
            .image-container img {
                max-width: 100%;
                height: auto;
                border-radius: 10px;
            }
            footer {
                text-align: center;
                padding: 10px;
                background-color: #87CEEB;
                color: white;
                position: absolute;
                bottom: 0;
                width: 100%;
            }
        </style>
    </head>
    <body>
        <header>
            <h1>Panda Conservation Dashboard</h1>
        </header>
        
        <nav>
            <button onclick="window.location.href='/myprofile'">My Profile</button>
            <button onclick="window.location.href='/logs'">Activity Log</button>
            <button onclick="window.location.href='/logout'">Logout</button>
            <button onclick="window.location.href='/'">Home</button>
             <button onclick="window.location.href='/addArticle'">Add Article</button>
             
        </nav>
        
        <main>
            <p>Welcome to your personalized dashboard! Learn about the latest Panda conservation efforts.</p>
            <div class="image-container">
                <img src="https://img.freepik.com/free-photo/view-panda-bear-nature_23-2150453051.jpg?size=626&ext=jpg&ga=GA1.1.2008272138.1725580800&semt=ais_hybrid" alt="Panda conservation image">
            </div>
            <h2>Explore Categories</h2>
            <div class="category-grid">
                ${categoriesList}
            </div>
        </main>
        
        <footer>
            <p>&copy; 2024 Panda Conservation Awareness | Empowering Efforts for Our Pandas</p>
        </footer>
    </body>
    </html>
    `;
    
    res.send(htmlContent);
});

module.exports = router;
