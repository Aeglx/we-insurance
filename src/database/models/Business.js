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

// 获取最近业务记录
BusinessModel.getRecentBusiness = async (params = {}) => {
  const { limit = 3, agentId } = params;
  const whereClause = {};
  
  if (agentId) {
    whereClause.agent_id = agentId;
  }
  
  return await BusinessModel.findAll({
    where: whereClause,
    include: [
      { model: User, as: 'agent', attributes: ['id', 'name', 'username'] },
      { model: Insurance, as: 'insurance', attributes: ['id', 'name'] }
    ],
    order: [['inquiry_date', 'DESC']],
    limit: limit
  });
}

BusinessModel.getStatistics = async (params = {}) => {
  // 实现统计查询逻辑
  const { startDate, endDate, agentId, insuranceType, date, dealStatus } = params
  const whereClause = {}
  
  // 按日期范围过滤
  if (startDate && endDate) {
    whereClause.inquiry_date = {
      [Sequelize.Op.between]: [startDate, endDate]
    }
  } 
  // 按特定日期过滤
  else if (date) {
    // 创建当天的开始和结束时间
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    whereClause.inquiry_date = {
      [Sequelize.Op.between]: [startOfDay, endOfDay]
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
  
  // 获取总成交数（考虑成交状态参数）
  const dealWhereClause = { ...whereClause }
  if (dealStatus) {
    dealWhereClause.deal_status = dealStatus
  } else {
    // 默认统计已成交的记录
    dealWhereClause.deal_status = 'success'
  }
  
  const totalDeal = await Business.count(dealWhereClause)
  
  // 获取总保费
  const totalPremium = await Business.sum('premium_amount', whereClause)
  
  // 获取今日询价数（登记日期为当前日期的所有数据）
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
  
  console.log('今日查询范围:', startOfToday, '至', endOfToday)
  
  const todayWhereClause = {
    inquiry_date: {
      [Sequelize.Op.between]: [startOfToday, endOfToday]
    }
  }
  
  if (agentId) {
    todayWhereClause.agent_id = agentId
  }
  
  if (insuranceType) {
    todayWhereClause.insurance_type = insuranceType
  }
  
  const todayInquiryCount = await Business.count(todayWhereClause)
  
  // 获取今日成交数（登记日期为当前日期且成交状态为已成交的数据）
  const todayDealWhereClause = {
    ...todayWhereClause,
    deal_status: 'success'
  }
  
  const todayDealCount = await Business.count(todayDealWhereClause)
  
  // 获取本月业绩（保费总和）
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
  
  const monthlyWhereClause = {
    inquiry_date: {
      [Sequelize.Op.between]: [startOfMonth, endOfMonth]
    },
    deal_status: 'success' // 只统计已成交的
  }
  
  if (agentId) {
    monthlyWhereClause.agent_id = agentId
  }
  
  if (insuranceType) {
    monthlyWhereClause.insurance_type = insuranceType
  }
  
  const monthlyPerformance = await Business.sum('premium_amount', monthlyWhereClause) || 0
  
  return {
    totalInquiry,
    totalDeal,
    totalPremium,
    conversionRate: totalInquiry > 0 ? (totalDeal / totalInquiry * 100).toFixed(2) : 0,
    todayInquiryCount,
    todayDealCount,
    monthlyPerformance
  }
}

// 业务趋势统计方法
BusinessModel.getBusinessTrend = async (params = {}) => {
  const { timeDimension = 'week', agentId, insuranceType } = params
  const today = new Date()
  let startDate, endDate, groupByExpression
  
  // 根据时间维度计算开始和结束日期
  switch (timeDimension) {
    case 'week':
      // 计算本周的开始日期（周一）
      const dayOfWeek = today.getDay() || 7 // 将周日转换为7
      startDate = new Date(today)
      startDate.setDate(today.getDate() - (dayOfWeek - 1))
      startDate.setHours(0, 0, 0, 0)
      
      // 计算本周的结束日期（周日）
      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6)
      endDate.setHours(23, 59, 59, 999)
      
      // 按天分组
      groupByExpression = Sequelize.literal("DATE_FORMAT(inquiry_date, '%Y-%m-%d')")
      break
      
    case 'month':
      // 计算本月的开始日期
      startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      
      // 计算本月的结束日期
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
      
      // 按天分组
      groupByExpression = Sequelize.literal("DATE_FORMAT(inquiry_date, '%Y-%m-%d')")
      break
      
    case 'quarter':
      // 计算本季度的开始日期
      const quarter = Math.floor(today.getMonth() / 3)
      startDate = new Date(today.getFullYear(), quarter * 3, 1)
      
      // 计算本季度的结束日期
      endDate = new Date(today.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999)
      
      // 按周分组
      groupByExpression = Sequelize.literal("CONCAT(YEAR(inquiry_date), '-', WEEK(inquiry_date))")
      break
      
    default:
      throw new Error('无效的时间维度')
  }
  
  const whereClause = {
    inquiry_date: {
      [Sequelize.Op.between]: [startDate, endDate]
    }
  }
  
  if (agentId) {
    whereClause.agent_id = agentId
  }
  
  if (insuranceType) {
    whereClause.insurance_type = insuranceType
  }
  
  try {
    // 统计跟进中的记录
    const followUpData = await Business.findAll({
      attributes: [
        [groupByExpression, 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        ...whereClause,
        status: 'pending' // 跟进中状态
      },
      group: ['date'],
      order: [['date', 'ASC']]
    })
    
    // 统计已完成的记录
    const completedData = await Business.findAll({
      attributes: [
        [groupByExpression, 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        ...whereClause,
        status: 'approved' // 已完成状态
      },
      group: ['date'],
      order: [['date', 'ASC']]
    })
    
    // 将数据转换为对象格式以便合并
    const followUpMap = new Map(followUpData.map(item => [item.date, parseInt(item.count)]))
    const completedMap = new Map(completedData.map(item => [item.date, parseInt(item.count)]))
    
    // 获取所有唯一日期
    const allDates = new Set([...followUpMap.keys(), ...completedMap.keys()])
    
    // 合并数据
    const mergedData = Array.from(allDates)
      .sort()
      .map(date => ({
        date,
        followUp: followUpMap.get(date) || 0,
        completed: completedMap.get(date) || 0
      }))
    
    return {
      timeDimension,
      data: mergedData
    }
  } catch (error) {
    console.error('获取业务趋势数据失败:', error)
    throw error
  }
}

// 关联关系已在文件上方定义

  // 获取险种分布数据
  BusinessModel.getInsuranceDistribution = async (params = {}) => {
    const { timeDimension, agentId } = params
    const whereClause = {}
    const today = new Date()
    
    // 根据时间维度设置日期范围
    switch (timeDimension) {
      case 'today':
        // 今日
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
        whereClause.inquiry_date = {
          [Sequelize.Op.between]: [startOfToday, endOfToday]
        }
        break
      case 'month':
        // 本月
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
        whereClause.inquiry_date = {
          [Sequelize.Op.between]: [startOfMonth, endOfMonth]
        }
        break
      case 'all':
      default:
        // 全量数据，不设置日期范围
        break
    }
    
    if (agentId) {
      whereClause.agent_id = agentId
    }
    
    try {
      // 按保险类型分组统计数量
      const distributionData = await Business.findAll({
        attributes: [
          'insurance_type',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        where: whereClause,
        group: ['insurance_type'],
        order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']]
      })
      
      // 转换数据格式
      const formattedData = distributionData.map(item => ({
        name: item.insurance_type,
        value: parseInt(item.count)
      }))
      
      return {
        timeDimension,
        data: formattedData
      }
    } catch (error) {
      console.error('获取险种分布数据失败:', error)
      throw error
    }
  }

  // 获取成交率数据
  BusinessModel.getDealRate = async (params = {}) => {
    const { days = 7, agentId } = params
    const whereClause = {}
    
    // 计算日期范围
    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)
    const startDate = new Date(endDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
    startDate.setHours(0, 0, 0, 0)
    
    whereClause.inquiry_date = {
      [Sequelize.Op.between]: [startDate, endDate]
    }
    
    if (agentId) {
      whereClause.agent_id = agentId
    }
    
    try {
      // 按天分组统计总记录数和成交记录数
      const dailyData = await Business.findAll({
        attributes: [
          [Sequelize.literal("DATE_FORMAT(inquiry_date, '%Y-%m-%d')"), 'date'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
          [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN deal_status = 'success' THEN 1 ELSE 0 END")), 'dealCount']
        ],
        where: whereClause,
        group: ['date'],
        order: [['date', 'ASC']]
      })
      
      // 转换数据格式并计算成交率
      const formattedData = dailyData.map(item => ({
        date: item.date,
        dealRate: item.total > 0 ? parseFloat(((item.dealCount / item.total) * 100).toFixed(2)) : 0
      }))
      
      return {
        days,
        data: formattedData
      }
    } catch (error) {
      console.error('获取成交率数据失败:', error)
      throw error
    }
  }

  // 获取基础指标数据
  BusinessModel.getBasicData = async (params = {}) => {
    const { agentId } = params
    const today = new Date()
    
    // 今日询价数
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
    
    const todayInquiryWhereClause = {
      inquiry_date: {
        [Sequelize.Op.between]: [startOfToday, endOfToday]
      }
    }
    
    if (agentId) {
      todayInquiryWhereClause.agent_id = agentId
    }
    
    const todayInquiry = await Business.count(todayInquiryWhereClause)
    
    // 今日成交数
    const todayDealWhereClause = {
      ...todayInquiryWhereClause,
      deal_status: 'success'
    }
    
    const todayDeal = await Business.count(todayDealWhereClause)
    
    // 本月业绩
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
    
    const monthlyWhereClause = {
      inquiry_date: {
        [Sequelize.Op.between]: [startOfMonth, endOfMonth]
      },
      deal_status: 'success'
    }
    
    if (agentId) {
      monthlyWhereClause.agent_id = agentId
    }
    
    const monthlyPerformance = await Business.sum('premium_amount', monthlyWhereClause) || 0
    
    return {
      todayInquiry,
      todayDeal,
      monthlyPerformance
    }
  }

  // 获取仪表盘基础统计数据
  BusinessModel.getBasicStatistics = async (params = {}) => {
    try {
      // 调用现有的getStatistics方法获取基础数据
      const stats = await BusinessModel.getStatistics(params);
      return stats;
    } catch (error) {
      console.error('获取仪表盘基础统计数据失败:', error);
      throw error;
    }
  };

  // 获取仪表盘趋势数据
  BusinessModel.getTrendData = async (timeRange = '30d', type = 'inquiry', params = {}) => {
    try {
      // 根据timeRange确定时间维度
      let timeDimension;
      if (timeRange === '7d') {
        timeDimension = 'week';
      } else if (timeRange === '30d' || timeRange === 'month') {
        timeDimension = 'month';
      } else if (timeRange === '90d' || timeRange === 'quarter') {
        timeDimension = 'quarter';
      } else {
        timeDimension = 'week'; // 默认按周
      }

      // 调用现有的getBusinessTrend方法获取趋势数据
      const trendData = await BusinessModel.getBusinessTrend({
        ...params,
        timeDimension: timeDimension
      });

      return trendData;
    } catch (error) {
      console.error('获取仪表盘趋势数据失败:', error);
      throw error;
    }
  };

export {
  Business,
  BusinessModel
}
