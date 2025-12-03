// 用户模型
import { sequelize, Sequelize } from '../connection.js'
import BaseModel from './BaseModel.js'

// 定义用户模型
const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  role: {
    type: Sequelize.ENUM('admin', 'agent', 'underwriter'),
    allowNull: false,
    defaultValue: 'agent'
  },
  email: {
    type: Sequelize.STRING
  },
  phone: {
    type: Sequelize.STRING
  },
  department: {
    type: Sequelize.STRING
  },
  status: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
  deleted_at: {
    type: Sequelize.DATE
  }
})

// 创建User模型实例
const UserModel = new BaseModel(User)

// 扩展自定义方法
UserModel.findByUsername = async (username) => {
  return await User.findOne({ where: { username } })
}

UserModel.getAdmins = async () => {
  return await User.findAll({ where: { role: 'admin' } })
}

export {
  User,
  UserModel
}
