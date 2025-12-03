// 险种分类模型
import { sequelize, Sequelize } from '../connection.js'
import BaseModel from './BaseModel.js'

// 定义险种分类模型
const InsuranceCategory = sequelize.define('insurance_category', {
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
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  tableName: 'insurance_category',
  timestamps: false
})

// 创建InsuranceCategory模型实例
const InsuranceCategoryModel = new BaseModel(InsuranceCategory)

// 扩展自定义方法
InsuranceCategoryModel.findByName = async (name) => {
  return await InsuranceCategory.findOne({ where: { name } })
}

export {
  InsuranceCategory,
  InsuranceCategoryModel
}
