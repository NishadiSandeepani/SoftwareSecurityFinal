const { getDb } = require('../db');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');  // Required for hashing passwords

// Define User schema
class User {
    constructor({ fullname, email, phone, password }) {
        this.fullname = fullname;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.createdAt = new Date();
    }

    // Save user to database
    async save() {
        const db = getDb();
        const result = await db.collection('users').insertOne(this);
        return result;
    }

    // Find user by email
    static async findOne(query) {
        const db = getDb();
        const user = await db.collection('users').findOne(query);
        return user;
    }

    // Update user's password
    static async updatePassword(userId, newPassword) {
        const db = getDb();
        const hashedPassword = await bcrypt.hash(newPassword, 10);  // Hash the new password
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },  // Use ObjectId to find the user by ID
            { $set: { password: hashedPassword } }  // Update the password
        );
        return result;
    }
}

module.exports = User;
