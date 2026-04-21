# IDC Digital Twin Platform

企业级 IDC 数字孪生机房一体化管理平台

## 项目结构

```
idc-platform/
├── frontend/                 # 前端应用 (Vue 3 + TypeScript + Three.js)
│   ├── src/
│   │   ├── components/       # 组件
│   │   │   ├── DigitalTwin.vue
│   │   │   └── ModelEditor.vue
│   │   ├── stores/           # 状态管理
│   │   │   ├── user.js
│   │   │   └── twin.js
│   │   ├── utils/           # 工具函数
│   │   │   └── three-utils.js
│   │   ├── views/           # 页面
│   │   │   ├── Login.vue
│   │   │   ├── DigitalTwin.vue
│   │   │   ├── Devices.vue
│   │   │   └── IPAM.vue
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── router/
│   ├── package.json
│   └── vite.config.js
├── backend/
│   └── services/            # 微服务
│       ├── gateway/          # API 网关
│       ├── auth/           # 认证服务
│       ├── twin/           # 数字孪生服务
│       ├── device/        # 设备管理服务
│       ├── network/       # 智能网管服务
│       ├── ipam/         # IPAM 服务
│       ├── workflow/    # 工作流服务
│       ├── asset/         # 资产管理服务
│       ├── monitor/     # 监控服务
│       ├── report/       # 报表服务
│       └── plugin/       # 插件服务
├── docker-compose.yml      # Docker 编排文件
└── package.json          # 项目根配置
```

## 功能模块

1. **认证服务 (Auth) - 用户登录、注册、JWT 认证
2. **数字孪生服务 (Twin) - 3D 机房模型管理
3. **设备管理服务 (Device) - 设备模板、设备管理
4. **智能网管服务 (Network) - 网络设备管理、配置备份
5. **IPAM 服务 (IPAM) - IP 地址管理、网段管理
6. **工作流服务 (Workflow) - 工作流管理
7. **资产管理服务 (Asset) - 资产管理
8. **监控服务 (Monitor) - 监控指标采集
9. **报表服务 (Report) - 报表管理
10. **插件服务 (Plugin) - 插件管理

## 快速开始

### 使用 Docker Compose

```bash
cd idc-platform
docker-compose up -d
```

### 本地开发

前端：
```bash
cd frontend
npm install
npm run dev
```

后端服务（以 auth 为例）：
```bash
cd backend/services/auth
npm install
npm start
```

## 技术栈

- **前端**: Vue 3, TypeScript, Three.js, Element Plus, Pinia, Vite
- **后端**: Node.js, Express, MySQL, MongoDB, Redis, Kafka
- **部署**: Docker, Docker Compose

## API 网关

所有服务通过 API 网关统一访问，网关运行在 `http://localhost:3000`

- `/api/auth/*` - 认证服务
- `/api/twin/*` - 数字孪生服务
- `/api/device/*` - 设备管理服务
- `/api/network/*` - 智能网管服务
- `/api/ipam/*` - IPAM 服务
- `/api/workflow/*` - 工作流服务
- `/api/asset/*` - 资产管理服务
- `/api/monitor/*` - 监控服务
- `/api/report/*` - 报表服务
- `/api/plugin/*` - 插件服务

## 测试

所有服务都包含完整的 Jest 测试：
```bash
cd backend/services/<service-name>
npm test
```

## 许可证

MIT
