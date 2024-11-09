const { MongoClient, ServerApiVersion } = require('mongodb');

// MongoDB Atlas URI
const uri = 'mongodb+srv://nishadisandeepani26:oWqcnKtFRndEwFlu@cluster0.bx2bx.mongodb.net/personal_growth_journal?retryWrites=true&w=majority';


let db;

async function connectToMongoDB() {
    try {
        const client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        db = client.db('personal_growth_journal'); // Specify the database
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}

// Function to access the database
function getDb() {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
}

module.exports = { connectToMongoDB, getDb };
