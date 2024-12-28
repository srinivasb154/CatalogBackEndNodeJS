import {
  listAllCategories,
  listCategoryByCategoryName,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  searchCategories,
} from '../services/categories.js';

export function categoryRoutes(app) {
  app.post('/api/categories/search', async (req, res) => {
    try {
      const categories = await searchCategories(req.body);
      res.status(200).json(categories);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/categories', async (req, res) => {
    try {
      const category = await createCategory(req.body);
      return res.json(category);
    } catch (err) {
      console.error('error creating category', err);
      return res.status(500).end();
    }
  });

  app.patch('/api/categories/:id', async (req, res) => {
    try {
      const category = await updateCategory(req.params.id, req.body);
      return res.json(category);
    } catch (err) {
      console.error('error updating category', err);
      return res.status(500).end();
    }
  });

  app.delete('/api/categories/:id', async (req, res) => {
    try {
      const { deletedCount } = await deleteCategory(req.params.id);
      if (deletedCount === 0) return res.sendStatus(404);
      return res.status(204).end();
    } catch (err) {
      console.error('error deleting category', err);
      return res.status(500).end();
    }
  });

  app.get('/api/categories', async (req, res) => {
    const { sortBy, sortOrder, categoryName } = req.query;
    const options = { sortBy, sortOrder };

    try {
      if (categoryName) {
        return res.json(await listCategoryByCategoryName(categoryName, options));
      } else {
        return res.json(await listAllCategories(options));
      }
    } catch (err) {
      console.error('error listing categories', err);
      return res.status(500).end();
    }
  });

  app.get('/api/categories/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const category = await getCategoryById(id);
      if (category === null) return res.status(404).end();
      return res.json(category);
    } catch (err) {
      console.error('error getting category', err);
      return res.status(500).end();
    }
  });
}
