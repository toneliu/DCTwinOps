<template>
  <div class="digital-twin-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>数字孪生 - 机房管理</span>
          <el-button type="primary" @click="showCreateDialog">新建模型</el-button>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="3D 视图" name="3d">
          <DigitalTwin />
        </el-tab-pane>
        <el-tab-pane label="模型列表" name="list">
          <el-table :data="models" style="width: 100%" v-loading="loading">
            <el-table-column prop="name" label="模型名称" width="200" />
            <el-table-column prop="dataCenterId" label="机房ID" width="100" />
            <el-table-column prop="floorId" label="楼层" width="100" />
            <el-table-column prop="areaId" label="区域" width="100" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button size="small" @click="viewModel(scope.row)">查看</el-button>
                <el-button size="small" type="danger" @click="deleteModel(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 创建模型对话框 -->
    <el-dialog v-model="dialogVisible" title="创建数字孪生模型">
      <ModelEditor />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import DigitalTwin from '../components/DigitalTwin.vue'
import ModelEditor from '../components/ModelEditor.vue'

const activeTab = ref('3d')
const models = ref([])
const loading = ref(false)
const createLoading = ref(false)
const dialogVisible = ref(false)

const modelForm = reactive({
  name: '',
  dataCenterId: 1,
  floorId: 0,
  areaId: 0,
  modelData: {}
})

const fetchModels = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/twin/models', { params: { dataCenterId: 1 } })
    models.value = response.data
  } catch (error) {
    ElMessage.error('获取模型列表失败')
  } finally {
    loading.value = false
  }
}

const showCreateDialog = () => {
  modelForm.name = ''
  dialogVisible.value = true
}

const viewModel = (model) => {
  ElMessage.info(`查看模型: ${model.name}`)
}

const deleteModel = async (model) => {
  try {
    await ElMessageBox.confirm('确定要删除这个模型吗？', '提示', {
      type: 'warning'
    })
    await axios.delete(`/api/twin/models/${model._id}`)
    ElMessage.success('模型删除成功')
    fetchModels()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('模型删除失败')
    }
  }
}

onMounted(() => {
  fetchModels()
})
</script>

<style scoped>
.digital-twin-container {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-tabs__content) {
  height: calc(100vh - 200px);
}
</style>
