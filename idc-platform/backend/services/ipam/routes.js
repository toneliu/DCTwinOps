const express = require('express');
const NetworkSegment = require('./models/NetworkSegment');

const router = express.Router();

// Create a new network segment
router.post('/segments', async (req, res) => {
  try {
    const segment = await NetworkSegment.create(req.body);
    res.status(201).json(segment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create segment', message: error.message });
  }
});

// Get all network segments
router.get('/segments', async (req, res) => {
  try {
    const segments = await NetworkSegment.findAll();
    res.json(segments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch segments', message: error.message });
  }
});

// Get a network segment by ID
router.get('/segments/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const segment = await NetworkSegment.findById(id);
    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }
    res.json(segment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch segment', message: error.message });
  }
});

module.exports = router;
