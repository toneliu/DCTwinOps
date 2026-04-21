# IDC 数字孪生机房一体化管理平台实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建企业级 IDC 数字孪生机房一体化管理平台，基于 Node.js 全栈技术体系，支持数字孪生可视化、设备管理、智能网管、IPAM 等核心功能。

**Architecture:** 采用微服务架构，前端使用 Vue 3 + TypeScript + Three.js，后端使用 Express + gRPC + Kafka，数据库使用 MySQL + Redis + MongoDB，容器化部署。

**Tech Stack:** Vue 3, TypeScript, Three.js, Express, gRPC, Kafka, MySQL, Redis, MongoDB, Docker

---

## 1. 项目初始化与基础架构搭建

### 1.1 项目结构搭建

**Files:**
- Create: `/workspace/idc-platform/`
- Create: `/workspace/idc-platform/package.json`
- Create: `/workspace/idc-platform/docker-compose.yml`
- Create: `/workspace/idc-platform/.env.example`

- [ ] **Step 1: 创建项目目录结构**

```bash
mkdir -p /workspace/idc-platform/{frontend,backend,docs,scripts}
mkdir -p /workspace/idc-platform/backend/{services,config,common}
mkdir -p /workspace/idc-platform/frontend/src/{components,views,store,utils,api}
```

- [ ] **Step 2: 初始化前端项目**

```bash
cd /workspace/idc-platform/frontend
npm create vite@latest . -- --template vue-ts
npm install element-plus three @tresjs/core @tresjs/cientos pinia axios socket.io-client dayjs xlsx qrcode.vue crypto-js
npm install -D eslint prettier husky
```

- [ ] **Step 3: 初始化后端项目**

```bash
cd /workspace/idc-platform/backend
npm init -y
npm install express express-graphql graphql grpc @grpc/proto-loader kafka-node mysql2 redis mongoose socket.io bullmq ssh2 net-snmp
npm install -D typescript ts-node @types/express @types/node
```

- [ ] **Step 4: 创建 Docker Compose 配置**

```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "8080:80"
    depends_on:
      - gateway

  gateway:
    build: ./backend/services/gateway
    ports:
      - "3000:3000"
    depends_on:
      - auth-service
      - mysql
      - redis

  auth-service:
    build: ./backend/services/auth
    depends_on:
      - mysql

  twin-service:
    build: ./backend/services/twin
    depends_on:
      - mysql
      - mongodb

  device-service:
    build: ./backend/services/device
    depends_on:
      - mysql

  network-service:
    build: ./backend/services/network
    depends_on:
      - mysql
      - redis
      - kafka

  ipam-service:
    build: ./backend/services/ipam
    depends_on:
      - mysql

  workflow-service:
    build: ./backend/services/workflow
    depends_on:
      - mysql

  asset-service:
    build: ./backend/services/asset
    depends_on:
      - mysql

  monitor-service:
    build: ./backend/services/monitor
    depends_on:
      - mysql
      - redis
      - kafka

  report-service:
    build: ./backend/services/report
    depends_on:
      - mysql

  plugin-service:
    build: ./backend/services/plugin
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: idc_platform
    volumes:
      - mysql-data:/var/lib/mysql

  redis:
    image: redis:7.0
    volumes:
      - redis-data:/data

  mongodb:
    image: mongo:6.0
    volumes:
      - mongodb-data:/data/db

  kafka:
    image: bitnami/kafka:3.6
    environment:
      KAFKA_CFG_NODE_ID: 0
      KAFKA_CFG_PROCESS_ROLES: controller,broker
      KAFKA_CFG_CONTROLLER_QUORUM_VOTERS: 0@kafka:9093
      KAFKA_CFG_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093
      KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      KAFKA_CFG_CONTROLLER_LISTENER_NAMES: CONTROLLER
    volumes:
      - kafka-data:/bitnami/kafka

volumes:
  mysql-data:
  redis-data:
  mongodb-data:
  kafka-data:
```

- [ ] **Step 5: 提交初始化代码**

```bash
cd /workspace/idc-platform
git init
git add .
git commit -m "feat: initialize project structure"
```

## 2. 核心服务开发

### 2.1 认证服务

**Files:**
- Create: `/workspace/idc-platform/backend/services/auth/index.js`
- Create: `/workspace/idc-platform/backend/services/auth/routes.js`
- Create: `/workspace/idc-platform/backend/services/auth/middleware.js`
- Create: `/workspace/idc-platform/backend/services/auth/models/User.js`
- Create: `/workspace/idc-platform/backend/services/auth/tests/auth.test.js`

- [ ] **Step 1: 编写用户模型**

```javascript
// models/User.js
const mysql = require('mysql2/promise');

class User {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'mysql',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root',
      database: process.env.MYSQL_DATABASE || 'idc_platform'
    });
  }

  async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await this.pool.execute(sql);
  }

  async findByUsername(username) {
    const [rows] = await this.pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  async create(user) {
    const [result] = await this.pool.execute(
      'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
      [user.username, user.password, user.name, user.role]
    );
    return result.insertId;
  }
}

module.exports = new User();
```

- [ ] **Step 2: 编写认证中间件**

```javascript
// middleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
```

- [ ] **Step 3: 编写路由**

```javascript
// routes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('./models/User');
const authMiddleware = require('./middleware');

const router = express.Router();

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

router.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

module.exports = router;
```

- [ ] **Step 4: 编写主服务文件**

```javascript
// index.js
const express = require('express');
const cors = require('cors');
const userModel = require('./models/User');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

// 初始化数据库表
userModel.createTable().then(() => {
  console.log('Users table created');
});

app.use('/api/auth', routes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
```

- [ ] **Step 5: 编写测试**

```javascript
// tests/auth.test.js
const request = require('supertest');
const app = require('../index');

describe('Auth Service', () => {
  test('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'password123',
        name: 'Test User',
        role: 'admin'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.username).toBe('testuser');
  });

  test('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeTruthy();
  });

  test('should return 401 for invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'wrongpassword'
      });
    expect(response.statusCode).toBe(401);
  });
});
```

- [ ] **Step 6: 安装依赖并运行测试**

```bash
cd /workspace/idc-platform/backend/services/auth
npm install bcrypt jsonwebtoken mysql2 cors supertest jest
npm test
```

- [ ] **Step 7: 提交代码**

```bash
cd /workspace/idc-platform
git add backend/services/auth/
git commit -m "feat: implement auth service"
```

