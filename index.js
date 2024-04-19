// index.js

const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({ region: 'na-west-1' }); // Replace 'your-region' with your AWS region
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve login page
app.get('/login', (req, res) => {
    fs.readFile(path.join(__dirname, 'index.html'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading index.html:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.send(data);
    });
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Define DynamoDB params
    const params = {
        TableName: 'login_info', // Replace 'your-dynamodb-table' with your table name
        Key: { username: username }
    };

    // Get user from DynamoDB
    dynamodb.get(params, (err, data) => {
        if (err) {
            console.error('Error fetching user from DynamoDB:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Check if user exists and password matches
        if (data.Item && data.Item.password === password) {
            res.send('Login successful');
        } else {
            res.status(401).send('Invalid username or password');
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
