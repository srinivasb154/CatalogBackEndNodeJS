import {
  listAllBrands,
  listBrandByBrandName,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  searchBrands,
} from '../services/brands.js';

export function brandRoutes(app) {
  app.post('/api/brands/search', async (req, res) => {
    try {
      const brands = await searchBrands(req.body);
      res.status(200).json(brands);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/brands', async (req, res) => {
    try {
      const brand = await createBrand(req.body);
      return res.json(brand);
    } catch (err) {
      console.error('error creating brand', err);
      return res.status(500).end();
    }
  });

  app.patch('/api/brands/:id', async (req, res) => {
    try {
      const brand = await updateBrand(req.params.id, req.body);
      return res.json(brand);
    } catch (err) {
      console.error('error updating brand', err);
      return res.status(500).end();
    }
  });

  app.delete('/api/brands/:id', async (req, res) => {
    try {
      const { deletedCount } = await deleteBrand(req.params.id);
      if (deletedCount === 0) return res.sendStatus(404);
      return res.status(204).end();
    } catch (err) {
      console.error('error deleting brand', err);
      return res.status(500).end();
    }
  });

  app.get('/api/brands', async (req, res) => {
    const { sortBy, sortOrder, brandName } = req.query;
    const options = { sortBy, sortOrder };

    try {
      if (brandName) {
        return res.json(await listBrandByBrandName(brandName, options));
      } else {
        return res.json(await listAllBrands(options));
      }
    } catch (err) {
      console.error('error listing brands', err);
      return res.status(500).end();
    }
  });

  app.get('/api/brands/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const brand = await getBrandById(id);
      if (brand === null) return res.status(404).end();
      return res.json(brand);
    } catch (err) {
      console.error('error getting brand', err);
      return res.status(500).end();
    }
  });
}
