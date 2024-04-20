const express = require('express');
const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { fromIni } = require('@aws-sdk/credential-provider-ini');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Configure AWS SDK v3
const dynamodbClient = new DynamoDBClient({
  region: 'na-west-1', // Replace 'your-region' with your AWS region
  credentials: fromIni(), // Load credentials from default AWS credentials file
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Define DynamoDB command
  const params = {
    TableName: 'login_info', // Replace 'your-dynamodb-table' with your table name
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
