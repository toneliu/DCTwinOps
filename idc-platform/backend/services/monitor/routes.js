const express = require('express');

const router = express.Router();

let metrics = [];
let nextId = 1;

router.post('/', async (req, res) => {
  try {
    const metric = { id: nextId++, ...req.body, timestamp: new Date() };
    metrics.push(metric);
    res.status(201).json(metric);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
