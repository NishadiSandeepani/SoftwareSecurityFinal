// home.js

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Panda Conservation Awareness</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #ffe4e1;
                    margin: 0;
                    padding: 0;
                    background-image: url('https://c8.alamy.com/comp/JCKY3K/vector-illustration-animal-seamless-pattern-background-with-cute-panda-JCKY3K.jpg');
                    background-size: cover;
                    background-position: center;
                }
                header {
                    background-color: rgba(255, 105, 180, 0.8);
                    color: white;
                    padding: 20px;
                    text-align: center;
                }
                header .buttons {
                    margin-top: 10px;
                }
                header .button {
                    background-color: #ff1493;
                    color: white;
                    padding: 10px 20px;
                    text-align: center;
                    display: inline-block;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 10px 10px 0 10px;
                }
                .container {
                    width: 80%;
                    margin: auto;
                    padding: 20px;
                    background-color: rgba(255, 255, 255, 0.8);
                    border-radius: 10px;
                }
                h2 {
                    color: #d5006d;
                }
                footer {
                    text-align: center;
                    padding: 20px;
                    background-color: rgba(255, 105, 180, 0.8);
                    color: white;
                }
                .image-gallery {
                    display: flex;
                    justify-content: space-between;
                    flex-wrap: wrap;
                }
                .image-gallery img {
                    width: 30%;
                    border-radius: 10px;
                    margin: 10px 0;
                }
            </style>
        </head>
        <body>
            <header>
                <h1>Panda Conservation Awareness</h1>
                <p>Help us protect these magnificent creatures!</p>
                <div class="buttons">
                    <a href="/register" class="button">Sign up</a>
                    <a href="/logout" class="button">Logout</a>
                </div>
            </header>
            
            <div class="container">
                <h2>Our Mission</h2>
                <p>
                    Our mission is to raise awareness about the conservation of pandas and their habitats. 
                    We aim to educate the public on the importance of preserving these iconic animals and their ecosystems.
                </p>
                
                <h2>Latest News</h2>
                <ul>
                    <li>Panda populations are slowly increasing thanks to conservation efforts.</li>
                    <li>Join us for the annual Panda Awareness Day on July 20!</li>
                    <li>New research on panda behavior published in conservation journal.</li>
                </ul>
                
                <h2>Get Involved</h2>
                <p>Join us in making a difference! You can contribute by donating or volunteering.</p>
                <a href="/donate" class="button">Donate Now</a>
                <a href="/volunteer" class="button">Become a Volunteer</a>
                
                <h2>Gallery</h2>
                <div class="image-gallery">
                    <img src="https://img.freepik.com/free-photo/view-panda-bear-nature_23-2150453051.jpg?size=626&ext=jpg&ga=GA1.1.2008272138.1725580800&semt=ais_hybrid" alt="Panda in a natural habitat">
                    <img src="https://images.stockcake.com/public/e/9/f/e9fff93b-97a8-490f-b960-bf974e8af6ef_large/panda-in-habitat-stockcake.jpg" alt="Panda eating bamboo">
                    <img src="https://img.freepik.com/premium-photo/panda-bear-floating-water-surrounded-by-pink-flowers_1117431-4294.jpg" alt="Conservation efforts for pandas">
                </div>
            </div>
            
            <footer>
                <p>&copy; 2024 Panda Conservation Awareness. All rights reserved.</p>
            </footer>
        </body>
        </html>
    `);
});

module.exports = router;
