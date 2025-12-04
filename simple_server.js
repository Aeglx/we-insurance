// 简单Express服务器测试
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'

// 创建Express应用
const app = express()

// 配置中间件
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// 简单测试路由
app.get('/api/test', (req, res) => {
  console.log('收到测试请求')
  res.status(200).json({ message: 'Test route works!' })
})

// 仪表盘基础数据路由
app.get('/api/dashboard/basic', (req, res) => {
  console.log('收到仪表盘基础数据请求')
  res.status(200).json({
    code: 200,
    message: '获取仪表盘基础数据成功',
    data: {
      totalAmount: 100000,
      totalPolicies: 50,
      dailyTrend: [10, 15, 20, 25, 30, 35, 40]
    }
  })
})

// 启动服务器
const PORT = 3001
app.listen(PORT, () => {
  console.log(`简单测试服务器正在运行，端口: ${PORT}`)
})