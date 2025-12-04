// 业务记录模型
import { sequelize, Sequelize } from '../connection.js'
import BaseModel from './BaseModel.js'
import { User } from './User.js'
import { Insurance } from './Insurance.js'
import { InsuranceCategory } from './InsuranceCategory.js'

// 定义业务记录模型
const Business = sequelize.define('business', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  agent_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  underwriter_id: {
    type: Sequelize.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  insurance_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Insurance,
      key: 'id'
    }
  },
  customer_name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  customer_phone: {
    type: Sequelize.STRING,
    allowNull: false
  },
  customer_email: {
    type: Sequelize.STRING
  },
  client_type: {
    type: Sequelize.ENUM('personal', 'company', 'vehicle'),
    allowNull: false,
    defaultValue: 'personal'
  },
  personal_name: {
    type: Sequelize.STRING
  },
  company_name: {
    type: Sequelize.STRING
  },
  plate_number: {
    type: Sequelize.STRING
  },
  insurance_type_id: {
    type: Sequelize.INTEGER,
    references: {
      model: 'insurance_category',
      key: 'id'
    }
  },
  specific_insurance_id: {
    type: Sequelize.INTEGER,
    references: {
      model: Insurance,
      key: 'id'
    }
  },
  inquiry_amount: {
    type: Sequelize.DECIMAL(10, 2)
  },
  deal_status: {
    type: Sequelize.STRING,
    defaultValue: 'pending'
  },
  reminder_time: {
    type: Sequelize.DATE
  },
  deal_time: {
    type: Sequelize.DATE
  },
  follow_up_remark: {
    type: Sequelize.TEXT
  },
  policy_number: {
    type: Sequelize.STRING
  },
  premium_amount: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false
  },
  coverage_amount: {
    type: Sequelize.DECIMAL(15, 2),
    allowNull: false
  },
  start_date: {
    type: Sequelize.DATE,
    allowNull: false
  },
  end_date: {
    type: Sequelize.DATE,
    allowNull: false
  },
  status: {
    type: Sequelize.ENUM('pending', 'approved', 'rejected', 'expired'),
    allowNull: false,
    defaultValue: 'pending'
  },
  inquiry_date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
  approval_date: {
    type: Sequelize.DATE
  },
  remarks: {
    type: Sequelize.TEXT
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

// 定义关联关系
Business.belongsTo(User, { as: 'agent', foreignKey: 'agent_id' })
Business.belongsTo(User, { as: 'underwriter', foreignKey: 'underwriter_id' })
Business.belongsTo(Insurance, { as: 'insurance', foreignKey: 'insurance_id' })
Business.belongsTo(InsuranceCategory, { as: 'category', foreignKey: 'insurance_type_id' })

// 创建Business模型实例
const BusinessModel = new BaseModel(Business)

// 扩展自定义方法
BusinessModel.getBusinessListWithRelations = async (params = {}) => {
  return await BusinessModel.findAll({
    ...params,
    include: [
      { model: User, as: 'agent', attributes: ['id', 'name', 'username'] },
      { model: User, as: 'underwriter', attributes: ['id', 'name', 'username'] },
      { model: Insurance, as: 'insurance', attributes: ['id', 'name', 'code', 'category_id'] }
    ]
  })
}

BusinessModel.getBusinessDetailWithRelations = async (id) => {
  return await BusinessModel.findById(id, {
    include: [
      { model: User, as: 'agent', attributes: ['id', 'name', 'username', 'phone', 'email'] },
      { model: User, as: 'underwriter', attributes: ['id', 'name', 'username', 'phone', 'email'] },
      { model: Insurance, as: 'insurance', attributes: ['id', 'name', 'code', 'category_id', 'description', 'status'] }
    ]
  })
}

BusinessModel.getStatistics = async (params = {}) => {
  // 实现统计查询逻辑
  const { startDate, endDate, agentId, insuranceType } = params
  const whereClause = {}
  
  if (startDate && endDate) {
    whereClause.inquiry_date = {
      [Sequelize.Op.between]: [startDate, endDate]
    }
  }
  
  if (agentId) {
    whereClause.agent_id = agentId
  }
  
  if (insuranceType) {
    whereClause.insurance_type = insuranceType
  }
  
  // 获取总询价数
  const totalInquiry = await Business.count(whereClause)
  
  // 获取总成交数（已批准的记录）
  const totalDeal = await Business.count({
    ...whereClause,
    status: 'approved'
  })
  
  // 获取总保费
  const totalPremium = await Business.sum('premium_amount', whereClause)
  
  return {
    totalInquiry,
    totalDeal,
    totalPremium,
    conversionRate: totalInquiry > 0 ? (totalDeal / totalInquiry * 100).toFixed(2) : 0
  }
}

// 关联关系已在文件上方定义

export {
  Business,
  BusinessModel
}
