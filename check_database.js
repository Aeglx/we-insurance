// 检查数据库中的业务记录
import mysql2 from 'mysql2/promise'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'we_insurance_system'
}

async function checkBusinessData() {
  try {
    // 创建数据库连接
    const connection = await mysql2.createConnection(dbConfig)
    console.log('数据库连接成功！')

    // 查询业务表的记录总数
    const [totalRows] = await connection.query('SELECT COUNT(*) AS total FROM business')
    console.log('业务表总记录数:', totalRows[0].total)

    // 查询今天的业务记录
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().slice(0, 19).replace('T', ' ')
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString().slice(0, 19).replace('T', ' ')
    
    const [todayRows] = await connection.query(
      'SELECT COUNT(*) AS todayCount FROM business WHERE inquiry_date BETWEEN ? AND ?',
      [startOfToday, endOfToday]
    )
    console.log('今日业务记录数:', todayRows[0].todayCount)

    // 查询本月的业务记录
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 19).replace('T', ' ')
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999).toISOString().slice(0, 19).replace('T', ' ')
    
    const [monthlyRows] = await connection.query(
      'SELECT COUNT(*) AS monthlyCount, SUM(premium_amount) AS monthlyPerformance FROM business WHERE inquiry_date BETWEEN ? AND ?',
      [startOfMonth, endOfMonth]
    )
    console.log('本月业务记录数:', monthlyRows[0].monthlyCount)
    console.log('本月业绩:', monthlyRows[0].monthlyPerformance)

    // 查询一些示例记录
    const [sampleRows] = await connection.query('SELECT * FROM business ORDER BY inquiry_date DESC LIMIT 5')
    console.log('\n最近5条业务记录:')
    sampleRows.forEach(row => {
      console.log(`ID: ${row.id}, 代理人ID: ${row.agent_id}, 保险类型: ${row.insurance_type}, 保费: ${row.premium_amount}, 询价日期: ${row.inquiry_date}, 成交状态: ${row.deal_status}`)
    })

    // 关闭连接
    await connection.end()
  } catch (error) {
    console.error('检查数据库数据失败:', error)
  }
}

// 执行检查
checkBusinessData()
