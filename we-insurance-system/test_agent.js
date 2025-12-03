import { Sequelize, DataTypes } from 'sequelize';

// 创建数据库连接
const sequelize = new Sequelize('we_insurance_system', 'root', 'qwerty123', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306
});

// 定义User模型
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: DataTypes.STRING,
  name: DataTypes.STRING,
  role: DataTypes.STRING,
  department: DataTypes.STRING
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

// 查询代理人信息
async function checkAgentDepartment() {
  try {
    // 同步模型到数据库
    await sequelize.sync();
    
    // 查询所有用户
    const agents = await User.findAll({
      attributes: ['id', 'username', 'name', 'role', 'department']
    });
    
    console.log('代理人信息:');
    agents.forEach(agent => {
      console.log(agent.dataValues);
    });
    
    // 关闭数据库连接
    await sequelize.close();
  } catch (error) {
    console.error('查询失败:', error);
    await sequelize.close();
  }
}

// 执行查询
checkAgentDepartment();