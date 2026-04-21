const mongoose = require('mongoose');

// Test mode - use in-memory storage
let testModels = [];

const twinSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dataCenterId: { type: Number, required: true },
  floorId: { type: Number, default: 0 },
  areaId: { type: Number, default: 0 },
  modelData: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Twin = mongoose.model('TwinModel', twinSchema);

class TwinModel {
  constructor() {
    if (process.env.NODE_ENV === 'test') {
      // Use in-memory storage for tests
      this.testModels = [];
      this.nextId = 1;
    } else {
      // Connect to MongoDB
      this.connect().then(() => {
        console.log('Connected to MongoDB for twin service');
      }).catch(err => {
        console.error('MongoDB connection error:', err);
      });
    }
  }

  async connect() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/idc_platform';
    await mongoose.connect(mongoUri);
  }

  async create(modelData) {
    if (process.env.NODE_ENV === 'test') {
      const newModel = {
        _id: `test-id-${this.nextId++}`,
        ...modelData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.testModels.push(newModel);
      return newModel;
    }
    const twin = new Twin(modelData);
    return await twin.save();
  }

  async findById(id) {
    if (process.env.NODE_ENV === 'test') {
      return this.testModels.find(m => m._id === id);
    }
    return await Twin.findById(id);
  }

  async findByDataCenter(dataCenterId) {
    if (process.env.NODE_ENV === 'test') {
      return this.testModels.filter(m => m.dataCenterId === dataCenterId);
    }
    return await Twin.find({ dataCenterId });
  }

  async update(id, updateData) {
    if (process.env.NODE_ENV === 'test') {
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
    return await Twin.findByIdAndUpdate(id, { ...updateData, updatedAt: new Date() }, { new: true });
  }

  async delete(id) {
    if (process.env.NODE_ENV === 'test') {
      const index = this.testModels.findIndex(m => m._id === id);
      if (index !== -1) {
        this.testModels.splice(index, 1);
        return true;
      }
      return false;
    }
    const result = await Twin.findByIdAndDelete(id);
    return result !== null;
  }
}

module.exports = new TwinModel();
