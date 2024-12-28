import express from 'express';
import multer from 'multer';
import {
  listAllProducts,
  listProductByProductName,
  listProductBySku,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductReviews,
  saveProductReviews,
  saveProductAssets,
  getProductAssets,
  findInventoryByProduct,
  upsertInventory,
  getPricingByProductId,
  upsertPricing,
} from '../services/products.js';

export function productRoutes(app) {
  // Configure multer for file uploads
  const storage = multer.memoryStorage();
  const upload = multer({ storage });

  app.use(express.json());

  app.post('/api/products/search', async (req, res) => {
    try {
      console.log('req.body');
      console.log(req.body);
      const products = await searchProducts(req.body);
      res.status(200).json(products);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/products', async (req, res) => {
    try {
      const product = await createProduct(req.body);
      return res.json(product);
    } catch (err) {
      console.error('error creating product', err);
      return res.status(500).end();
    }
  });

  app.patch('/api/products/:id', async (req, res) => {
    try {
      const product = await updateProduct(req.params.id, req.body);
      return res.json(product);
    } catch (err) {
      console.error('error updating product', err);
      return res.status(500).end();
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    try {
      const { deletedCount } = await deleteProduct(req.params.id);
      if (deletedCount === 0) return res.sendStatus(404);
      return res.status(204).end();
    } catch (err) {
      console.error('error deleting product', err);
      return res.status(500).end();
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const product = await getProductById(id);
      if (product === null) return res.status(404).end();
      return res.json(product);
    } catch (err) {
      console.error('error getting product', err);
      return res.status(500).end();
    }
  });

  app.get('/api/products', async (req, res) => {
    const { sortBy, sortOrder, productName, sku } = req.query;
    const options = { sortBy, sortOrder };

    try {
      if (productName && sku) {
        return res
          .status(400)
          .json({ error: 'query by either name or sku, not both' });
      } else if (productName) {
        return res.json(await listProductByProductName(productName, options));
      } else if (sku) {
        return res.json(await listProductBySku(sku, options));
      } else {
        return res.json(await listAllProducts(options));
      }
    } catch (err) {
      console.error('error listing products', err);
      return res.status(500).end();
    }
  });

  // Save product reviews
  app.post('/api/products/:id/reviews', async (req, res) => {
    try {
      const productId = req.params.id;
      const reviews = req.body.reviews;
      const savedReviews = await saveProductReviews(productId, reviews);
      res.status(201).json(savedReviews);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Get reviews for a specific product
  app.get('/api/products/:id/reviews', async (req, res) => {
    try {
      const reviews = await getProductReviews(req.params.id);
      res.status(200).json(reviews);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Route to save product assets
  app.post(
    '/api/products/:productId/assets',
    upload.any(),
    async (req, res) => {
      try {
        const productId = req.body.productId; // Product ID
        const assets = JSON.parse(req.body.assets); // Parse assets array from JSON string
        const files = req.files; // Uploaded binary files

        // Construct the assets array with binary data
        const constructedAssets = assets.map((asset, index) => {
          const file = files[index];
          if (!file) {
            throw new Error(
              `Missing file for asset with productAssetId ${asset.productAssetId}`,
            );
          }
          return {
            ...asset,
            productId,
            binaryData: file.buffer, // Add binary data from file
          };
        });

        // Save the constructed assets
        const savedAssets = await saveProductAssets(constructedAssets);
        res
          .status(201)
          .json({ message: 'Assets saved successfully.', data: savedAssets });
      } catch (error) {
        console.error('Error saving assets:', error);
        res.status(500).json({ error: error.message });
      }
    },
  );

  // Get assets for a specific product
  app.get('/api/products/:productId/assets', async (req, res) => {
    try {
      const { productId } = req.params;
      const assets = await getProductAssets(productId);

      // If no assets found, return a 404
      if (!assets || assets.length === 0) {
        return res
          .status(404)
          .json({ message: 'No assets found for this product.' });
      }

      // Send the assets as the response
      res.status(200).json(assets);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Route to get inventory details for a product
  app.get('/api/products/:productId/inventory', async (req, res) => {
    try {
      const { productId } = req.params;
      const inventory = await findInventoryByProduct(productId);

      if (!inventory || inventory.length === 0) {
        return res
          .status(404)
          .json({ message: 'No inventory found for this product.' });
      }

      res.status(200).json(inventory);
    } catch (error) {
      console.error('Error retrieving inventory:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Route to create or update inventory
  app.post('/api/products/inventory', async (req, res) => {
    try {
      const inventoryData = req.body;
      const inventory = await upsertInventory(inventoryData);

      res
        .status(200)
        .json({ message: 'Inventory saved successfully.', inventory });
    } catch (error) {
      console.error('Error saving inventory:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Route to get pricing details for a product.
   * GET /api/pricing/:productId
   */
  app.get('/api/products/:productId/pricing', async (req, res) => {
    try {
      const { productId } = req.params;
      const pricing = await getPricingByProductId(productId);

      if (!pricing || pricing.length === 0) {
        return res
          .status(404)
          .json({ message: 'No pricing found for this product.' });
      }

      res.status(200).json(pricing);
    } catch (error) {
      console.error('Error retrieving pricing:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Route to create or update pricing details.
   * POST /api/pricing
   */
  app.post('/api/products/pricing', async (req, res) => {
    try {
      const pricingData = req.body;
      const pricing = await upsertPricing(pricingData);

      res.status(200).json({ message: 'Pricing saved successfully.', pricing });
    } catch (error) {
      console.error('Error saving pricing:', error);
      res.status(500).json({ error: error.message });
    }
  });
}
