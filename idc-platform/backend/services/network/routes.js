const express = require('express');
const networkDeviceModel = require('./models/NetworkDevice');
const configModel = require('./models/Config');

const router = express.Router();

router.post('/devices', async (req, res) => {
  try {
    const deviceId = await networkDeviceModel.create(req.body);
    res.status(201).json({ id: deviceId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/devices', async (req, res) => {
  try {
    const devices = await networkDeviceModel.findAll();
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/devices/:id', async (req, res) => {
  try {
    const device = await networkDeviceModel.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json(device);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/devices/:id', async (req, res) => {
  try {
    const success = await networkDeviceModel.update(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/devices/:id', async (req, res) => {
  try {
    const success = await networkDeviceModel.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json({ message: 'Device deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/configs', async (req, res) => {
  try {
    const configId = await configModel.create(req.body);
    res.status(201).json({ id: configId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/configs/device/:deviceId', async (req, res) => {
  try {
    const configs = await configModel.findByDeviceId(req.params.deviceId);
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/configs/:id', async (req, res) => {
  try {
    const config = await configModel.findById(req.params.id);
    if (!config) {
      return res.status(404).json({ error: 'Config not found' });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
