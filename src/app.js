import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { productRoutes } from './routes/products.js';
import { categoryRoutes } from './routes/categories.js';
import { brandRoutes } from './routes/brands.js';
import { importRoutes } from './routes/importRoutes.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

productRoutes(app);
categoryRoutes(app);
brandRoutes(app);
importRoutes(app);

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

export { app };
