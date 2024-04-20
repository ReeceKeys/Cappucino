const express = require('express');
const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Configure AWS SDK v3
const dynamodbClient = new DynamoDBClient({ region: 'us-west-1' }); // Replace 'us-west-1' with your AWS region

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Define DynamoDB command
  const params = {
    TableName: 'login_info', // Replace 'login_info' with your table name
    Key: { username: { S: username } }
  };
  const command = new GetItemCommand(params);

  try {
    const { Item } = await dynamodbClient.send(command);

    // Check if user exists and password matches
    if (Item && Item.password.S === password) {
      res.sendStatus(200); // Success
    } else {
      res.sendStatus(401); // Unauthorized
    }
  } catch (err) {
    console.error('Error fetching user from DynamoDB:', err);
    res.sendStatus(500); // Internal Server Error
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
