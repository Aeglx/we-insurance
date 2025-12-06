// 脚本：添加insurance表的image字段
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// 数据库配置
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'we_insurance_system'
};

// 主函数
async function main() {
  try {
    // 连接数据库
    const connection = await mysql.createConnection(config);
    console.log('数据库连接成功！');

    // 检查image字段是否已存在
    const [checkResults] = await connection.execute(
      "SHOW COLUMNS FROM insurance LIKE 'image'"
    );

    if (checkResults.length === 0) {
      // 添加image字段
      await connection.execute(
        'ALTER TABLE insurance ADD COLUMN image VARCHAR(255) DEFAULT NULL'
      );
      console.log('image字段添加成功！');
    } else {
      console.log('image字段已存在！');
    }

    // 关闭连接
    await connection.end();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('操作失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main();