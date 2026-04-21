const express = require('express');
const TwinModel = require('./models/TwinModel');

const router = express.Router();

// Create a new twin model
router.post('/models', async (req, res) => {
  try {
    const model = await TwinModel.create(req.body);
    res.status(201).json(model);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create model', message: error.message });
  }
});

// Get all models for a data center
router.get('/models', async (req, res) => {
  try {
    const { dataCenterId } = req.query;
    if (!dataCenterId) {
      return res.status(400).json({ error: 'dataCenterId is required' });
    }
    const models = await TwinModel.findByDataCenter(parseInt(dataCenterId));
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch models', message: error.message });
  }
});

// Get a specific model by ID
router.get('/models/:id', async (req, res) => {
  try {
    const model = await TwinModel.findById(req.params.id);
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }
    res.json(model);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch model', message: error.message });
  }
});

// Update a model
router.put('/models/:id', async (req, res) => {
  try {
    const model = await TwinModel.update(req.params.id, req.body);
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }
    res.json(model);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update model', message: error.message });
  }
});

// Delete a model
router.delete('/models/:id', async (req, res) => {
  try {
    const success = await TwinModel.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Model not found' });
    }
    res.json({ message: 'Model deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete model', message: error.message });
  }
});

module.exports = router;
