<template>
  <div class="ipam-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>IPAM - 网络段管理</span>
          <el-button type="primary" @click="showCreateDialog">新建网络段</el-button>
        </div>
      </template>
      
      <el-table :data="segments" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="网络段名称" width="200" />
        <el-table-column prop="network" label="网络地址" width="150" />
        <el-table-column prop="netmask" label="子网掩码" width="120" />
        <el-table-column prop="gateway" label="网关" width="120" />
        <el-table-column prop="vlan" label="VLAN" width="80" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" @click="viewSegment(scope.row)">查看</el-button>
            <el-button size="small" type="danger" @click="deleteSegment(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建网络段对话框 -->
    <el-dialog v-model="dialogVisible" title="创建网络段">
      <el-form :model="segmentForm" label-width="100px">
        <el-form-item label="网络段名称">
          <el-input v-model="segmentForm.name" placeholder="请输入网络段名称" />
        </el-form-item>
        <el-form-item label="网络地址">
          <el-input v-model="segmentForm.network" placeholder="例如: 192.168.1.0" />
        </el-form-item>
        <el-form-item label="子网掩码">
          <el-input v-model="segmentForm.netmask" placeholder="例如: 255.255.255.0" />
        </el-form-item>
        <el-form-item label="网关">
          <el-input v-model="segmentForm.gateway" placeholder="例如: 192.168.1.1" />
        </el-form-item>
        <el-form-item label="VLAN">
          <el-input-number v-model="segmentForm.vlan" :min="0" />
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="segmentForm.department" placeholder="请输入部门" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createSegment" :loading="createLoading">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const segments = ref([])
const loading = ref(false)
const createLoading = ref(false)
const dialogVisible = ref(false)

const segmentForm = reactive({
  name: '',
  network: '',
  netmask: '',
  gateway: '',
  vlan: 0,
  department: ''
})

const fetchSegments = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/ipam/segments')
    segments.value = response.data
  } catch (error) {
    ElMessage.error('获取网络段列表失败')
  } finally {
    loading.value = false
  }
}

const showCreateDialog = () => {
  Object.assign(segmentForm, {
    name: '',
    network: '',
    netmask: '',
    gateway: '',
    vlan: 0,
    department: ''
  })
  dialogVisible.value = true
}

const createSegment = async () => {
  if (!segmentForm.name || !segmentForm.network || !segmentForm.netmask) {
    ElMessage.error('请填写完整信息')
    return
  }
  createLoading.value = true
  try {
    await axios.post('/api/ipam/segments', segmentForm)
    ElMessage.success('网络段创建成功')
    dialogVisible.value = false
    fetchSegments()
  } catch (error) {
    ElMessage.error('网络段创建失败')
  } finally {
    createLoading.value = false
  }
}

const viewSegment = (segment) => {
  ElMessage.info(`查看网络段: ${segment.name}`)
}

const deleteSegment = async (segment) => {
  try {
    await ElMessageBox.confirm('确定要删除这个网络段吗？', '提示', {
      type: 'warning'
    })
    ElMessage.info('删除功能需要在完整的API中实现')
    fetchSegments()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('网络段删除失败')
    }
  }
}

onMounted(() => {
  fetchSegments()
})
</script>

<style scoped>
.ipam-container {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
