const mysql = require('mysql2/promise');

class User {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'mysql',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root',
      database: process.env.MYSQL_DATABASE || 'idc_platform'
    });
    this.createTable();
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
    const [rows] = await this.pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  async create(user) {
    const [result] = await this.pool.execute(
      'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
      [user.username, user.password, user.name, user.role]
    );
    return result.insertId;
  }

  async findById(id) {
    const [rows] = await this.pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  async update(id, user) {
    const [result] = await this.pool.execute(
      'UPDATE users SET username = ?, password = ?, name = ?, role = ? WHERE id = ?',
      [user.username, user.password, user.name, user.role, id]
    );
    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await this.pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new User();
