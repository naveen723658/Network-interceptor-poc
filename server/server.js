import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { CloudWatchLogsClient, PutLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs';

// Load environment variables from .env
dotenv.config();

const app = express();
const port = 3000;

const REGION = process.env.AWS_REGION; 
const LOG_GROUP_NAME = 'api-logs';
const LOG_STREAM_NAME = 'api-data'; 

// Configure AWS CloudWatch client
const cloudWatchClient = new CloudWatchLogsClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '', 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

let sequenceToken = null;

app.use(bodyParser.json({ limit: '1048576' })); 

// Function to log data to CloudWatch
const logToCloudWatch = async (message) => {
  try {
    const logEvent = {
      logGroupName: LOG_GROUP_NAME,
      logStreamName: LOG_STREAM_NAME,
      logEvents: [
        {
          message: JSON.stringify(message),
          timestamp: new Date().getTime(),
        },
      ],
      ...(sequenceToken && { sequenceToken }), 
    };

    const data = await cloudWatchClient.send(new PutLogEventsCommand(logEvent));
    sequenceToken = data.nextSequenceToken || null; 
    console.log('Log successfully sent to CloudWatch.');
  } catch (err) {
    console.error('Error sending log event to CloudWatch:', err);
  }
};

// Endpoint to receive and forward data to CloudWatch
app.post('/api/traffic', async (req, res) => {
  const requestData = req.body;

  if (!requestData || requestData.length === 0) {
    return res.status(400).json({ error: 'No data received' });
  }

  try {
    // Log each captured request to CloudWatch
    for (const message of requestData) {
      await logToCloudWatch(message);
    }

    res.status(200).json({ message: 'Data successfully forwarded to CloudWatch.' });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to process data' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
