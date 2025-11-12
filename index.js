const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log("Successfully connected to MongoDB!");

    // Database and Collections
    const db = client.db(process.env.DB_NAME);
    const productsCollection = db.collection('products');
    const importsCollection = db.collection('imports');
    const usersCollection = db.collection('users');

    // ============= ROUTES START =============

    // Root Route
    app.get('/', (req, res) => {
      res.send('Import Export Hub Server is Running');
    });

    // Get all products (sorted by latest first)
    app.get('/products', async (req, res) => {
      try {
        const products = await productsCollection.find().sort({ createdAt: -1 }).toArray();
        res.send(products);
      } catch (error) {
        res.status(500).send({ message: 'Error fetching products', error: error.message });
      }
    });

    app.get('/products/latest', async (req, res) => {
      try {
        const products = await productsCollection.find().sort({ createdAt: -1 }).limit(6).toArray();
        res.send(products);
      } catch (error) {
        res.status(500).send({ message: 'Error fetching latest products', error: error.message });
      }
    });

    
    app.get('/products/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const product = await productsCollection.findOne(query);
        res.send(product);
      } catch (error) {
        res.status(500).send({ message: 'Error fetching product details', error: error.message });
      }
    });
     
app.get('/products/search/:name', async (req, res) => {
  try {
    const database = await connectDB();
    const productsCollection = database.collection('products');
    const searchName = req.params.name;
    const query = { productName: { $regex: searchName, $options: 'i' } };
    const products = await productsCollection.find(query).toArray();
    res.json(products);
  } catch (error) {
    console.error('Error in /products/search:', error);
    res.status(500).json({ message: 'Error searching products', error: error.message });
  }
});
 

    app.post('/products', async (req, res) => {
  try {
    const database = await connectDB();
    const productsCollection = database.collection('products');
    const newProduct = req.body;
    newProduct.createdAt = new Date();
    const result = await productsCollection.insertOne(newProduct);
    res.json(result);
  } catch (error) {
    console.error('Error in POST /products:', error);
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
});


app.get('/my-exports/:email', async (req, res) => {
  try {
    const database = await connectDB();
    const productsCollection = database.collection('products');
    const email = req.params.email;
    const query = { userEmail: email };
    const products = await productsCollection.find(query).sort({ createdAt: -1 }).toArray();
    res.json(products);
  } catch (error) {
    console.error('Error in /my-exports:', error);
    res.status(500).json({ message: 'Error fetching user exports', error: error.message });
  }
});


app.patch('/products/:id', async (req, res) => {
  try {
    const database = await connectDB();
    const productsCollection = database.collection('products');
    const id = req.params.id;
    const updatedData = req.body;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: updatedData
    };
    const result = await productsCollection.updateOne(filter, updateDoc);
    res.json(result);
  } catch (error) {
    console.error('Error in PATCH /products:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});
app.delete('/products/:id', async (req, res) => {
  try {
    const database = await connectDB();
    const productsCollection = database.collection('products');
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await productsCollection.deleteOne(query);
    res.json(result);
  } catch (error) {
    console.error('Error in DELETE /products:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});





















    // ============= ROUTES END =============

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}


run().catch(console.dir);


app.listen(port, () => {
  console.log(`Import Export Hub Server is running on port ${port}`);
});
