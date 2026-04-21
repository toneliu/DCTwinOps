const express = require('express');

const router = express.Router();

let assets = [];
let nextId = 1;

router.post('/', async (req, res) => {
  try {
    const asset = { id: nextId++, ...req.body, createdAt: new Date() };
    assets.push(asset);
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const asset = assets.find(a => a.id === parseInt(req.params.id));
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
