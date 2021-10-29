const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

//Connection MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xbubr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//Main Function
async function run(){
    try{
        await client.connect();
        const database = client.db('foodiesDB');
        const itemsCollection = database.collection('items');
        const orderCollection = database.collection('orders');
        console.log('Foodies! Database connected');


        // GET API
        app.get('/items', async (req, res) => {
            const cursor = itemsCollection.find({});
            const items = await cursor.toArray();
            res.send(items);
        });

         // GET Single Item with ID
        app.get('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await itemsCollection.findOne(query);
           console.log(item)
            res.send(item);
        })


        // POST API
        app.post('/items', async (req, res) => {
            const newItem = req.body;
            const result = await itemsCollection.insertOne(newItem);
            console.log('Get new user', req.body);
            console.log('Added user', result);
            res.json(result);
        });


        //UPDATE API
        app.put('/items/:id', async (req, res) => {
            const id = req.params.id;
            const updatedItem = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updatedItem.name,
                    email: updatedItem.email
                },
            };
            const result = await itemsCollection.updateOne(filter, updateDoc, options)
            console.log('updating', id)
            res.json(result)
        })

         // DELETE API
         app.delete('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemsCollection.deleteOne(query);

            console.log('deleting item with id ', result);

            res.json(result);
        })

         // Use POST to get data by keys
         app.post('/items/byKeys', async (req, res) => {
            const keys = req.body;
            const query = { key: { $in: keys } }
            const items = await itemsCollection.find(query).toArray();
            res.send(items);
        });

        // Add Orders API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })

         // GET Order API
         app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

         // GET Single Order with ID
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await orderCollection.findOne(query);
           
            res.send(order);
        })

         // DELETE API
         app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);

            console.log('deleting item with id ', result);

            res.json(result);
        })

         // Use POST to get data by keys
         app.post('/orders/byKeys', async (req, res) => {
            const keys = req.body;
            const query = { key: { $in: keys } }
            const orders = await orderCollection.find(query).toArray();
            res.send(orders);
        });


    }finally{
         // await client.close();
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Running my Foodies! Server...');
});

app.listen(port, () => {
    console.log('Running Foodies! Server on port', port);
})