const express = require('express');

const router = express.Router();

let plugins = [];
let nextId = 1;

router.post('/', async (req, res) => {
  try {
    const plugin = { id: nextId++, ...req.body, createdAt: new Date() };
    plugins.push(plugin);
    res.status(201).json(plugin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    res.json(plugins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
