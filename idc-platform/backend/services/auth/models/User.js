class User {
  constructor() {
    // 所有环境都使用内存数据库
    this.initTestStorage();
  }

  // 使用内存存储
  initTestStorage() {
    this.users = [];
    this.nextId = 1;
    console.log('Memory storage initialized');
  }

  async createTable() {
    return Promise.resolve();
  }

  async findByUsername(username) {
    return this.users.find(user => user.username === username);
  }

  async create(user) {
    const newUser = {
      id: this.nextId++,
      username: user.username,
      password: user.password,
      name: user.name,
      role: user.role,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.users.push(newUser);
    return newUser.id;
  }

  async findById(id) {
    return this.users.find(user => user.id === id);
  }

  async update(id, user) {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = {
        ...this.users[index],
        ...user,
        id,
        updated_at: new Date()
      };
      return true;
    }
    return false;
  }

  async delete(id) {
    const initialLength = this.users.length;
    this.users = this.users.filter(user => user.id !== id);
    return this.users.length !== initialLength;
  }
}

module.exports = new User();
