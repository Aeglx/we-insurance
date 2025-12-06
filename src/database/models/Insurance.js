// 险种模型
import { sequelize, Sequelize } from '../connection.js'
import BaseModel from './BaseModel.js'
import { InsuranceCategory } from './InsuranceCategory.js'

// 定义险种模型
const Insurance = sequelize.define('insurance', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  code: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  category_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: InsuranceCategory,
      key: 'id'
    }
  },
  description: {
    type: Sequelize.TEXT
  },
  status: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  image: {
    type: Sequelize.STRING
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
  tableName: 'insurance',
  timestamps: false
})

// 定义关联关系
Insurance.belongsTo(InsuranceCategory, { as: 'category', foreignKey: 'category_id' })
InsuranceCategory.hasMany(Insurance, { as: 'insurances', foreignKey: 'category_id' })

// 创建Insurance模型实例
const InsuranceModel = new BaseModel(Insurance)

// 扩展自定义方法
InsuranceModel.getInsuranceListWithCategory = async (params = {}) => {
  return await InsuranceModel.findAll({
    ...params,
    include: [
      { model: InsuranceCategory, as: 'category', attributes: ['id', 'name'] }
    ]
  })
}

InsuranceModel.findByName = async (name) => {
  return await Insurance.findOne({ where: { name } })
}

InsuranceModel.findByCode = async (code) => {
  return await Insurance.findOne({ where: { code } })
}

export {
  Insurance,
  InsuranceModel
}
