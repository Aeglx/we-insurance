// 业务等级模型
import { sequelize, Sequelize } from '../connection.js'
import BaseModel from './BaseModel.js'

// 定义业务等级模型
const BusinessLevel = sequelize.define('business_level', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  status: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  tableName: 'business_level',
  timestamps: false
})

// 创建BusinessLevel模型实例
const BusinessLevelModel = new BaseModel(BusinessLevel)

// 扩展自定义方法
BusinessLevelModel.findByName = async (name) => {
  return await BusinessLevel.findOne({ where: { name } })
}

export {
  BusinessLevel,
  BusinessLevelModel
}