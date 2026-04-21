const express = require('express');
const cors = require('cors');
const networkDeviceModel = require('./models/NetworkDevice');
const configModel = require('./models/Config');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

networkDeviceModel.createTable().then(() => {
  console.log('Network devices table created');
});

configModel.createTable().then(() => {
  console.log('Configs table created');
});

app.use('/api/network', routes);

const PORT = process.env.PORT || 3004;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Network service running on port ${PORT}`);
  });
}

module.exports = app;
