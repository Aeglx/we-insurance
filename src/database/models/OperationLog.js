import { DataTypes } from 'sequelize'
import BaseModel from './BaseModel.js'

/**
 * 操作日志模型
 * 记录系统中的所有操作行为
 */
class OperationLog extends BaseModel {
  static init(sequelize) {
    return super.init({
      // 操作ID
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '操作日志ID'
      },
      // 操作人ID
      operator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '操作人ID'
      },
      // 操作人姓名
      operator_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '操作人姓名'
      },
      // 操作类型
      operation_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: '操作类型：create/update/delete/import/export'
      },
      // 操作内容
      operation_content: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '操作内容描述'
      },
      // 操作时间
      operation_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
        comment: '操作时间'
      },
      // 操作IP地址
      ip_address: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '操作IP地址'
      },
      // 操作模块
      module: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '操作模块：business/insurance/agent等'
      },
      // 关联ID
      related_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '关联业务ID'
      }
    }, {
      sequelize,
      tableName: 'operation_log',
      timestamps: false,
      comment: '操作日志表'
    })
  }

  /**
   * 创建操作日志
   * @param {Object} logData 日志数据
   * @returns {Promise<Object>} 创建的日志记录
   */
  static async createLog(logData) {
    try {
      return await this.create(logData)
    } catch (error) {
      console.error('创建操作日志失败:', error)
      throw error
    }
  }

  /**
   * 根据业务ID获取操作日志
   * @param {number} relatedId 关联业务ID
   * @param {Object} options 查询选项
   * @returns {Promise<Array>} 操作日志列表
   */
  static async getLogsByRelatedId(relatedId, options = {}) {
    try {
      const queryOptions = {
        where: { related_id: relatedId },
        order: [['operation_time', 'DESC']],
        ...options
      }
      return await this.findAll(queryOptions)
    } catch (error) {
      console.error('获取操作日志失败:', error)
      throw error
    }
  }
}

// 初始化并导出模型
let OperationLogModel

export function initOperationLog(sequelize) {
  OperationLogModel = OperationLog.init(sequelize)
  return OperationLogModel
}

export { OperationLog, OperationLogModel }
