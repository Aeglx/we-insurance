// 数据库服务层，封装数据库操作
import { sequelize, testConnection } from '../database/connection.js'
import { User, Business, Insurance, InsuranceCategory, BusinessLevel } from '../database/models/index.js'

// 数据库服务
const databaseService = {
  // 初始化数据库连接
  init: async () => {
    try {
      // 测试数据库连接
      await testConnection()
      
      // 自动创建表（如果不存在）
      await sequelize.sync({
        force: false, // 不强制删除已有表
        alter: true // 如果表结构有变化，自动修改表结构
      })
      
      console.log('数据库表初始化完成！')
      return true
    } catch (error) {
      console.error('数据库初始化失败:', error)
      return false
    }
  },
  
  // 关闭数据库连接
  close: async () => {
    try {
      await sequelize.close()
      console.log('数据库连接已关闭！')
      return true
    } catch (error) {
      console.error('关闭数据库连接失败:', error)
      return false
    }
  },
  
  // 事务处理
  transaction: async (callback) => {
    const transaction = await sequelize.transaction()
    
    try {
      const result = await callback(transaction)
      await transaction.commit()
      return result
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  },
  
  // 获取数据库连接实例
  getConnection: () => {
    return sequelize
  },
  
  // 获取Sequelize实例
  getSequelize: () => {
    return sequelize.Sequelize
  }
}

export default databaseService