### 2.2 API 网关

**Files:**
- Create: `/workspace/idc-platform/backend/services/gateway/index.js`
- Create: `/workspace/idc-platform/backend/services/gateway/routes.js`
- Create: `/workspace/idc-platform/backend/services/gateway/proxy.js`
- Create: `/workspace/idc-platform/backend/services/gateway/tests/gateway.test.js`

- [ ] **Step 1: 编写代理配置**

```javascript
// proxy.js
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

const serviceMap = {
  auth: 'http://auth-service:3001',
  twin: 'http://twin-service:3002',
  device: 'http://device-service:3003',
  network: 'http://network-service:3004',
  ipam: 'http://ipam-service:3005',
  workflow: 'http://workflow-service:3006',
  asset: 'http://asset-service:3007',
  monitor: 'http://monitor-service:3008',
  report: 'http://report-service:3009',
  plugin: 'http://plugin-service:3010'
};

const proxyRequest = (req, res) => {
  const service = req.url.split('/')[2];
  const target = serviceMap[service];
  
  if (target) {
    proxy.web(req, res, { target });
  } else {
    res.status(404).json({ error: 'Service not found' });
  }
};

module.exports = proxyRequest;
```

- [ ] **Step 2: 编写路由**

```javascript
// routes.js
const express = require('express');
const proxyRequest = require('./proxy');

const router = express.Router();

router.all('/api/*', proxyRequest);

module.exports = router;
```

- [ ] **Step 3: 编写主服务文件**

```javascript
// index.js
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
```

- [ ] **Step 4: 编写测试**

```javascript
// tests/gateway.test.js
const request = require('supertest');
const app = require('../index');

describe('API Gateway', () => {
  test('should proxy to auth service', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });
    expect(response.statusCode).toBe(401); // 因为服务还没启动
  });

  test('should return 404 for unknown service', async () => {
    const response = await request(app)
      .get('/api/unknown/service');
    expect(response.statusCode).toBe(404);
  });
});
```

- [ ] **Step 5: 安装依赖并运行测试**

```bash
cd /workspace/idc-platform/backend/services/gateway
npm install http-proxy cors supertest jest
npm test
```

- [ ] **Step 6: 提交代码**

```bash
cd /workspace/idc-platform
git add backend/services/gateway/
git commit -m "feat: implement API gateway"
```

### 2.3 数字孪生服务

**Files:**
- Create: `/workspace/idc-platform/backend/services/twin/index.js`
- Create: `/workspace/idc-platform/backend/services/twin/routes.js`
- Create: `/workspace/idc-platform/backend/services/twin/models/TwinModel.js`
- Create: `/workspace/idc-platform/backend/services/twin/tests/twin.test.js`

- [ ] **Step 1: 编写孪生模型**

```javascript
// models/TwinModel.js
const mongoose = require('mongoose');

const twinSchema = new mongoose.Schema({
  name: String,
  dataCenterId: Number,
  floorId: Number,
  areaId: Number,
  modelData: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const TwinModel = mongoose.model('TwinModel', twinSchema);

class Twin {
  constructor() {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/idc_platform');
  }

  async create(model) {
    const newModel = new TwinModel(model);
    return await newModel.save();
  }

  async findById(id) {
    return await TwinModel.findById(id);
  }

  async findByDataCenter(dataCenterId) {
    return await TwinModel.find({ dataCenterId });
  }

  async update(id, model) {
    return await TwinModel.findByIdAndUpdate(id, model, { new: true });
  }

  async delete(id) {
    return await TwinModel.findByIdAndDelete(id);
  }
}

module.exports = new Twin();
```

- [ ] **Step 2: 编写路由**

```javascript
// routes.js
const express = require('express');
const twinModel = require('./models/TwinModel');

const router = express.Router();

router.post('/models', async (req, res) => {
  const model = await twinModel.create(req.body);
  res.status(201).json(model);
});

router.get('/models/:id', async (req, res) => {
  const model = await twinModel.findById(req.params.id);
  if (!model) {
    return res.status(404).json({ error: 'Model not found' });
  }
  res.json(model);
});

router.get('/models', async (req, res) => {
  const { dataCenterId } = req.query;
  const models = await twinModel.findByDataCenter(dataCenterId);
  res.json(models);
});

router.put('/models/:id', async (req, res) => {
  const model = await twinModel.update(req.params.id, req.body);
  if (!model) {
    return res.status(404).json({ error: 'Model not found' });
  }
  res.json(model);
});

router.delete('/models/:id', async (req, res) => {
  const model = await twinModel.delete(req.params.id);
  if (!model) {
    return res.status(404).json({ error: 'Model not found' });
  }
  res.json({ message: 'Model deleted' });
});

module.exports = router;
```

- [ ] **Step 3: 编写主服务文件**

```javascript
// index.js
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/twin', routes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Twin service running on port ${PORT}`);
});
```

- [ ] **Step 4: 编写测试**

```javascript
// tests/twin.test.js
const request = require('supertest');
const app = require('../index');

describe('Twin Service', () => {
  test('should create a new twin model', async () => {
    const response = await request(app)
      .post('/api/twin/models')
      .send({
        name: 'Test Model',
        dataCenterId: 1,
        floorId: 1,
        areaId: 1,
        modelData: { test: 'data' }
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe('Test Model');
  });

  test('should get a twin model by id', async () => {
    const createResponse = await request(app)
      .post('/api/twin/models')
      .send({
        name: 'Test Model 2',
        dataCenterId: 1,
        floorId: 1,
        areaId: 1,
        modelData: { test: 'data' }
      });
    const modelId = createResponse.body._id;

    const getResponse = await request(app)
      .get(`/api/twin/models/${modelId}`);
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body.name).toBe('Test Model 2');
  });
});
```

- [ ] **Step 5: 安装依赖并运行测试**

```bash
cd /workspace/idc-platform/backend/services/twin
npm install mongoose cors supertest jest
npm test
```

- [ ] **Step 6: 提交代码**

```bash
cd /workspace/idc-platform
git add backend/services/twin/
git commit -m "feat: implement twin service"
```

## 3. 前端核心模块开发

### 3.1 数字孪生可视化组件

**Files:**
- Create: `/workspace/idc-platform/frontend/src/components/DigitalTwin.vue`
- Create: `/workspace/idc-platform/frontend/src/components/ModelEditor.vue`
- Create: `/workspace/idc-platform/frontend/src/utils/three-utils.js`
- Create: `/workspace/idc-platform/frontend/src/store/twin.js`

- [ ] **Step 1: 编写 Three.js 工具函数**

```javascript
// utils/three-utils.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function initScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 5, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  return { scene, camera, renderer, controls };
}

