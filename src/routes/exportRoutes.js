import exportService from '../services/exportService.js';

export function exportRoutes(app) {
  app.get('/api/export', async (req, res) => {
    try {
      const columnMappings = req.query || {}; // Use query parameters for column mappings
      const exportedData = await exportService.exportData(columnMappings);
      res.status(200).json(exportedData); // Respond with JSON data
    } catch (error) {
      console.error('Error exporting data:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
}
