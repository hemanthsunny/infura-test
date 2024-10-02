import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { MongoClient } from 'mongodb';
import { WebSocketServer } from 'ws';

const app = express();
const PORT = 3001;

app.use(cors());

const infuraUrl = 'https://mainnet.infura.io/v3/94b930cb3e514dae82e9680d69b0e44d';
const wss = new WebSocketServer({ noServer: true });

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('Client connected');
});

const mongoUrl = 'mongodb+srv://admin_v2:7ZhxftUjTiT9P7Ma@ethereumblocks.thafs.mongodb.net/infura?retryWrites=true&w=majority';
const dbName = 'infura';
const collectionName = 'ethereumBlocksData';

// Function to store block data in MongoDB Atlas
async function storeBlockInDB(block: any) {
    const client = new MongoClient(mongoUrl);

    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        // Insert block data into the collection
        const result = await collection.insertOne(block);
        console.log(`Block stored with _id: ${result.insertedId}`);
    } catch (error) {
        console.error('Error storing block in MongoDB Atlas:', error);
    } finally {
        await client.close();
    }
}

// Function to get the latest block
async function getLatestBlock() {
    try {
        const response = await axios.post(infuraUrl, {
            jsonrpc: '2.0',
            method: 'eth_getBlockByNumber',
            params: ['latest', true],
            id: 1,
        });
        const data: any = response.data;
        console.log('Latest Block Data:', data.result.hash);

        // Store the block in MongoDB Atlas
        await storeBlockInDB(data.result);  
    } catch (error) {
        console.error('Error fetching the latest block:', error);
    }
}

// Periodically check for the latest block every minute
const CHECK_INTERVAL = 60000; // 60,000 ms = 60 seconds
setInterval(async () => {
    console.log('Checking for the latest block...');
    await getLatestBlock();
}, CHECK_INTERVAL);

app.get('/blocks', async (req, res) => {
    const client = new MongoClient(mongoUrl);
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        // Retrieve all blocks from the collection
        const blocks = await collection.find({}).toArray();

        res.status(200).json(blocks);
    } catch (error) {
        console.error('Error fetching blocks from MongoDB Atlas:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await client.close();
    }
});


app.delete('/blocks/:number', async (req, res) => {
  const blockNumber = req.params.number;
    const client = new MongoClient(mongoUrl);
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        const blocks = await collection.deleteOne({ number: blockNumber });
        console.log("block deleted", blockNumber, blocks);
        
        res.status(200).json({ message: `Block ${blockNumber} deleted successfully` });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete block' });
    }
});


app.delete('/blocks', async (req, res) => {
    const client = new MongoClient(mongoUrl);
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        const blocks = await collection.deleteMany({});
        res.status(200).json({ message: `All Blocks deleted successfully` });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete block' });
    }
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

getLatestBlock();
