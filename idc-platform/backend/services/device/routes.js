const express = require('express');
const DeviceTemplate = require('./models/DeviceTemplate');

const router = express.Router();

// Create a new device template
router.post('/templates', async (req, res) => {
  try {
    const template = await DeviceTemplate.create(req.body);
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create template', message: error.message });
  }
});

// Get all device templates
router.get('/templates', async (req, res) => {
  try {
    const templates = await DeviceTemplate.findAll();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates', message: error.message });
  }
});

// Get a device template by ID
router.get('/templates/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const template = await DeviceTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch template', message: error.message });
  }
});

module.exports = router;
