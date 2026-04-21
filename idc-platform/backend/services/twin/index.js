const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/twin', routes);

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    console.log(`Digital Twin Service running on port ${PORT}`);
  });
}

module.exports = app;
