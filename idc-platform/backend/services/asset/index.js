const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/asset', routes);

const PORT = process.env.PORT || 3007;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Asset service running on port ${PORT}`);
  });
}

module.exports = app;
