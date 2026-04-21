const express = require('express');

const router = express.Router();

let workflows = [];
let nextId = 1;

router.post('/', async (req, res) => {
  try {
    const workflow = { id: nextId++, ...req.body, createdAt: new Date() };
    workflows.push(workflow);
    res.status(201).json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const workflow = workflows.find(w => w.id === parseInt(req.params.id));
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