export function createRack(x, y, z, uHeight = 42) {
  const group = new THREE.Group();
  
  // 机柜主体
  const geometry = new THREE.BoxGeometry(0.8, uHeight * 0.04445, 0.6);
  const material = new THREE.MeshPhongMaterial({ color: 0x333333 });
  const rack = new THREE.Mesh(geometry, material);
  group.add(rack);

  // U 位标记
  for (let i = 1; i <= uHeight; i++) {
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.4, y + (i - 0.5) * 0.04445, 0.3),
      new THREE.Vector3(0.4, y + (i - 0.5) * 0.04445, 0.3)
    ]);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x666666 });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    group.add(line);
  }

  group.position.set(x, y, z);
  return group;
}

export function animate(scene, camera, renderer, controls) {
  function loop() {
    requestAnimationFrame(loop);
    controls.update();
    renderer.render(scene, camera);
  }
  loop();
}
```

- [ ] **Step 2: 编写数字孪生 store**

```javascript
// store/twin.js
import { defineStore } from 'pinia';
import axios from 'axios';

export const useTwinStore = defineStore('twin', {
  state: () => ({
    models: [],
    currentModel: null,
    loading: false,
    error: null
  }),

  actions: {
    async fetchModels(dataCenterId) {
      this.loading = true;
      try {
        const response = await axios.get(`/api/twin/models?dataCenterId=${dataCenterId}`);
        this.models = response.data;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchModel(id) {
      this.loading = true;
      try {
        const response = await axios.get(`/api/twin/models/${id}`);
        this.currentModel = response.data;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async createModel(model) {
      this.loading = true;
      try {
        const response = await axios.post('/api/twin/models', model);
        this.models.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateModel(id, model) {
      this.loading = true;
      try {
        const response = await axios.put(`/api/twin/models/${id}`, model);
        const index = this.models.findIndex(m => m._id === id);
        if (index !== -1) {
          this.models[index] = response.data;
        }
        if (this.currentModel && this.currentModel._id === id) {
          this.currentModel = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteModel(id) {
      this.loading = true;
      try {
        await axios.delete(`/api/twin/models/${id}`);
        this.models = this.models.filter(m => m._id !== id);
        if (this.currentModel && this.currentModel._id === id) {
          this.currentModel = null;
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
```

- [ ] **Step 3: 编写数字孪生组件**

```vue
<!-- components/DigitalTwin.vue -->
<template>
  <div class="digital-twin">
    <div class="twin-controls">
      <el-button @click="toggleView">切换视图</el-button>
      <el-button @click="resetView">重置视图</el-button>
    </div>
    <div ref="container" class="twin-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { initScene, createRack, animate } from '../utils/three-utils';
import { useTwinStore } from '../store/twin';

const container = ref(null);
const viewMode = ref('3d'); // 3d or 2d
const scene = ref(null);
const camera = ref(null);
const renderer = ref(null);
const controls = ref(null);
const twinStore = useTwinStore();

const toggleView = () => {
  viewMode.value = viewMode.value === '3d' ? '2d' : '3d';
  // 切换视图逻辑
};

const resetView = () => {
  if (camera.value) {
    camera.value.position.set(0, 5, 10);
    controls.value.update();
  }
};

onMounted(async () => {
  // 初始化 3D 场景
  const { scene: s, camera: c, renderer: r, controls: co } = initScene(container.value);
  scene.value = s;
  camera.value = c;
  renderer.value = r;
  controls.value = co;

  // 添加机柜
  const rack1 = createRack(-2, 0, 0);
  const rack2 = createRack(0, 0, 0);
  const rack3 = createRack(2, 0, 0);
  scene.value.add(rack1, rack2, rack3);

  // 开始动画
  animate(scene.value, camera.value, renderer.value, controls.value);

  // 加载模型数据
  await twinStore.fetchModels(1);
});

onUnmounted(() => {
  if (renderer.value) {
    container.value.removeChild(renderer.value.domElement);
  }
});
</script>

<style scoped>
.digital-twin {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.twin-controls {
  padding: 10px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.twin-container {
  flex: 1;
  position: relative;
}
</style>
```

- [ ] **Step 4: 编写模型编辑器组件**

```vue
<!-- components/ModelEditor.vue -->
<template>
  <div class="model-editor">
    <el-form :model="modelForm" label-width="80px">
      <el-form-item label="模型名称">
        <el-input v-model="modelForm.name" />
      </el-form-item>
      <el-form-item label="机房ID">
        <el-input v-model.number="modelForm.dataCenterId" />
      </el-form-item>
      <el-form-item label="楼层ID">
        <el-input v-model.number="modelForm.floorId" />
      </el-form-item>
      <el-form-item label="区域ID">
        <el-input v-model.number="modelForm.areaId" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveModel">保存模型</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useTwinStore } from '../store/twin';

const twinStore = useTwinStore();
const modelForm = reactive({
  name: '',
  dataCenterId: 1,
  floorId: 1,
  areaId: 1,
  modelData: {}
});

const saveModel = async () => {
  try {
    await twinStore.createModel(modelForm);
    ElMessage.success('模型保存成功');
    resetForm();
  } catch (error) {
    ElMessage.error('模型保存失败');
  }
};

const resetForm = () => {
  modelForm.name = '';
  modelForm.dataCenterId = 1;
  modelForm.floorId = 1;
  modelForm.areaId = 1;
  modelForm.modelData = {};
};
</script>

<style scoped>
.model-editor {
  padding: 20px;
}
</style>
```

- [ ] **Step 5: 安装依赖并构建**

```bash
cd /workspace/idc-platform/frontend
npm install three @types/three
npm run build
```

- [ ] **Step 6: 提交代码**

```bash
cd /workspace/idc-platform
git add frontend/src/components/ frontend/src/utils/ frontend/src/store/
git commit -m "feat: implement digital twin frontend components"
```

## 4. 设备管理服务

**Files:**
- Create: `/workspace/idc-platform/backend/services/device/index.js`
- Create: `/workspace/idc-platform/backend/services/device/routes.js`
- Create: `/workspace/idc-platform/backend/services/device/models/Device.js`
- Create: `/workspace/idc-platform/backend/services/device/models/DeviceTemplate.js`
- Create: `/workspace/idc-platform/backend/services/device/tests/device.test.js`

- [ ] **Step 1: 编写设备模板模型**

```javascript
// models/DeviceTemplate.js
const mysql = require('mysql2/promise');

class DeviceTemplate {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'mysql',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root',
      database: process.env.MYSQL_DATABASE || 'idc_platform'
    });
  }

  async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS device_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        vendor VARCHAR(50) NOT NULL,
        model VARCHAR(100) NOT NULL,
        u_height INT NOT NULL,
        port_count INT NOT NULL,
        power_consumption FLOAT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await this.pool.execute(sql);
  }

  async create(template) {
    const [result] = await this.pool.execute(
      'INSERT INTO device_templates (name, category, vendor, model, u_height, port_count, power_consumption, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [template.name, template.category, template.vendor, template.model, template.u_height, template.port_count, template.power_consumption, template.description]
    );
    return result.insertId;
  }

  async findAll() {
    const [rows] = await this.pool.execute('SELECT * FROM device_templates');
    return rows;
  }

  async findById(id) {
    const [rows] = await this.pool.execute('SELECT * FROM device_templates WHERE id = ?', [id]);
    return rows[0];
  }

  async update(id, template) {
    const [result] = await this.pool.execute(
      'UPDATE device_templates SET name = ?, category = ?, vendor = ?, model = ?, u_height = ?, port_count = ?, power_consumption = ?, description = ? WHERE id = ?',
      [template.name, template.category, template.vendor, template.model, template.u_height, template.port_count, template.power_consumption, template.description, id]
    );
    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await this.pool.execute('DELETE FROM device_templates WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new DeviceTemplate();
```

- [ ] **Step 2: 编写设备模型**

```javascript
// models/Device.js
const mysql = require('mysql2/promise');

class Device {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'mysql',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root',
      database: process.env.MYSQL_DATABASE || 'idc_platform'
    });
  }

  async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS devices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        template_id INT NOT NULL,
        serial_number VARCHAR(100) UNIQUE NOT NULL,
        asset_number VARCHAR(100) UNIQUE NOT NULL,
        rack_id INT,
        u_position INT,
        status VARCHAR(20) NOT NULL,
        ip_address VARCHAR(50),
        mac_address VARCHAR(50),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES device_templates(id),
        FOREIGN KEY (rack_id) REFERENCES racks(id)
      )
    `;
    await this.pool.execute(sql);
  }

  async create(device) {
    const [result] = await this.pool.execute(
      'INSERT INTO devices (name, template_id, serial_number, asset_number, rack_id, u_position, status, ip_address, mac_address, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [device.name, device.template_id, device.serial_number, device.asset_number, device.rack_id, device.u_position, device.status, device.ip_address, device.mac_address, device.description]
    );
    return result.insertId;
  }

  async findAll() {
    const [rows] = await this.pool.execute('SELECT * FROM devices');
    return rows;
  }

  async findById(id) {
    const [rows] = await this.pool.execute('SELECT * FROM devices WHERE id = ?', [id]);
    return rows[0];
  }

  async update(id, device) {
    const [result] = await this.pool.execute(
      'UPDATE devices SET name = ?, template_id = ?, serial_number = ?, asset_number = ?, rack_id = ?, u_position = ?, status = ?, ip_address = ?, mac_address = ?, description = ? WHERE id = ?',
      [device.name, device.template_id, device.serial_number, device.asset_number, device.rack_id, device.u_position, device.status, device.ip_address, device.mac_address, device.description, id]
    );
    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await this.pool.execute('DELETE FROM devices WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new Device();
```

- [ ] **Step 3: 编写路由**

```javascript
// routes.js
const express = require('express');
const deviceModel = require('./models/Device');
const deviceTemplateModel = require('./models/DeviceTemplate');

const router = express.Router();

// 设备模板路由
router.post('/templates', async (req, res) => {
  const templateId = await deviceTemplateModel.create(req.body);
  res.status(201).json({ id: templateId, ...req.body });
});

router.get('/templates', async (req, res) => {
  const templates = await deviceTemplateModel.findAll();
  res.json(templates);
});

router.get('/templates/:id', async (req, res) => {
  const template = await deviceTemplateModel.findById(req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json(template);
});

router.put('/templates/:id', async (req, res) => {
  const success = await deviceTemplateModel.update(req.params.id, req.body);
  if (!success) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json({ id: req.params.id, ...req.body });
});

router.delete('/templates/:id', async (req, res) => {
  const success = await deviceTemplateModel.delete(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json({ message: 'Template deleted' });
});

// 设备路由
router.post('/devices', async (req, res) => {
  const deviceId = await deviceModel.create(req.body);
  res.status(201).json({ id: deviceId, ...req.body });
});

router.get('/devices', async (req, res) => {
  const devices = await deviceModel.findAll();
  res.json(devices);
});

router.get('/devices/:id', async (req, res) => {
  const device = await deviceModel.findById(req.params.id);
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }
  res.json(device);
});

router.put('/devices/:id', async (req, res) => {
  const success = await deviceModel.update(req.params.id, req.body);
  if (!success) {
    return res.status(404).json({ error: 'Device not found' });
  }
  res.json({ id: req.params.id, ...req.body });
});

router.delete('/devices/:id', async (req, res) => {
  const success = await deviceModel.delete(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Device not found' });
  }
  res.json({ message: 'Device deleted' });
});

module.exports = router;
```

- [ ] **Step 4: 编写主服务文件**

```javascript
// index.js
const express = require('express');
const cors = require('cors');
const deviceModel = require('./models/Device');
const deviceTemplateModel = require('./models/DeviceTemplate');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

// 初始化数据库表
deviceTemplateModel.createTable().then(() => {
  console.log('Device templates table created');
});

deviceModel.createTable().then(() => {
  console.log('Devices table created');
});

app.use('/api/device', routes);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Device service running on port ${PORT}`);
});
```

- [ ] **Step 5: 编写测试**

```javascript
// tests/device.test.js
const request = require('supertest');
const app = require('../index');

describe('Device Service', () => {
  test('should create a new device template', async () => {
    const response = await request(app)
      .post('/api/device/templates')
      .send({
        name: 'Cisco Switch',
        category: '网络设备',
        vendor: 'Cisco',
        model: 'WS-C2960X-24TS-L',
        u_height: 1,
        port_count: 24,
        power_consumption: 30,
        description: '24-port Gigabit switch'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe('Cisco Switch');
  });

  test('should create a new device', async () => {
    // 先创建模板
    const templateResponse = await request(app)
      .post('/api/device/templates')
      .send({
        name: 'Test Template',
        category: '网络设备',
        vendor: 'Test',
        model: 'Test Model',
        u_height: 1,
        port_count: 24,
        power_consumption: 30,
        description: 'Test template'
      });

    const response = await request(app)
      .post('/api/device/devices')
      .send({
        name: 'Test Device',
        template_id: templateResponse.body.id,
        serial_number: 'SN123456',
        asset_number: 'ASSET123456',
        rack_id: 1,
        u_position: 1,
        status: 'online',
        ip_address: '192.168.1.1',
        mac_address: '00:11:22:33:44:55',
        description: 'Test device'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe('Test Device');
  });
});
```

- [ ] **Step 6: 安装依赖并运行测试**

```bash
cd /workspace/idc-platform/backend/services/device
npm install mysql2 cors supertest jest
npm test
```

- [ ] **Step 7: 提交代码**

```bash
cd /workspace/idc-platform
git add backend/services/device/
git commit -m "feat: implement device service"
```

## 5. 智能网管服务

**Files:**
- Create: `/workspace/idc-platform/backend/services/network/index.js`
- Create: `/workspace/idc-platform/backend/services/network/routes.js`
- Create: `/workspace/idc-platform/backend/services/network/models/NetworkDevice.js`
- Create: `/workspace/idc-platform/backend/services/network/models/Config.js`
- Create: `/workspace/idc-platform/backend/services/network/tests/network.test.js`

- [ ] **Step 1: 编写网络设备模型**

```javascript
// models/NetworkDevice.js
const mysql = require('mysql2/promise');

class NetworkDevice {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'mysql',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root',
      database: process.env.MYSQL_DATABASE || 'idc_platform'
    });
  }

  async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS network_devices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        device_id INT NOT NULL,
        hostname VARCHAR(100) NOT NULL,
        ip_address VARCHAR(50) NOT NULL,
        vendor VARCHAR(50) NOT NULL,
        model VARCHAR(100) NOT NULL,
        os_version VARCHAR(100),
        serial_number VARCHAR(100),
        status VARCHAR(20) NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (device_id) REFERENCES devices(id)
      )
    `;
    await this.pool.execute(sql);
  }

  async create(device) {
    const [result] = await this.pool.execute(
      'INSERT INTO network_devices (device_id, hostname, ip_address, vendor, model, os_version, serial_number, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [device.device_id, device.hostname, device.ip_address, device.vendor, device.model, device.os_version, device.serial_number, device.status]
    );
    return result.insertId;
  }

  async findAll() {
    const [rows] = await this.pool.execute('SELECT * FROM network_devices');
    return rows;
  }

  async findById(id) {
    const [rows] = await this.pool.execute('SELECT * FROM network_devices WHERE id = ?', [id]);
    return rows[0];
  }

  async update(id, device) {
    const [result] = await this.pool.execute(
      'UPDATE network_devices SET device_id = ?, hostname = ?, ip_address = ?, vendor = ?, model = ?, os_version = ?, serial_number = ?, status = ? WHERE id = ?',
      [device.device_id, device.hostname, device.ip_address, device.vendor, device.model, device.os_version, device.serial_number, device.status, id]
    );
    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await this.pool.execute('DELETE FROM network_devices WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new NetworkDevice();
```

- [ ] **Step 2: 编写配置模型**

```javascript
// models/Config.js
const mysql = require('mysql2/promise');

class Config {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'mysql',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root',
      database: process.env.MYSQL_DATABASE || 'idc_platform'
    });
  }

  async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS configs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        device_id INT NOT NULL,
        config_data TEXT NOT NULL,
        backup_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        version INT NOT NULL,
        FOREIGN KEY (device_id) REFERENCES network_devices(id)
      )
    `;
    await this.pool.execute(sql);
  }

  async create(config) {
    // 获取当前版本
    const [rows] = await this.pool.execute('SELECT MAX(version) as max_version FROM configs WHERE device_id = ?', [config.device_id]);
    const version = (rows[0].max_version || 0) + 1;

    const [result] = await this.pool.execute(
      'INSERT INTO configs (device_id, config_data, version) VALUES (?, ?, ?)',
      [config.device_id, config.config_data, version]
    );
    return result.insertId;
  }

  async findByDeviceId(deviceId) {
    const [rows] = await this.pool.execute('SELECT * FROM configs WHERE device_id = ? ORDER BY version DESC', [deviceId]);
    return rows;
  }

  async findById(id) {
    const [rows] = await this.pool.execute('SELECT * FROM configs WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = new Config();
```

- [ ] **Step 3: 编写路由**

```javascript
// routes.js
const express = require('express');
const networkDeviceModel = require('./models/NetworkDevice');
const configModel = require('./models/Config');

const router = express.Router();

// 网络设备路由
router.post('/devices', async (req, res) => {
  const deviceId = await networkDeviceModel.create(req.body);
  res.status(201).json({ id: deviceId, ...req.body });
});

router.get('/devices', async (req, res) => {
  const devices = await networkDeviceModel.findAll();
  res.json(devices);
});

router.get('/devices/:id', async (req, res) => {
  const device = await networkDeviceModel.findById(req.params.id);
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }
  res.json(device);
});

router.put('/devices/:id', async (req, res) => {
  const success = await networkDeviceModel.update(req.params.id, req.body);
  if (!success) {
    return res.status(404).json({ error: 'Device not found' });
  }
  res.json({ id: req.params.id, ...req.body });
});

router.delete('/devices/:id', async (req, res) => {
  const success = await networkDeviceModel.delete(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Device not found' });
  }
  res.json({ message: 'Device deleted' });
});

// 配置路由
router.post('/configs', async (req, res) => {
  const configId = await configModel.create(req.body);
  res.status(201).json({ id: configId, ...req.body });
});

router.get('/configs/device/:deviceId', async (req, res) => {
  const configs = await configModel.findByDeviceId(req.params.deviceId);
  res.json(configs);
});

router.get('/configs/:id', async (req, res) => {
  const config = await configModel.findById(req.params.id);
  if (!config) {
    return res.status(404).json({ error: 'Config not found' });
  }
  res.json(config);
});

module.exports = router;
```

- [ ] **Step 4: 编写主服务文件**

```javascript
// index.js
const express = require('express');
const cors = require('cors');
const networkDeviceModel = require('./models/NetworkDevice');
const configModel = require('./models/Config');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

// 初始化数据库表
networkDeviceModel.createTable().then(() => {
  console.log('Network devices table created');
});

configModel.createTable().then(() => {
  console.log('Configs table created');
});

app.use('/api/network', routes);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Network service running on port ${PORT}`);
});
```

- [ ] **Step 5: 编写测试**

```javascript
// tests/network.test.js
const request = require('supertest');
const app = require('../index');

describe('Network Service', () => {
  test('should create a new network device', async () => {
    const response = await request(app)
      .post('/api/network/devices')
      .send({
        device_id: 1,
        hostname: 'switch-01',
        ip_address: '192.168.1.100',
        vendor: 'Cisco',
        model: 'WS-C2960X-24TS-L',
        os_version: '15.2(2)E8',
        serial_number: 'FOC12345678',
        status: 'online'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.hostname).toBe('switch-01');
  });

  test('should create a new config backup', async () => {
    // 先创建网络设备
    const deviceResponse = await request(app)
      .post('/api/network/devices')
      .send({
        device_id: 1,
        hostname: 'switch-02',
        ip_address: '192.168.1.101',
        vendor: 'Cisco',
        model: 'WS-C2960X-24TS-L',
        os_version: '15.2(2)E8',
        serial_number: 'FOC87654321',
        status: 'online'
      });

    const response = await request(app)
      .post('/api/network/configs')
      .send({
        device_id: deviceResponse.body.id,
        config_data: 'interface GigabitEthernet1/0/1\n switchport mode access\n switchport access vlan 10\n'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.device_id).toBe(deviceResponse.body.id);
  });
});
```

- [ ] **Step 6: 安装依赖并运行测试**

```bash
cd /workspace/idc-platform/backend/services/network
npm install mysql2 cors supertest jest
npm test
```

- [ ] **Step 7: 提交代码**

```bash
cd /workspace/idc-platform
git add backend/services/network/
git commit -m "feat: implement network service"
```

## 6. IPAM 服务

**Files:**
- Create: `/workspace/idc-platform/backend/services/ipam/index.js`
- Create: `/workspace/idc-platform/backend/services/ipam/routes.js`
- Create: `/workspace/idc-platform/backend/services/ipam/models/IPAddress.js`
- Create: `/workspace/idc-platform/backend/services/ipam/models/NetworkSegment.js`
- Create: `/workspace/idc-platform/backend/services/ipam/tests/ipam.test.js`

- [ ] **Step 1: 编写网段模型**

```javascript
// models/NetworkSegment.js
const mysql = require('mysql2/promise');

class NetworkSegment {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'mysql',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root',
      database: process.env.MYSQL_DATABASE || 'idc_platform'
    });
  }

  async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS network_segments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        network VARCHAR(50) NOT NULL,
        netmask VARCHAR(50) NOT NULL,
        gateway VARCHAR(50),
        vlan INT,
        department VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await this.pool.execute(sql);
  }

  async create(segment) {
    const [result] = await this.pool.execute(
      'INSERT INTO network_segments (name, network, netmask, gateway, vlan, department, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [segment.name, segment.network, segment.netmask, segment.gateway, segment.vlan, segment.department, segment.description]
    );
    return result.insertId;
  }

  async findAll() {
    const [rows] = await this.pool.execute('SELECT * FROM network_segments');
    return rows;
  }

  async findById(id) {
    const [rows] = await this.pool.execute('SELECT * FROM network_segments WHERE id = ?', [id]);
    return rows[0];
  }

  async update(id, segment) {
    const [result] = await this.pool.execute(
      'UPDATE network_segments SET name = ?, network = ?, netmask = ?, gateway = ?, vlan = ?, department = ?, description = ? WHERE id = ?',
      [segment.name, segment.network, segment.netmask, segment.gateway, segment.vlan, segment.department, segment.description, id]
    );
    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await this.pool.execute('DELETE FROM network_segments WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new NetworkSegment();
```

- [ ] **Step 2: 编写 IP 地址模型**

```javascript
// models/IPAddress.js
const mysql = require('mysql2/promise');

class IPAddress {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'mysql',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root',
      database: process.env.MYSQL_DATABASE || 'idc_platform'
    });
  }

  async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS ip_addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        segment_id INT NOT NULL,
        ip_address VARCHAR(50) NOT NULL,
        mac_address VARCHAR(50),
        device_id INT,
        port_id INT,
        status VARCHAR(20) NOT NULL,
        user VARCHAR(100),
        department VARCHAR(100),
        purpose VARCHAR(100),
        description TEXT,
        allocated_at TIMESTAMP,
        released_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (segment_id) REFERENCES network_segments(id),
        FOREIGN KEY (device_id) REFERENCES devices(id)
      )
    `;
    await this.pool.execute(sql);
  }

  async create(ip) {
    const [result] = await this.pool.execute(
      'INSERT INTO ip_addresses (segment_id, ip_address, mac_address, device_id, port_id, status, user, department, purpose, description, allocated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [ip.segment_id, ip.ip_address, ip.mac_address, ip.device_id, ip.port_id, ip.status, ip.user, ip.department, ip.purpose, ip.description, ip.allocated_at || new Date()]
    );
    return result.insertId;
  }

  async findAll() {
    const [rows] = await this.pool.execute('SELECT * FROM ip_addresses');
    return rows;
  }

  async findById(id) {
    const [rows] = await this.pool.execute('SELECT * FROM ip_addresses WHERE id = ?', [id]);
    return rows[0];
  }

  async findBySegment(segmentId) {
    const [rows] = await this.pool.execute('SELECT * FROM ip_addresses WHERE segment_id = ?', [segmentId]);
    return rows;
  }

  async update(id, ip) {
    const [result] = await this.pool.execute(
      'UPDATE ip_addresses SET segment_id = ?, ip_address = ?, mac_address = ?, device_id = ?, port_id = ?, status = ?, user = ?, department = ?, purpose = ?, description = ?, allocated_at = ?, released_at = ? WHERE id = ?',
      [ip.segment_id, ip.ip_address, ip.mac_address, ip.device_id, ip.port_id, ip.status, ip.user, ip.department, ip.purpose, ip.description, ip.allocated_at, ip.released_at, id]
    );
    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await this.pool.execute('DELETE FROM ip_addresses WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new IPAddress();
```

- [ ] **Step 3: 编写路由**

```javascript
// routes.js
const express = require('express');
const networkSegmentModel = require('./models/NetworkSegment');
const ipAddressModel = require('./models/IPAddress');

const router = express.Router();

// 网段路由
router.post('/segments', async (req, res) => {
  const segmentId = await networkSegmentModel.create(req.body);
  res.status(201).json({ id: segmentId, ...req.body });
});

router.get('/segments', async (req, res) => {
  const segments = await networkSegmentModel.findAll();
  res.json(segments);
});

router.get('/segments/:id', async (req, res) => {
  const segment = await networkSegmentModel.findById(req.params.id);
  if (!segment) {
    return res.status(404).json({ error: 'Segment not found' });
  }
  res.json(segment);
});

router.put('/segments/:id', async (req, res) => {
  const success = await networkSegmentModel.update(req.params.id, req.body);
  if (!success) {
    return res.status(404).json({ error: 'Segment not found' });
  }
  res.json({ id: req.params.id, ...req.body });
});

router.delete('/segments/:id', async (req, res) => {
  const success = await networkSegmentModel.delete(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Segment not found' });
  }
  res.json({ message: 'Segment deleted' });
});

// IP 地址路由
router.post('/ips', async (req, res) => {
  const ipId = await ipAddressModel.create(req.body);
  res.status(201).json({ id: ipId, ...req.body });
});

router.get('/ips', async (req, res) => {
  const ips = await ipAddressModel.findAll();
  res.json(ips);
});

router.get('/ips/:id', async (req, res) => {
  const ip = await ipAddressModel.findById(req.params.id);
  if (!ip) {
    return res.status(404).json({ error: 'IP address not found' });
  }
  res.json(ip);
});

router.get('/ips/segment/:segmentId', async (req, res) => {
  const ips = await ipAddressModel.findBySegment(req.params.segmentId);
  res.json(ips);
});

router.put('/ips/:id', async (req, res) => {
  const success = await ipAddressModel.update(req.params.id, req.body);
  if (!success) {
    return res.status(404).json({ error: 'IP address not found' });
  }
  res.json({ id: req.params.id, ...req.body });
});

router.delete('/ips/:id', async (req, res) => {
  const success = await ipAddressModel.delete(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'IP address not found' });
  }
  res.json({ message: 'IP address deleted' });
});

module.exports = router;

### 6.4 编写主服务文件

```javascript
// index.js
const express = require('express');
const cors = require('cors');
const networkSegmentModel = require('./models/NetworkSegment');
const ipAddressModel = require('./models/IPAddress');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

// 初始化数据库表
networkSegmentModel.createTable().then(() => {
  console.log('Network segments table created');
});

ipAddressModel.createTable().then(() => {
  console.log('IP addresses table created');
});

app.use('/api/ipam', routes);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`IPAM service running on port ${PORT}`);
});
```

### 6.5 编写测试

```javascript
// tests/ipam.test.js
const request = require('supertest');
const app = require('../index');

describe('IPAM Service', () => {
  test('should create a new network segment', async () => {
    const response = await request(app)
      .post('/api/ipam/segments')
      .send({
        name: 'Production Network',
        network: '192.168.1.0',
        netmask: '255.255.255.0',
        gateway: '192.168.1.1',
        vlan: 10,
        department: 'IT',
        description: 'Production network segment'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe('Production Network');
  });

  test('should create a new IP address', async () => {
    // 先创建网段
    const segmentResponse = await request(app)
      .post('/api/ipam/segments')
      .send({
        name: 'Test Network',
        network: '192.168.2.0',
        netmask: '255.255.255.0',
        gateway: '192.168.2.1',
        vlan: 20,
        department: 'Test',
        description: 'Test network segment'
      });

    const response = await request(app)
      .post('/api/ipam/ips')
      .send({
        segment_id: segmentResponse.body.id,
        ip_address: '192.168.2.100',
        mac_address: '00:11:22:33:44:55',
        device_id: 1,
        port_id: 1,
        status: 'allocated',
        user: 'Test User',
        department: 'Test',
        purpose: 'Test device',
        description: 'Test IP address'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.ip_address).toBe('192.168.2.100');
  });
});
```

### 6.6 安装依赖并运行测试

```bash
cd /workspace/idc-platform/backend/services/ipam
npm install mysql2 cors supertest jest
npm test
```

### 6.7 提交代码

```bash
cd /workspace/idc-platform
git add backend/services/ipam/
git commit -m "feat: implement ipam service"
```

## 7. 集成与部署

### 7.1 构建前端

**Files:**
- Modify: `/workspace/idc-platform/frontend/vite.config.js`

- [ ] **Step 1: 配置前端构建**

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../backend/services/gateway/public',
    emptyOutDir: true
  }
})
```

- [ ] **Step 2: 构建前端**

```bash
cd /workspace/idc-platform/frontend
npm run build
```

### 7.2 配置 Docker Compose

**Files:**
- Modify: `/workspace/idc-platform/docker-compose.yml`

- [ ] **Step 1: 更新 Docker Compose 配置**

```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "8080:80"
    depends_on:
      - gateway

  gateway:
    build: ./backend/services/gateway
    ports:
      - "3000:3000"
    depends_on:
      - auth-service
      - twin-service
      - device-service
      - network-service
      - ipam-service
      - mysql
      - redis

  auth-service:
    build: ./backend/services/auth
    depends_on:
      - mysql

  twin-service:
    build: ./backend/services/twin
    depends_on:
      - mysql
      - mongodb

  device-service:
    build: ./backend/services/device
    depends_on:
      - mysql

  network-service:
    build: ./backend/services/network
    depends_on:
      - mysql
      - redis
      - kafka

  ipam-service:
    build: ./backend/services/ipam
    depends_on:
      - mysql

  workflow-service:
    build: ./backend/services/workflow
    depends_on:
      - mysql

  asset-service:
    build: ./backend/services/asset
    depends_on:
      - mysql

  monitor-service:
    build: ./backend/services/monitor
    depends_on:
      - mysql
      - redis
      - kafka

  report-service:
    build: ./backend/services/report
    depends_on:
      - mysql

  plugin-service:
    build: ./backend/services/plugin
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: idc_platform
    volumes:
      - mysql-data:/var/lib/mysql

  redis:
    image: redis:7.0
    volumes:
      - redis-data:/data

  mongodb:
    image: mongo:6.0
    volumes:
      - mongodb-data:/data/db

  kafka:
    image: bitnami/kafka:3.6
    environment:
      KAFKA_CFG_NODE_ID: 0
      KAFKA_CFG_PROCESS_ROLES: controller,broker
      KAFKA_CFG_CONTROLLER_QUORUM_VOTERS: 0@kafka:9093
      KAFKA_CFG_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093
      KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      KAFKA_CFG_CONTROLLER_LISTENER_NAMES: CONTROLLER
    volumes:
      - kafka-data:/bitnami/kafka

volumes:
  mysql-data:
  redis-data:
  mongodb-data:
  kafka-data:
```

### 7.3 构建和启动服务

- [ ] **Step 1: 构建服务**

```bash
cd /workspace/idc-platform
docker-compose build
```

- [ ] **Step 2: 启动服务**

```bash
docker-compose up -d
```

- [ ] **Step 3: 验证服务**

```bash
docker-compose ps
```

### 7.4 初始化数据

**Files:**
- Create: `/workspace/idc-platform/scripts/init-data.js`

- [ ] **Step 1: 编写初始化脚本**

```javascript
// scripts/init-data.js
const mysql = require('mysql2/promise');

async function initData() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'idc_platform'
  });

  try {
    // 创建默认用户
    await pool.execute(
      'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
      ['admin', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Admin User', 'admin']
    );

    // 创建默认设备模板
    await pool.execute(
      'INSERT INTO device_templates (name, category, vendor, model, u_height, port_count, power_consumption, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['Cisco Switch', '网络设备', 'Cisco', 'WS-C2960X-24TS-L', 1, 24, 30, '24-port Gigabit switch']
    );

    // 创建默认网段
    await pool.execute(
      'INSERT INTO network_segments (name, network, netmask, gateway, vlan, department, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['Default Network', '192.168.1.0', '255.255.255.0', '192.168.1.1', 10, 'IT', 'Default network segment']
    );

    console.log('Initial data created successfully');
  } catch (error) {
    console.error('Error creating initial data:', error);
  } finally {
    await pool.end();
  }
}

initData();
```

- [ ] **Step 2: 运行初始化脚本**

```bash
cd /workspace/idc-platform
node scripts/init-data.js
```

## 8. 测试与验证

### 8.1 单元测试

- [ ] **Step 1: 运行所有服务的单元测试**

```bash
cd /workspace/idc-platform/backend/services/auth
npm test

cd /workspace/idc-platform/backend/services/gateway
npm test

cd /workspace/idc-platform/backend/services/twin
npm test

cd /workspace/idc-platform/backend/services/device
npm test

cd /workspace/idc-platform/backend/services/network
npm test

cd /workspace/idc-platform/backend/services/ipam
npm test
```

### 8.2 集成测试

- [ ] **Step 1: 测试 API 网关**

```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"username": "admin", "password": "admin123"}'
```

- [ ] **Step 2: 测试数字孪生服务**

```bash
curl -X GET http://localhost:3000/api/twin/models
```

- [ ] **Step 3: 测试设备管理服务**

```bash
curl -X GET http://localhost:3000/api/device/templates
```

- [ ] **Step 4: 测试智能网管服务**

```bash
curl -X GET http://localhost:3000/api/network/devices
```

- [ ] **Step 5: 测试 IPAM 服务**

```bash
curl -X GET http://localhost:3000/api/ipam/segments
```

### 8.3 前端测试

- [ ] **Step 1: 访问前端应用**

打开浏览器，访问 `http://localhost:8080`

- [ ] **Step 2: 登录测试**

使用用户名 `admin` 和密码 `admin123` 登录

- [ ] **Step 3: 测试数字孪生功能**

导航到数字孪生页面，查看 3D 机房可视化

- [ ] **Step 4: 测试设备管理功能**

导航到设备管理页面，查看设备列表和模板管理

- [ ] **Step 5: 测试 IPAM 功能**

导航到 IPAM 页面，查看网段和 IP 地址管理

## 9. 部署与交付

### 9.1 构建生产镜像

- [ ] **Step 1: 构建生产镜像**

```bash
cd /workspace/idc-platform
docker-compose -f docker-compose.yml build
```

### 9.2 导出镜像

- [ ] **Step 1: 导出镜像**

```bash
docker save -o idc-platform.tar idc-platform_frontend idc-platform_gateway idc-platform_auth-service idc-platform_twin-service idc-platform_device-service idc-platform_network-service idc-platform_ipam-service
```

### 9.3 编写部署文档

**Files:**
- Create: `/workspace/idc-platform/docs/deployment.md`

- [ ] **Step 1: 编写部署文档**

```markdown
# IDC 数字孪生机房一体化管理平台部署文档

## 1. 环境要求

- Docker 20.10+
- Docker Compose 1.29+
- 内存: 16GB+
- CPU: 8核+
- 磁盘: 100GB+

## 2. 部署步骤

### 2.1 准备环境

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 2.2 部署服务

```bash
# 解压镜像
docker load -i idc-platform.tar

# 启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps
```

### 2.3 初始化数据

```bash
# 运行初始化脚本
node scripts/init-data.js
```

## 3. 访问方式

- 前端应用: http://服务器IP:8080
- API 网关: http://服务器IP:3000

## 4. 默认账号

- 用户名: admin
- 密码: admin123

## 5. 常见问题

### 5.1 服务启动失败

```bash
# 查看日志
docker-compose logs [服务名]
```

### 5.2 数据库连接失败

确保 MySQL 服务正常运行，且环境变量配置正确。

### 5.3 前端无法访问后端

确保 API 网关服务正常运行，且前端配置的代理地址正确。
```

### 9.4 提交最终代码

```bash
cd /workspace/idc-platform
git add .
git commit -m "feat: complete implementation"
git tag v1.0.0
git push origin v1.0.0
```

## 10. 后续优化与扩展

### 10.1 性能优化

- [ ] **Step 1: 优化数据库索引**
- [ ] **Step 2: 实现 Redis 缓存**
- [ ] **Step 3: 优化 3D 渲染性能**

### 10.2 功能扩展

- [ ] **Step 1: 实现工单审批系统**
- [ ] **Step 2: 实现资产管理系统**
- [ ] **Step 3: 实现监控告警系统**
- [ ] **Step 4: 实现报表大屏系统**

### 10.3 安全加固

- [ ] **Step 1: 配置 HTTPS**
- [ ] **Step 2: 实现 IP 白名单**
- [ ] **Step 3: 配置防火墙规则**

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-21-idc-digital-twin-platform-implementation.md`.**

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**