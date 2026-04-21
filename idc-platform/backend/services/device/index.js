const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/device', routes);

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3003;
  app.listen(PORT, () => {
    console.log(`Device Service running on port ${PORT}`);
  });
}

module.exports = app;
