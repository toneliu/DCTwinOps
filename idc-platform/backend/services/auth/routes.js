const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('./models/User');
const authMiddleware = require('./middleware');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password, name, role } = req.body;
  const existingUser = await userModel.findByUsername(username);
  
  if (existingUser) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = await userModel.create({
    username,
    password: hashedPassword,
    name,
    role
  });

  res.status(201).json({ id: userId, username, name, role });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await userModel.findByUsername(username);
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '24h' }
  );

  res.json({ token, user: { id: user.id, username: user.username, name: user.name, role: user.role } });
});

router.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

module.exports = router;
