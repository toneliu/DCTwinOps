const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/report', routes);

const PORT = process.env.PORT || 3009;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Report service running on port ${PORT}`);
  });
}

module.exports = app;
