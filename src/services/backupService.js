// 数据库备份服务
import mysql2 from 'mysql2/promise'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import dbConfig from '../config/database.js'
import { sequelize } from '../database/connection.js'

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 数据库备份配置
const BACKUP_CONFIG = {
  // 备份文件路径
  BACKUP_DIR: path.join(__dirname, '../../database'),
  // 备份文件名
  BACKUP_FILE: 'backup.sql',
  // 备份间隔（毫秒）- 30分钟
  BACKUP_INTERVAL: 30 * 60 * 1000,
  // 是否启用自动备份
  AUTO_BACKUP: true
}

// 获取当前环境的数据库配置
const env = process.env.NODE_ENV || 'development'
const databaseConfig = dbConfig[env]

/**
 * 数据库备份服务类
 */
class BackupService {
  constructor() {
    this.backupInterval = null
    this.backupPath = path.join(BACKUP_CONFIG.BACKUP_DIR, BACKUP_CONFIG.BACKUP_FILE)
  }

  /**
   * 初始化备份服务
   */
  async init() {
    try {
      // 确保备份目录存在
      await fs.mkdir(BACKUP_CONFIG.BACKUP_DIR, { recursive: true })
      
      // 启动定时备份任务
      if (BACKUP_CONFIG.AUTO_BACKUP) {
        this.startAutoBackup()
      }
      
      console.log('数据库备份服务初始化完成！')
      console.log(`备份文件路径: ${this.backupPath}`)
      console.log(`自动备份间隔: ${BACKUP_CONFIG.BACKUP_INTERVAL / 1000}秒`)
    } catch (error) {
      console.error('数据库备份服务初始化失败:', error)
    }
  }

  /**
   * 开始自动备份任务
   */
  startAutoBackup() {
    if (this.backupInterval) {
      return
    }
    
    // 立即执行一次备份
    this.exportDatabase()
    
    // 设置定时备份
    this.backupInterval = setInterval(() => {
      this.exportDatabase()
    }, BACKUP_CONFIG.BACKUP_INTERVAL)
    
    console.log('自动备份任务已启动')
  }

  /**
   * 停止自动备份任务
   */
  stopAutoBackup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval)
      this.backupInterval = null
      console.log('自动备份任务已停止')
    }
  }

  /**
   * 导出数据库数据
   */
  async exportDatabase() {
    try {
      console.log('开始导出数据库数据...')
      
      // 创建数据库连接
      const connection = await mysql2.createConnection({
        host: databaseConfig.host,
        port: databaseConfig.port,
        user: databaseConfig.username,
        password: databaseConfig.password,
        database: databaseConfig.database,
        multipleStatements: true
      })
      
      // 获取所有表名
      const [tables] = await connection.query(
        'SHOW TABLES IN ??', 
        [databaseConfig.database]
      )
      
      const tableNames = tables.map(row => Object.values(row)[0])
      let backupContent = ''
      
      // 导出每个表的数据
      for (const tableName of tableNames) {
        // 获取表结构
        const [createTableResult] = await connection.query(
          `SHOW CREATE TABLE ??`, 
          [tableName]
        )
        const createTableSQL = createTableResult[0][`Create Table`] + ';' + '\n\n'
        
        // 获取表数据
        const [rows] = await connection.query(
          `SELECT * FROM ??`, 
          [tableName]
        )
        
        backupContent += createTableSQL
        
        // 如果表有数据，导出数据
        if (rows.length > 0) {
          const insertSQL = this.generateInsertSQL(tableName, rows)
          backupContent += insertSQL + '\n\n'
        }
      }
      
      // 保存备份文件
      await fs.writeFile(this.backupPath, backupContent, 'utf8')
      
      console.log(`数据库数据导出成功！备份文件：${this.backupPath}`)
      console.log(`备份时间：${new Date().toLocaleString()}`)
      
      // 关闭连接
      await connection.end()
      
      return true
    } catch (error) {
      console.error('导出数据库数据失败:', error)
      return false
    }
  }

  /**
   * 生成INSERT语句
   * @param {string} tableName 表名
   * @param {Array} rows 数据行
   * @returns {string} INSERT语句
   */
  generateInsertSQL(tableName, rows) {
    if (!rows || rows.length === 0) {
      return ''
    }
    
    // 获取字段名
    const columns = Object.keys(rows[0])
    
    // 构建INSERT语句
    let insertSQL = `INSERT INTO \`${tableName}\` (\`${columns.join('\`, \`')}\`) VALUES `
    
    // 构建值列表
    const values = rows.map(row => {
      const rowValues = columns.map(column => {
        const value = row[column]
        if (value === null) {
          return 'NULL'
        } else if (typeof value === 'string') {
          // 转义字符串
          return `'${value.replace(/'/g, "''")}'`
        } else if (value instanceof Date) {
          // 日期格式化
          return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`
        } else {
          return value
        }
      })
      return `(${rowValues.join(', ')})`
    })
    
    insertSQL += values.join(', ') + ';'
    
    return insertSQL
  }

  /**
   * 导入数据库数据
   * @param {boolean} force 是否强制导入（删除现有表后导入）
   */
  async importDatabase(force = false) {
    try {
      console.log('开始导入数据库数据...')
      
      // 检查备份文件是否存在
      try {
        await fs.access(this.backupPath)
      } catch (error) {
        console.log('备份文件不存在，跳过导入:', this.backupPath)
        return false
      }
      
      // 读取备份文件内容
      const backupContent = await fs.readFile(this.backupPath, 'utf8')
      
      // 创建数据库连接
      const connection = await mysql2.createConnection({
        host: databaseConfig.host,
        port: databaseConfig.port,
        user: databaseConfig.username,
        password: databaseConfig.password,
        database: databaseConfig.database,
        multipleStatements: true
      })
      
      if (force) {
        console.log('强制导入模式：删除现有表并重新导入...')
        
        // 禁用外键检查
        await connection.query('SET FOREIGN_KEY_CHECKS = 0')
        
        // 获取所有现有表
        const [tables] = await connection.query(
          "SELECT table_name FROM information_schema.tables WHERE table_schema = ?",
          [databaseConfig.database]
        )
        
        // 删除所有表
        if (tables && tables.length > 0) {
          const tableNames = tables.map(table => table.table_name).filter(Boolean)
          if (tableNames && tableNames.length > 0) {
            const dropTablesSql = `DROP TABLE IF EXISTS ${tableNames.join(', ')}`
            await connection.query(dropTablesSql)
            console.log('成功删除所有现有表')
          }
        }
      }
      
      // 执行备份SQL
      await connection.query(backupContent)
      
      // 重新启用外键检查
      await connection.query('SET FOREIGN_KEY_CHECKS = 1')
      
      console.log('数据库数据导入成功！')
      
      // 关闭连接
      await connection.end()
      
      return true
    } catch (error) {
      console.error('导入数据库数据失败:', error)
      return false
    }
  }

  /**
   * 手动触发备份
   */
  async manualBackup() {
    return this.exportDatabase()
  }

  /**
   * 手动触发恢复
   */
  async manualRestore() {
    return this.importDatabase()
  }
}

// 创建备份服务实例
const backupService = new BackupService()

// 导出备份服务
export default backupService
