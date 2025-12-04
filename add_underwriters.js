// 添加出单员到user表的脚本
import mysql from 'mysql2/promise';

// 数据库配置
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'qwerty123',
  database: 'we_insurance_system'
};

async function addUnderwriters() {
  try {
    console.log('连接到数据库...');
    const connection = await mysql.createConnection(dbConfig);
    
    // 获取当前时间
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // 插入两个出单员
    const [result] = await connection.query(
      'INSERT INTO `user` (`username`, `password`, `name`, `role`, `created_at`, `updated_at`) VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)',
      ['shixiongfeng', '123456', '史雄风', 'underwriter', now, now, 'haoming', '123456', '郝明', 'underwriter', now, now]
    );
    
    console.log('出单员添加成功！');
    console.log(`影响行数: ${result.affectedRows}`);
    
    await connection.end();
  } catch (error) {
    console.error('添加出单员失败:', error.message);
    process.exit(1);
  }
}

// 执行添加操作
addUnderwriters();