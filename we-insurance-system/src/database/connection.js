// 数据库连接实例
import Sequelize from 'sequelize'
import dbConfig from '../config/database.js'
import mysql2 from 'mysql2/promise'

// 获取当前环境的数据库配置
const env = process.env.NODE_ENV || 'development'
const databaseConfig = dbConfig[env]

// 创建数据库（如果不存在）
const createDatabaseIfNotExists = async () => {
  try {
    // 先创建一个不指定数据库的连接
    const connection = await mysql2.createConnection({
      host: databaseConfig.host,
      port: databaseConfig.port,
      user: databaseConfig.username,
      password: databaseConfig.password,
      multipleStatements: true
    })

    // 检查数据库是否存在
    const [rows] = await connection.query(
      `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = '${databaseConfig.database}'`
    )

    // 如果数据库不存在，则创建
    if (rows.length === 0) {
      await connection.query(
        `CREATE DATABASE ${databaseConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      )
      console.log(`数据库 ${databaseConfig.database} 创建成功！`)
    } else {
      console.log(`数据库 ${databaseConfig.database} 已存在`)
    }

    // 关闭连接
    await connection.end()
  } catch (error) {
    console.error('创建数据库失败:', error)
    throw error
  }
}

// 立即执行数据库创建函数
createDatabaseIfNotExists().catch(error => {
  console.error('数据库初始化失败:', error)
})

// 创建Sequelize实例
const sequelize = new Sequelize(
  databaseConfig.database,
  databaseConfig.username,
  databaseConfig.password,
  {
    host: databaseConfig.host,
    port: databaseConfig.port,
    dialect: databaseConfig.dialect,
    define: databaseConfig.define,
    logging: false // 关闭日志
  }
)

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate()
    console.log('数据库连接成功！')
  } catch (error) {
    console.error('数据库连接失败:', error)
  }
}

// 导出Sequelize实例和相关函数
export {
  sequelize,
  Sequelize,
  testConnection
}
