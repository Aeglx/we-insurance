// 导入SQL文件到数据库的脚本
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

// 获取当前文件所在目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据库配置
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'qwerty123',
  database: 'we_insurance_system'
};

// SQL文件路径
const sqlFilePath = path.join(__dirname, 'database', 'backup.sql');

async function importSQL() {
  try {
    console.log('正在读取SQL文件...');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('连接到数据库...');
    const connection = await mysql.createConnection({
      ...dbConfig,
      multipleStatements: true
    });
    
    console.log('开始执行SQL导入...');
    
    // 禁用外键约束
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // 执行SQL语句
    await connection.query(sql);
    
    // 启用外键约束
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('SQL导入成功！');
    await connection.end();
  } catch (error) {
    console.error('SQL导入失败:', error.message);
    process.exit(1);
  }
}

// 执行导入
importSQL();