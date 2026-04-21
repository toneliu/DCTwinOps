const mysql = require('mysql2/promise');

class User {
  constructor() {
    // 测试环境使用内存数据库，生产环境使用 MySQL
    if (process.env.NODE_ENV === 'test') {
      this.initTestStorage();
    } else {
      this.pool = mysql.createPool({
        host: process.env.MYSQL_HOST || 'mysql',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'root',
        database: process.env.MYSQL_DATABASE || 'idc_platform'
      });
      this.createTable();
    }
  }

  // 测试环境使用内存存储
  initTestStorage() {
    this.users = [];
    this.nextId = 1;
    console.log('Test storage initialized');
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
    try {
      await this.pool.execute(sql);
      console.log('Users table created successfully');
    } catch (error) {
      console.error('Error creating users table:', error);
    }
  }

  async findByUsername(username) {
    if (process.env.NODE_ENV === 'test') {
      return this.users.find(user => user.username === username);
    }
    const [rows] = await this.pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  async create(user) {
    if (process.env.NODE_ENV === 'test') {
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
    const [result] = await this.pool.execute(
      'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
      [user.username, user.password, user.name, user.role]
    );
    return result.insertId;
  }

  async findById(id) {
    if (process.env.NODE_ENV === 'test') {
      return this.users.find(user => user.id === id);
    }
    const [rows] = await this.pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  async update(id, user) {
    if (process.env.NODE_ENV === 'test') {
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
    const [result] = await this.pool.execute(
      'UPDATE users SET username = ?, password = ?, name = ?, role = ? WHERE id = ?',
      [user.username, user.password, user.name, user.role, id]
    );
    return result.affectedRows > 0;
  }

  async delete(id) {
    if (process.env.NODE_ENV === 'test') {
      const initialLength = this.users.length;
      this.users = this.users.filter(user => user.id !== id);
      return this.users.length !== initialLength;
    }
    const [result] = await this.pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new User();
