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
      this.error = null;
      try {
        const response = await axios.get(`/api/twin/models?dataCenterId=${dataCenterId}`);
        this.models = response.data;
      } catch (error) {
        this.error = error.message || '获取模型失败';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    async fetchModel(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`/api/twin/models/${id}`);
        this.currentModel = response.data;
      } catch (error) {
        this.error = error.message || '获取模型失败';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    async createModel(model) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post('/api/twin/models', model);
        this.models.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.message || '创建模型失败';
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateModel(id, model) {
      this.loading = true;
      this.error = null;
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
        this.error = error.message || '更新模型失败';
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteModel(id) {
      this.loading = true;
      this.error = null;
      try {
        await axios.delete(`/api/twin/models/${id}`);
        this.models = this.models.filter(m => m._id !== id);
        if (this.currentModel && this.currentModel._id === id) {
          this.currentModel = null;
        }
      } catch (error) {
        this.error = error.message || '删除模型失败';
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
