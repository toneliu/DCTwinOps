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
import { ElMessage } from 'element-plus';
import { useTwinStore } from '../stores/twin';

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
