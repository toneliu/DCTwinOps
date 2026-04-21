<template>
  <div class="devices-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设备管理</span>
          <el-button type="primary" @click="showCreateDialog">新建设备模板</el-button>
        </div>
      </template>
      
      <el-table :data="templates" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="模板名称" width="200" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="vendor" label="厂商" width="120" />
        <el-table-column prop="model" label="型号" width="150" />
        <el-table-column prop="uHeight" label="U高度" width="80" />
        <el-table-column prop="portCount" label="端口数" width="80" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" @click="viewTemplate(scope.row)">查看</el-button>
            <el-button size="small" type="danger" @click="deleteTemplate(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建模板对话框 -->
    <el-dialog v-model="dialogVisible" title="创建设备模板">
      <el-form :model="templateForm" label-width="100px">
        <el-form-item label="模板名称">
          <el-input v-model="templateForm.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="templateForm.category" placeholder="请选择分类">
            <el-option label="网络设备" value="网络设备" />
            <el-option label="服务器" value="服务器" />
            <el-option label="存储设备" value="存储设备" />
            <el-option label="安全设备" value="安全设备" />
          </el-select>
        </el-form-item>
        <el-form-item label="厂商">
          <el-input v-model="templateForm.vendor" placeholder="请输入厂商" />
        </el-form-item>
        <el-form-item label="型号">
          <el-input v-model="templateForm.model" placeholder="请输入型号" />
        </el-form-item>
        <el-form-item label="U高度">
          <el-input-number v-model="templateForm.uHeight" :min="1" />
        </el-form-item>
        <el-form-item label="端口数">
          <el-input-number v-model="templateForm.portCount" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createTemplate" :loading="createLoading">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const templates = ref([])
const loading = ref(false)
const createLoading = ref(false)
const dialogVisible = ref(false)

const templateForm = reactive({
  name: '',
  category: '',
  vendor: '',
  model: '',
  uHeight: 1,
  portCount: 24,
  powerConsumption: 300
})

const fetchTemplates = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/device/templates')
    templates.value = response.data
  } catch (error) {
    ElMessage.error('获取设备模板列表失败')
  } finally {
    loading.value = false
  }
}

const showCreateDialog = () => {
  templateForm.name = ''
  templateForm.category = ''
  dialogVisible.value = true
}

const createTemplate = async () => {
  if (!templateForm.name || !templateForm.category) {
    ElMessage.error('请填写完整信息')
    return
  }
  createLoading.value = true
  try {
    await axios.post('/api/device/templates', templateForm)
    ElMessage.success('模板创建成功')
    dialogVisible.value = false
    fetchTemplates()
  } catch (error) {
    ElMessage.error('模板创建失败')
  } finally {
    createLoading.value = false
  }
}

const viewTemplate = (template) => {
  ElMessage.info(`查看模板: ${template.name}`)
}

const deleteTemplate = async (template) => {
  try {
    await ElMessageBox.confirm('确定要删除这个模板吗？', '提示', {
      type: 'warning'
    })
    ElMessage.info('删除功能需要在完整的API中实现')
    fetchTemplates()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('模板删除失败')
    }
  }
}

onMounted(() => {
  fetchTemplates()
})
</script>

<style scoped>
.devices-container {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
