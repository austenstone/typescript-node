import express from 'express';
import 'dotenv/config'

import { App, createNodeMiddleware } from "octokit";
import apiRoutes from './routes/api.js';

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
    throw new Error('Missing required environment variables');
}

const client = new MongoClient(MONGODB_URI);
await client.connect();
console.log('Connected successfully to mongo server');

const DB_NAME = 'Actions';
const db = client.db(DB_NAME);
const collections = {
  'workflow_job': db.collection('workflow_job'),
  'workflow_run': db.collection('workflow_run')
};

const github = new App({
  appId: APP_ID,
  privateKey: PRIVATE_KEY,
  webhooks: { secret: WEBHOOK_SECRET },
  oauth: { clientId: null!, clientSecret: null! },
});
github.webhooks.onAny(async ({ name, payload }) => collections[name]?.insertOne(payload));

app.use('/api', apiRoutes);

// Your app can now receive webhook events at `/api/github/webhooks`
app.use(createNodeMiddleware(github));

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
});
