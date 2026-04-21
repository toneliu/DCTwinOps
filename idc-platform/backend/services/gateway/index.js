const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// Service URLs from environment variables
const SERVICE_URLS = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  twin: process.env.TWIN_SERVICE_URL || 'http://localhost:3002',
  device: process.env.DEVICE_SERVICE_URL || 'http://localhost:3003',
  network: process.env.NETWORK_SERVICE_URL || 'http://localhost:3004',
  ipam: process.env.IPAM_SERVICE_URL || 'http://localhost:3005',
  workflow: process.env.WORKFLOW_SERVICE_URL || 'http://localhost:3006',
  asset: process.env.ASSET_SERVICE_URL || 'http://localhost:3007',
  monitor: process.env.MONITOR_SERVICE_URL || 'http://localhost:3008',
  report: process.env.REPORT_SERVICE_URL || 'http://localhost:3009',
  plugin: process.env.PLUGIN_SERVICE_URL || 'http://localhost:3010'
};

// Proxy middleware for each service
app.use('/api/auth', createProxyMiddleware({
  target: SERVICE_URLS.auth,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/api/auth' }
}));

app.use('/api/twin', createProxyMiddleware({
  target: SERVICE_URLS.twin,
  changeOrigin: true,
  pathRewrite: { '^/api/twin': '/api/twin' }
}));

app.use('/api/device', createProxyMiddleware({
  target: SERVICE_URLS.device,
  changeOrigin: true,
  pathRewrite: { '^/api/device': '/api/device' }
}));

app.use('/api/network', createProxyMiddleware({
  target: SERVICE_URLS.network,
  changeOrigin: true,
  pathRewrite: { '^/api/network': '/api/network' }
}));

app.use('/api/ipam', createProxyMiddleware({
  target: SERVICE_URLS.ipam,
  changeOrigin: true,
  pathRewrite: { '^/api/ipam': '/api/ipam' }
}));

app.use('/api/workflow', createProxyMiddleware({
  target: SERVICE_URLS.workflow,
  changeOrigin: true,
  pathRewrite: { '^/api/workflow': '/api/workflow' }
}));

app.use('/api/asset', createProxyMiddleware({
  target: SERVICE_URLS.asset,
  changeOrigin: true,
  pathRewrite: { '^/api/asset': '/api/asset' }
}));

app.use('/api/monitor', createProxyMiddleware({
  target: SERVICE_URLS.monitor,
  changeOrigin: true,
  pathRewrite: { '^/api/monitor': '/api/monitor' }
}));

app.use('/api/report', createProxyMiddleware({
  target: SERVICE_URLS.report,
  changeOrigin: true,
  pathRewrite: { '^/api/report': '/api/report' }
}));

app.use('/api/plugin', createProxyMiddleware({
  target: SERVICE_URLS.plugin,
  changeOrigin: true,
  pathRewrite: { '^/api/plugin': '/api/plugin' }
}));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Service not found' });
});

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log('Service URLs:', SERVICE_URLS);
  });
}

module.exports = app;
