class TwinModel {
  constructor() {
    // 使用内存存储
    this.testModels = [];
    this.nextId = 1;
    console.log('Twin service memory storage initialized');
  }

  async create(modelData) {
    const newModel = {
      _id: `id-${this.nextId++}`,
      ...modelData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.testModels.push(newModel);
    return newModel;
  }

  async findById(id) {
    return this.testModels.find(m => m._id === id);
  }

  async findByDataCenter(dataCenterId) {
    return this.testModels.filter(m => m.dataCenterId === dataCenterId);
  }

  async update(id, updateData) {
    const index = this.testModels.findIndex(m => m._id === id);
    if (index !== -1) {
      this.testModels[index] = {
        ...this.testModels[index],
        ...updateData,
        updatedAt: new Date()
      };
      return this.testModels[index];
    }
    return null;
  }

  async delete(id) {
    const index = this.testModels.findIndex(m => m._id === id);
    if (index !== -1) {
      this.testModels.splice(index, 1);
      return true;
    }
    return false;
  }
}

module.exports = new TwinModel();
