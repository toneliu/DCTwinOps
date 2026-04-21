const express = require('express');

const router = express.Router();

let reports = [];
let nextId = 1;

router.post('/', async (req, res) => {
  try {
    const report = { id: nextId++, ...req.body, createdAt: new Date() };
    reports.push(report);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const report = reports.find(r => r.id === parseInt(req.params.id));
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
