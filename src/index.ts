import express from 'express';
import 'dotenv/config'

import { App, createNodeMiddleware } from "octokit";

const app = express();
const port = process.env.PORT || 3000;

import { MongoClient } from "mongodb";

const {
    APP_ID,
    PRIVATE_KEY,
    WEBHOOK_SECRET,
    MONGODB_URI
} = process.env;

if (!APP_ID || !PRIVATE_KEY || !WEBHOOK_SECRET || !MONGODB_URI) {
    throw new Error('Missing environment variables');
}

const Gapp = new App({
  appId: APP_ID,
  privateKey: PRIVATE_KEY,
  webhooks: { secret: WEBHOOK_SECRET },
  oauth: { clientId: null!, clientSecret: null! },
});


const client = new MongoClient(MONGODB_URI);
await client.connect();
console.log('Connected successfully to mongo server');

const DB_NAME = 'Actions';
const db = client.db(DB_NAME);

const workflowJobCollection = db.collection('workflow_job');
Gapp.webhooks.on('workflow_job', ({ payload }) => {
  workflowJobCollection.insertOne(payload);
});

const workflowRunCollection = db.collection('workflow_run');
Gapp.webhooks.on('workflow_run', ({ payload }) => {
  workflowRunCollection.insertOne(payload);
});

// Your app can now receive webhook events at `/api/github/webhooks`
app.use(createNodeMiddleware(Gapp));

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
});
