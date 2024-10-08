import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { KinesisClient, PutRecordsCommand } from '@aws-sdk/client-kinesis';

dotenv.config();

const app = express();
const port = 3000;

const REGION = process.env.AWS_REGION;
const KINESIS_STREAM_NAME = 'log-data';

const kinesisClient = new KinesisClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const sendToKinesis = async (messages) => {
  try {
    const records = messages.map((message) => ({
      Data: Buffer.from(JSON.stringify(message)),
      PartitionKey: 'log-partition',
    }));

    const params = {
      StreamName: KINESIS_STREAM_NAME,
      Records: records,
    };

    const data = await kinesisClient.send(new PutRecordsCommand(params));
    console.log('Data successfully sent to Kinesis:', data);
  } catch (err) {
    console.error('Error sending data to Kinesis:', err);
  }
};

app.use(bodyParser.json({ limit: '1048576' }));

// Endpoint to receive and forward data to Kinesis
app.post('/api/traffic', async (req, res) => {
  const requestData = req.body;

  if (!requestData || requestData.length === 0) {
    return res.status(400).json({ error: 'No data received' });
  }

  try {
    // Send the captured request data to Kinesis
    await sendToKinesis(requestData);

    res.status(200).json({ message: 'Data successfully forwarded to Kinesis.' });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to process data' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
