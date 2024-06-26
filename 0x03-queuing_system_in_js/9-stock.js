import express from 'express';
import redis from 'redis';
import { promisify } from 'util';

const app = express();
const port = 1245;

const client = redis.createClient();
client.set = promisify(client.set);

// Data structure for products
const listProducts = [
  { id: 1, name: 'Suitcase 250', price: 50, stock: 4 },
  { id: 2, name: 'Suitcase 450', price: 100, stock: 10 },
  { id: 3, name: 'Suitcase 650', price: 350, stock: 2 },
  { id: 4, name: 'Suitcase 1050', price: 550, stock: 5 }
];

// Function to get an item by ID
function getItemById (id) {
  return listProducts.find(product => product.id === id);
}

app.use(express.json());

app.get('/list_products', (req, res) => {
  const products = listProducts.map(product => ({
    itemId: product.id,
    itemName: product.name,
    price: product.price,
    initialAvailableQuantity: product.stock
  }));
  res.json(products);
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});

// Function to reserve stock
async function reserveStockById (itemId, stock) {
  await client.set(`item.${itemId}`, stock.toString());
}

// Function to get current reserved stock
async function getCurrentReservedStockById (itemId) {
  const stock = await client.get(`item.${itemId}`);
  return stock ? parseInt(stock) : 0;
}

// Route to get product details by ID
app.get('/list_products/:itemId', async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  const product = getItemById(itemId);
  if (!product) {
    return res.json({ status: 'Product not found' });
  }

  const currentQuantity = await getCurrentReservedStockById(itemId);
  res.json({
    ...product,
    currentQuantity
  });
});

// Route to reserve a product
app.get('/reserve_product/:itemId', async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  const product = getItemById(itemId);
  if (!product) {
    return res.json({ status: 'Product not found' });
  }

  if (product.stock <= 0) {
    return res.json({ status: 'Not enough stock available', itemId });
  }

  await reserveStockById(itemId, product.stock - 1);
  res.json({ status: 'Reservation confirmed', itemId });
});
