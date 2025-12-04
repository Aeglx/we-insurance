// 后端服务器入口文件
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import mysql2 from 'mysql2/promise'
import { sequelize, Sequelize } from './src/database/connection.js'
import databaseService from './src/services/databaseService.js'
import backupService from './src/services/backupService.js'
import { User, Insurance, Business, InsuranceCategory, BusinessLevel, BusinessModel } from './src/database/models/index.js'
// 导入模块
import XLSXModule from 'xlsx';
const XLSX = XLSXModule.default || XLSXModule;
import multer from 'multer';
import fs from 'fs';

// 配置文件上传
const upload = multer({ dest: 'uploads/' });

// 加载环境变量
dotenv.config()

// 创建Express应用
const app = express()

// 配置中间件
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// 简单测试路由 - 直接在app实例上定义
app.get('/api/test', (req, res) => {
  console.log('收到测试请求')
  res.status(200).json({ message: 'Test route works!' })
})

// 仪表盘测试路由将在startServer函数内部通过dashboardRoutes注册

// 导入仪表盘路由模块
import dashboardRoutes from './src/routes/dashboardRoutes.js'

// 统计API路由 - 将在这里重新实现
app.get('/statistics', (req, res) => {
  // 统计API将在这里重新实现
  res.status(200).json({ message: 'Statistics route placeholder' })
})

// 数据库配置
const dbConfig = {
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'we_insurance_system',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  port: process.env.DB_PORT || 3306,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
}

// 创建数据库（如果不存在）
const createDatabaseIfNotExists = async () => {
  try {
    // 先创建一个不指定数据库的连接
    const connection = await mysql2.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
      multipleStatements: true
    })

    // 检查数据库是否存在
    const [rows] = await connection.query(
      `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = '${dbConfig.database}'`
    )

    // 如果数据库不存在，则创建
    if (rows.length === 0) {
      await connection.query(
        `CREATE DATABASE ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      )
      console.log(`数据库 ${dbConfig.database} 创建成功！`)
    } else {
      console.log(`数据库 ${dbConfig.database} 已存在`)
    }

    // 关闭连接
    await connection.end()
  } catch (error) {
    // 如果错误是数据库已存在，则忽略
    if (error.code === 'ER_DB_CREATE_EXISTS') {
      console.log(`数据库 ${dbConfig.database} 已存在，跳过创建`)
    } else {
      console.error('创建数据库失败:', error)
      throw error
    }
  }
}

// 初始化数据库和表
const initDatabase = async () => {
  try {
    // 先创建数据库（如果不存在）
    await createDatabaseIfNotExists()

    // 测试数据库连接
    await sequelize.authenticate()
    console.log('数据库连接成功！')

    // 自动创建表（如果不存在）
    await databaseService.init()

    console.log('数据库表初始化完成！')
    
    // 导入最新的数据库备份（非强制模式：只在表不存在时导入）
    // await backupService.importDatabase(true) - 注释掉强制导入，避免每次重启都删除数据
    await backupService.importDatabase(false)
    
    // 初始化备份服务
    await backupService.init()

    // 检查是否需要创建默认管理员用户
    const adminCount = await User.count({ where: { role: 'admin' } })
    if (adminCount === 0) {
      await User.create({
        username: 'admin',
        password: 'admin123', // 在实际项目中应该使用加密密码
        name: '系统管理员',
        role: 'admin',
        email: 'admin@example.com',
        phone: '13800138000',
        status: true
      })
      console.log('默认管理员用户创建成功！')
      console.log('用户名: admin, 密码: admin123')
    }

    // 检查是否需要创建默认险种分类
    const categoryCount = await InsuranceCategory.count()
    if (categoryCount === 0) {
      await InsuranceCategory.bulkCreate([
        { name: '个人意外险' },
        { name: '团体意外险' },
        { name: '健康险' },
        { name: '人寿险' },
        { name: '财产险' },
        { name: '学平险' }
      ])
      console.log('默认险种分类创建成功！')
    }

    // 检查是否需要创建默认业务等级
    const businessLevelCount = await BusinessLevel.count()
    if (businessLevelCount === 0) {
      await BusinessLevel.bulkCreate([
        { name: '一级业务', description: '最高级别业务，保费高，风险大' },
        { name: '二级业务', description: '中级业务，保费中等，风险中等' },
        { name: '三级业务', description: '初级业务，保费低，风险小' }
      ])
      console.log('默认业务等级创建成功！')
    }

    // 返回模型
    return { User, Insurance, Business, InsuranceCategory, BusinessModel }
  } catch (error) {
    console.error('数据库初始化失败:', error)
    throw error
  }
}

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// 新的简单测试路由
app.get('/api/new-test', (req, res) => {
  console.log('收到新测试请求')
  res.status(200).json({ message: 'New test route works!' })
})





// 初始化数据库
// 初始化数据库并获取模型
let db
const setupDatabase = async () => {
  try {
    db = await initDatabase()
    console.log('数据库自动创建和初始化完成！')
    return db
  } catch (error) {
    console.error('数据库初始化失败:', error)
    console.log('请确保MySQL服务已启动并配置正确。')
    throw error // 抛出错误，让startServer函数停止执行
  }
}

// 险种API接口
// 获取险种列表
app.get('/api/insurance/list', async (req, res) => {
  try {
    const { keyword, typeId, page = 1, pageSize = 20 } = req.query
    const where = {}
    
    if (keyword) {
      where[db.Sequelize.Op.or] = [
        { name: { [db.Sequelize.Op.like]: `%${keyword}%` } },
        { code: { [db.Sequelize.Op.like]: `%${keyword}%` } }
      ]
    }
    
    if (typeId) {
      where.category_id = typeId
    }
    
    // 计算分页参数
    const offset = (page - 1) * pageSize
    const limit = parseInt(pageSize)
    
    // 查询总数
    const total = await db.Insurance.count({ where })
    
    // 查询分页数据
    const insuranceList = await db.Insurance.findAll({
      where,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: db.InsuranceCategory,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      offset,
      limit
    })
    
    // 转换为前端需要的格式
    const formattedList = insuranceList.map(item => {
      const dataValues = item.dataValues
      return {
        id: dataValues.id,
        name: dataValues.name,
        code: dataValues.code,
        categoryId: dataValues.category_id,
        categoryName: dataValues.category?.name || '', // 使用关联查询到的分类名称
        description: dataValues.description,
        status: dataValues.status,
        createTime: dataValues.created_at
      }
    })
    
    res.json({ 
      code: 200, 
      message: '获取成功',
      data: {
        list: formattedList,
        total,
        page: parseInt(page),
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取险种列表失败:', error)
    res.status(500).json({ 
      code: 500, 
      message: '获取险种列表失败',
      error: error.message 
    })
  }
})

// 获取险种详情
app.get('/api/insurance/detail/:id', async (req, res) => {
  try {
    const { id } = req.params
    const insurance = await db.Insurance.findByPk(id)
    
    if (!insurance) {
      return res.status(404).json({ error: '险种不存在' })
    }
    
    res.json(insurance.dataValues)
  } catch (error) {
    console.error('获取险种详情失败:', error)
    res.status(500).json({ error: '获取险种详情失败' })
  }
})

// 添加险种
app.post('/api/insurance/add', async (req, res) => {
  try {
    const { name, code, category, description, status } = req.body
    
    // 创建新险种
    const newInsurance = await db.Insurance.create({
      name,
      code,
      category_id: category,
      description,
      status: status !== undefined ? status : true
    })
    
    res.json({ id: newInsurance.id, success: true })
  } catch (error) {
    console.error('添加险种失败:', error)
    res.status(500).json({ error: '添加险种失败' })
  }
})

// 更新险种
app.put('/api/insurance/update/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, code, category, description, status } = req.body
    
    // 查找险种
    const insurance = await db.Insurance.findByPk(id)
    
    if (!insurance) {
      return res.status(404).json({ error: '险种不存在' })
    }
    
    // 更新险种
    await insurance.update({
      name,
      code,
      category_id: category,
      description,
      status
    })
    
    res.json({ success: true })
  } catch (error) {
    console.error('更新险种失败:', error)
    res.status(500).json({ error: '更新险种失败' })
  }
})

// 删除险种
app.delete('/api/insurance/delete/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // 查找险种
    const insurance = await db.Insurance.findByPk(id)
    
    if (!insurance) {
      return res.status(404).json({ error: '险种不存在' })
    }
    
    // 删除险种
    await insurance.destroy()
    
    res.json({ success: true })
  } catch (error) {
    console.error('删除险种失败:', error)
    res.status(500).json({ error: '删除险种失败' })
  }
})

// 险种分类列表
app.get('/api/insurance/categories', async (req, res) => {
  try {
    const categories = await db.InsuranceCategory.findAll({
      order: [['id', 'ASC']]
    })
    res.json({ 
      code: 200, 
      message: '获取成功',
      data: categories.map(cat => cat.dataValues) 
    })
  } catch (error) {
    console.error('获取险种分类失败:', error)
    res.status(500).json({ 
      code: 500, 
      message: '获取险种分类失败',
      error: error.message 
    })
  }
})

// 用户登录接口
app.post('/api/user/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    // 查找用户
    const user = await db.User.findOne({
      where: { username }
    })
    
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' })
    }
    
    // 验证密码（在实际项目中应该使用加密密码）
    if (user.password !== password) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' })
    }
    
    // 生成token（简化版，实际项目中应该使用JWT）
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 返回用户信息和token
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        userInfo: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          email: user.email,
          phone: user.phone
        }
      }
    })
  } catch (error) {
    console.error('用户登录失败:', error)
    res.status(500).json({ code: 500, message: '登录失败' })
  }
})

// 获取用户信息接口
app.get('/api/user/info', async (req, res) => {
  try {
    // 从请求头获取token
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ code: 401, message: '未授权' })
    }
    
    // 在实际项目中，应该验证token的有效性
    // 这里简化处理，直接返回默认管理员信息
    const user = await db.User.findOne({
      where: { role: 'admin' }
    })
    
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户不存在' })
    }
    
    res.json({
      code: 200,
      message: '获取用户信息成功',
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone
      }
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    res.status(500).json({ code: 500, message: '获取用户信息失败' })
  }
})

// 新增险种分类
app.post('/api/insurance/category/add', async (req, res) => {
  try {
    const { name } = req.body
    if (!name) {
      return res.status(400).json({ error: '分类名称不能为空' })
    }
    const category = await db.InsuranceCategory.create({ name })
    res.json({ code: 200, message: '分类添加成功', data: category.dataValues })
  } catch (error) {
    console.error('新增险种分类失败:', error)
    res.status(500).json({ error: '新增险种分类失败' })
  }
})

// 更新险种分类
app.put('/api/insurance/category/update/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body
    if (!name) {
      return res.status(400).json({ error: '分类名称不能为空' })
    }
    const [updated] = await db.InsuranceCategory.update({ name }, { where: { id } })
    if (updated) {
      res.json({ code: 200, message: '分类更新成功' })
    } else {
      res.status(404).json({ error: '分类不存在' })
    }
  } catch (error) {
    console.error('更新险种分类失败:', error)
    res.status(500).json({ error: '更新险种分类失败' })
  }
})

// 删除险种分类
app.delete('/api/insurance/category/delete/:id', async (req, res) => {
  try {
    const { id } = req.params
    // 检查是否有险种使用该分类
    const insuranceCount = await db.Insurance.count({ where: { category_id: id } })
    if (insuranceCount > 0) {
      return res.status(400).json({ error: '该分类正在被险种使用，无法删除' })
    }
    const deleted = await db.InsuranceCategory.destroy({ where: { id } })
    if (deleted) {
      res.json({ code: 200, message: '分类删除成功' })
    } else {
      res.status(404).json({ error: '分类不存在' })
    }
  } catch (error) {
    console.error('删除险种分类失败:', error)
    res.status(500).json({ error: '删除险种分类失败' })
  }
})

// 获取用户列表接口
app.get('/api/user/list', async (req, res) => {
  try {
    const { keyword, role, status } = req.query
    const where = {}
    
    if (keyword) {
      where[db.Sequelize.Op.or] = [
        { username: { [db.Sequelize.Op.like]: `%${keyword}%` } },
        { name: { [db.Sequelize.Op.like]: `%${keyword}%` } },
        { email: { [db.Sequelize.Op.like]: `%${keyword}%` } },
        { phone: { [db.Sequelize.Op.like]: `%${keyword}%` } }
      ]
    }
    
    if (role) {
      where.role = role
    }
    
    if (status !== undefined) {
      where.status = status === 'true' || status === true
    }
    
    const userList = await db.User.findAll({
      where,
      order: [['created_at', 'DESC']]
    })
    
    // 转换为前端需要的格式
    const formattedList = userList.map(item => {
      const dataValues = item.dataValues
      return {
        id: dataValues.id,
        username: dataValues.username,
        name: dataValues.name,
        role: dataValues.role,
        email: dataValues.email,
        phone: dataValues.phone,
        status: dataValues.status,
        createTime: dataValues.created_at
      }
    })
    
    res.json({ code: 200, message: '获取成功', data: formattedList })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    res.status(500).json({ error: '获取用户列表失败' })
  }
})

// 获取出单员列表API
app.get('/api/underwriter/list', async (req, res) => {
  try {
    const { keyword, status } = req.query
    const where = {
      role: 'underwriter' // 只查询角色为出单员的用户
    }
    
    if (keyword) {
      where[db.Sequelize.Op.or] = [
        { username: { [db.Sequelize.Op.like]: `%${keyword}%` } },
        { name: { [db.Sequelize.Op.like]: `%${keyword}%` } },
        { email: { [db.Sequelize.Op.like]: `%${keyword}%` } },
        { phone: { [db.Sequelize.Op.like]: `%${keyword}%` } }
      ]
    }
    
    if (status !== undefined) {
      where.status = status === 'true' || status === true
    }
    
    const underwriterList = await db.User.findAll({
      where,
      order: [['created_at', 'DESC']]
    })
    
    // 转换为前端需要的格式
    const formattedList = underwriterList.map(item => {
      const dataValues = item.dataValues
      return {
        id: dataValues.id,
        username: dataValues.username,
        name: dataValues.name,
        role: dataValues.role,
        email: dataValues.email,
        phone: dataValues.phone,
        status: dataValues.status,
        createTime: dataValues.created_at
      }
    })
    
    res.json({ data: formattedList, total: formattedList.length })
  } catch (error) {
    console.error('获取出单员列表失败:', error)
    res.status(500).json({ error: '获取出单员列表失败' })
  }
})

// 获取代理人列表接口
app.get('/api/agent/list', async (req, res) => {
  try {
    const { keyword, status, page = 1, pageSize = 20 } = req.query
    const where = {
      role: 'agent'
    }
    
    if (keyword) {
      where[db.Sequelize.Op.or] = [
        { username: { [db.Sequelize.Op.like]: `%${keyword}%` } },
        { name: { [db.Sequelize.Op.like]: `%${keyword}%` } },
        { email: { [db.Sequelize.Op.like]: `%${keyword}%` } },
        { phone: { [db.Sequelize.Op.like]: `%${keyword}%` } }
      ]
    }
    
    if (status !== undefined) {
      where.status = status === 'true' || status === true
    }
    
    // 计算分页参数
    const offset = (page - 1) * pageSize
    const limit = parseInt(pageSize)
    
    // 查询总数
    const total = await db.User.count({ where })
    
    // 查询分页数据
    const agentList = await db.User.findAll({
      where,
      order: [['created_at', 'DESC']],
      offset,
      limit
    })
    
    // 转换为前端需要的格式
    const formattedList = agentList.map(item => {
      const dataValues = item.dataValues
      return {
        id: dataValues.id,
        username: dataValues.username,
        name: dataValues.name,
        role: dataValues.role,
        email: dataValues.email,
        phone: dataValues.phone,
        department: dataValues.department || '',
        status: dataValues.status,
        createTime: dataValues.created_at
      }
    })
    
    res.json({ 
      code: 200, 
      message: '获取成功',
      data: {
        list: formattedList,
        total,
        page: parseInt(page),
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取代理人列表失败:', error)
    res.status(500).json({ 
      code: 500, 
      message: '获取代理人列表失败',
      error: error.message 
    })
  }
})

// 添加代理人接口
app.post('/api/agent/add', async (req, res) => {
  try {
    const { name, phone, status, department } = req.body
    
    // 自动生成用户名：使用姓名的拼音首字母 + 时间戳后6位
    const timestamp = Date.now().toString().slice(-6)
    // 简单的拼音首字母生成（仅支持中文）
    const getPinyinFirstLetter = (str) => {
      return str.replace(/[\u4e00-\u9fa5]/g, function (char) {
        return char.charCodeAt(0).toString(16).slice(-4)
      }).slice(0, 3).toUpperCase()
    }
    const username = `${getPinyinFirstLetter(name)}${timestamp}`
    
    // 自动生成密码：使用默认密码 'agent123'
    const password = 'agent123'
    
    // 创建新代理人（role为'agent'的用户）
    const newAgent = await db.User.create({
      username,
      name,
      password,
      phone,
      role: 'agent',
      status: status !== undefined ? status : true,
      department
    })
    
    res.json({ id: newAgent.id, success: true })
  } catch (error) {
    console.error('添加代理人失败:', error)
    res.status(500).json({ error: '添加代理人失败' })
  }
})

// 获取代理人详情接口
app.get('/api/agent/detail/:id', async (req, res) => {
  try {
    const { id } = req.params
    const agent = await db.User.findOne({
      where: {
        id,
        role: 'agent'
      }
    })
    
    if (!agent) {
      return res.status(404).json({ error: '代理人不存在' })
    }
    
    res.json(agent.dataValues)
  } catch (error) {
    console.error('获取代理人详情失败:', error)
    res.status(500).json({ error: '获取代理人详情失败' })
  }
})

// 更新代理人接口
app.put('/api/agent/update/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, password, email, phone, status, department } = req.body
    
    // 查找代理人
    const agent = await db.User.findOne({
      where: {
        id,
        role: 'agent'
      }
    })
    
    if (!agent) {
      return res.status(404).json({ error: '代理人不存在' })
    }
    
    // 更新代理人信息 - 只更新实际提供的字段
    const updateData = {}
    
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (status !== undefined) updateData.status = status
    if (department !== undefined) updateData.department = department
    
    // 只有在提供了密码时才更新密码
    if (password) {
      updateData.password = password
    }
    
    await agent.update(updateData)
    
    res.json({ success: true })
  } catch (error) {
    console.error('更新代理人失败:', error)
    res.status(500).json({ error: '更新代理人失败' })
  }
})

// 删除代理人接口
app.delete('/api/agent/delete/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // 查找代理人
    const agent = await db.User.findOne({
      where: {
        id,
        role: 'agent'
      }
    })
    
    if (!agent) {
      return res.status(404).json({ error: '代理人不存在' })
    }
    
    // 删除代理人
    await agent.destroy()
    
    res.json({ success: true })
  } catch (error) {
    console.error('删除代理人失败:', error)
    res.status(500).json({ error: '删除代理人失败' })
  }
})

// 批量删除代理人接口
app.delete('/api/agent/batch-delete', async (req, res) => {
  try {
    const { ids } = req.body
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: '请选择要删除的代理人' })
    }
    
    // 批量删除代理人
    await db.User.destroy({
      where: {
        id: ids,
        role: 'agent'
      }
    })
    
    res.json({ success: true })
  } catch (error) {
    console.error('批量删除代理人失败:', error)
    res.status(500).json({ error: '批量删除代理人失败' })
  }
})

// 批量导入代理人接口
app.post('/api/agent/batch-import', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ code: 400, message: '请上传文件' });
    }

    // 读取Excel文件
    const workbook = XLSX.readFile(file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // 处理导入数据
    const importedAgents = [];
    for (const item of data) {
      // 验证必填字段（使用中文列名）
      if (!item['姓名'] || !item['联系电话'] || !item['所属部门']) {
        continue;
      }

      // 自动生成用户名：使用姓名的拼音首字母 + 时间戳后6位
      const timestamp = Date.now().toString().slice(-6);
      // 简单的拼音首字母生成（仅支持中文）
      const getPinyinFirstLetter = (str) => {
        return str.replace(/[\u4e00-\u9fa5]/g, function (char) {
          return char.charCodeAt(0).toString(16).slice(-4)
        }).slice(0, 3).toUpperCase()
      }
      const username = `${getPinyinFirstLetter(item['姓名'])}${timestamp}`;

      // 自动生成密码：使用默认密码 'agent123'
      const password = 'agent123';

      // 创建新代理人（role为'agent'的用户）
      const newAgent = await db.User.create({
        username,
        name: item['姓名'],
        password,
        phone: item['联系电话'],
        role: 'agent',
        status: item['状态（true/false）'] !== undefined ? item['状态（true/false）'] : true,
        department: item['所属部门']
      });

      importedAgents.push(newAgent);
    }

    // 删除临时文件
    fs.unlinkSync(file.path);

    res.json({ code: 200, message: `成功导入${importedAgents.length}条数据`, data: { count: importedAgents.length } });
  } catch (error) {
    console.error('批量导入代理人失败:', error);
    res.status(500).json({ error: '批量导入代理人失败' });
  }
});

// 下载代理人导入模板接口
app.get('/api/agent/download-template', async (req, res) => {
  try {
    // 创建Excel工作簿
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['姓名', '联系电话', '所属部门', '状态（true/false）'],
      ['示例姓名', '13800138000', '直客', 'true'],
      ['张三', '13900139000', '渠道', 'true'],
      ['李四', '13700137000', '合作', 'false']
    ]);

    XLSX.utils.book_append_sheet(workbook, worksheet, '代理人模板');

    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=agent_import_template.xlsx');

    // 写入响应
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    res.send(wbout);
  } catch (error) {
    console.error('下载模板失败:', error);
    res.status(500).json({ error: '下载模板失败' });
  }
});

// 搜索代理人接口
app.get('/api/agent/search', async (req, res) => {
  try {
    const { keyword } = req.query
    
    if (!keyword) {
      return res.json({ list: [], total: 0 })
    }
    
    const where = {
      role: 'agent',
      [db.Sequelize.Op.or]: [
        { username: { [db.Sequelize.Op.like]: `%${keyword}%` } },
        { name: { [db.Sequelize.Op.like]: `%${keyword}%` } },
        { email: { [db.Sequelize.Op.like]: `%${keyword}%` } },
        { phone: { [db.Sequelize.Op.like]: `%${keyword}%` } }
      ]
    }
    
    const agentList = await db.User.findAll({
      where,
      order: [['created_at', 'DESC']]
    })
    
    // 转换为前端需要的格式
    const formattedList = agentList.map(item => {
      const dataValues = item.dataValues
      return {
        id: dataValues.id,
        username: dataValues.username,
        name: dataValues.name,
        role: dataValues.role,
        email: dataValues.email,
        phone: dataValues.phone,
        department: dataValues.department || '',
        status: dataValues.status,
        createTime: dataValues.created_at
      }
    })
    
    res.json({ code: 200, message: '搜索成功', data: formattedList })
  } catch (error) {
    console.error('搜索代理人失败:', error)
    res.status(500).json({ error: '搜索代理人失败' })
  }
})

// 业务等级相关API路由

// 获取业务等级列表
app.get('/api/business-level/list', async (req, res) => {
  try {
    const businessLevelList = await db.BusinessLevel.findAll({
      order: [['id', 'ASC']]
    })
    
    // 转换为前端需要的格式
    const formattedList = businessLevelList.map(item => {
      const dataValues = item.dataValues
      return {
        id: dataValues.id,
        name: dataValues.name,
        description: dataValues.description || '',
        status: dataValues.status,
        createTime: dataValues.created_at
      }
    })
    
    res.json({ list: formattedList, total: formattedList.length })
  } catch (error) {
    console.error('获取业务等级列表失败:', error)
    res.status(500).json({ error: '获取业务等级列表失败' })
  }
})

// 获取业务等级详情
app.get('/api/business-level/detail/:id', async (req, res) => {
  try {
    const { id } = req.params
    const businessLevel = await db.BusinessLevel.findByPk(id)
    
    if (!businessLevel) {
      return res.status(404).json({ error: '业务等级不存在' })
    }
    
    const dataValues = businessLevel.dataValues
    res.json({
      id: dataValues.id,
      name: dataValues.name,
      description: dataValues.description || '',
      status: dataValues.status,
      createTime: dataValues.created_at
    })
  } catch (error) {
    console.error('获取业务等级详情失败:', error)
    res.status(500).json({ error: '获取业务等级详情失败' })
  }
})

// 添加业务等级
app.post('/api/business-level/add', async (req, res) => {
  try {
    const { name, description, status } = req.body
    
    // 验证必填字段
    if (!name) {
      return res.status(400).json({ error: '业务等级名称不能为空' })
    }
    
    // 检查是否已存在同名业务等级
    const existingLevel = await db.BusinessLevel.findOne({
      where: { name }
    })
    
    if (existingLevel) {
      return res.status(400).json({ error: '业务等级名称已存在' })
    }
    
    // 创建新的业务等级
    const newLevel = await db.BusinessLevel.create({
      name,
      description: description || '',
      status: status !== undefined ? status : true
    })
    
    res.json({
      code: 200,
      message: '业务等级添加成功',
      data: {
        id: newLevel.id,
        name: newLevel.name,
        description: newLevel.description,
        status: newLevel.status
      }
    })
  } catch (error) {
    console.error('添加业务等级失败:', error)
    res.status(500).json({ error: '添加业务等级失败' })
  }
})

// 更新业务等级
app.put('/api/business-level/update/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, status } = req.body
    
    // 验证必填字段
    if (!name) {
      return res.status(400).json({ error: '业务等级名称不能为空' })
    }
    
    // 查找业务等级
    const businessLevel = await db.BusinessLevel.findByPk(id)
    
    if (!businessLevel) {
      return res.status(404).json({ error: '业务等级不存在' })
    }
    
    // 检查是否已存在同名业务等级（排除当前等级）
    const existingLevel = await db.BusinessLevel.findOne({
      where: {
        name,
        id: { [db.Sequelize.Op.ne]: id }
      }
    })
    
    if (existingLevel) {
      return res.status(400).json({ error: '业务等级名称已存在' })
    }
    
    // 更新业务等级
    await businessLevel.update({
      name,
      description: description || '',
      status: status !== undefined ? status : businessLevel.status
    })
    
    res.json({
      code: 200,
      message: '业务等级更新成功',
      data: {
        id: businessLevel.id,
        name: businessLevel.name,
        description: businessLevel.description,
        status: businessLevel.status
      }
    })
  } catch (error) {
    console.error('更新业务等级失败:', error)
    res.status(500).json({ error: '更新业务等级失败' })
  }
})

// 删除业务等级
app.delete('/api/business-level/delete/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // 查找业务等级
    const businessLevel = await db.BusinessLevel.findByPk(id)
    
    if (!businessLevel) {
      return res.status(404).json({ error: '业务等级不存在' })
    }
    
    // 删除业务等级
    await businessLevel.destroy()
    
    res.json({
      code: 200,
      message: '业务等级删除成功'
    })
  } catch (error) {
    console.error('删除业务等级失败:', error)
    res.status(500).json({ error: '删除业务等级失败' })
  }
})

// 业务相关API路由

// 获取统计概览数据
app.get('/api/statistics/overview', async (req, res) => {
  try {
    const params = { ...req.query };
    const statistics = await BusinessModel.getStatistics(params);
    
    // 生成增长率数据（模拟，实际项目中应从数据库查询上期数据）
    const growthRates = {
      inquiryGrowth: (Math.random() * 20 - 5).toFixed(1),
      dealGrowth: (Math.random() * 20 - 5).toFixed(1),
      conversionRateGrowth: (Math.random() * 10 - 5).toFixed(1),
      totalAmountGrowth: (Math.random() * 25 - 5).toFixed(1)
    };
    
    res.status(200).json({
      code: 200,
      message: '获取统计概览数据成功',
      data: {
        ...statistics,
        ...growthRates
      }
    });
  } catch (error) {
    console.error('获取统计概览数据失败:', error);
    res.status(500).json({ code: 500, message: '获取统计概览数据失败' });
  }
});

// 获取按出单员统计数据
app.get('/api/statistics/underwriter', async (req, res) => {
  try {
    // 这里可以扩展getStatistics方法或创建新方法来获取按出单员统计的数据
    const params = { ...req.query };
    
    // 使用现有的getBusinessListWithRelations方法查询所有业务记录
    const businesses = await BusinessModel.getBusinessListWithRelations(params);
    
    // 按出单员分组统计
    const underwriterStats = {};
    businesses.forEach(business => {
      const underwriterName = business.Underwriter?.name || '未知';
      if (!underwriterStats[underwriterName]) {
        underwriterStats[underwriterName] = {
          inquiryCount: 0,
          dealCount: 0,
          totalAmount: 0
        };
      }
      underwriterStats[underwriterName].inquiryCount++;
      if (business.deal_status === 'success') {
        underwriterStats[underwriterName].dealCount++;
        underwriterStats[underwriterName].totalAmount += business.premium_amount;
      }
    });
    
    // 转换为数组格式
    const result = Object.keys(underwriterStats).map(name => ({
      name,
      ...underwriterStats[name]
    }));
    
    res.status(200).json({ code: 200, message: '获取按出单员统计数据成功', data: result });
  } catch (error) {
    console.error('获取按出单员统计数据失败:', error);
    res.status(500).json({ code: 500, message: '获取按出单员统计数据失败' });
  }
});

// 获取按险种统计数据
app.get('/api/statistics/insurance', async (req, res) => {
  try {
    const params = { ...req.query };
    const businesses = await BusinessModel.getBusinessListWithRelations(params);
    
    // 按险种分组统计
    const insuranceStats = {};
    businesses.forEach(business => {
      const insuranceName = business.Insurance?.name || '未知';
      if (!insuranceStats[insuranceName]) {
        insuranceStats[insuranceName] = {
          inquiryCount: 0,
          dealCount: 0,
          totalAmount: 0
        };
      }
      insuranceStats[insuranceName].inquiryCount++;
      if (business.deal_status === 'success') {
        insuranceStats[insuranceName].dealCount++;
        insuranceStats[insuranceName].totalAmount += business.premium_amount;
      }
    });
    
    // 转换为数组格式
    const result = Object.keys(insuranceStats).map(name => ({
      name,
      ...insuranceStats[name]
    }));
    
    res.status(200).json({ code: 200, message: '获取按险种统计数据成功', data: result });
  } catch (error) {
    console.error('获取按险种统计数据失败:', error);
    res.status(500).json({ code: 500, message: '获取按险种统计数据失败' });
  }
});

// 获取时间趋势统计数据
app.get('/api/statistics/time-trend', async (req, res) => {
  try {
    const { timeType, timeRange } = req.query;
    const params = { ...req.query };
    const businesses = await BusinessModel.getBusinessListWithRelations(params);
    
    // 按时间分组统计
    const timeStats = {};
    businesses.forEach(business => {
      let timeKey;
      const date = new Date(business.inquiry_date);
      
      // 根据时间类型生成不同的时间键
      switch (timeType) {
        case 'day':
          timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          break;
        case 'week':
          const weekNumber = Math.ceil((date.getDate() + date.getDay()) / 7);
          timeKey = `第${weekNumber}周`;
          break;
        case 'month':
          timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
      
      if (!timeStats[timeKey]) {
        timeStats[timeKey] = {
          inquiryCount: 0,
          dealCount: 0
        };
      }
      timeStats[timeKey].inquiryCount++;
      if (business.deal_status === 'success') {
        timeStats[timeKey].dealCount++;
      }
    });
    
    // 转换为数组格式并按时间排序
    const result = Object.keys(timeStats)
      .sort()
      .map(timeKey => ({
        time: timeKey,
        ...timeStats[timeKey]
      }));
    
    res.status(200).json({ code: 200, message: '获取时间趋势统计数据成功', data: result });
  } catch (error) {
    console.error('获取时间趋势统计数据失败:', error);
    res.status(500).json({ code: 500, message: '获取时间趋势统计数据失败' });
  }
});

// 获取仪表盘基础指标数据
app.get('/api/dashboard/basic', async (req, res) => {
  try {
    const params = { ...req.query };
    const statistics = await BusinessModel.getStatistics(params);
    
    // 生成增长率数据（模拟，实际项目中应从数据库查询上期数据）
    const growthRates = {
      todayInquiryGrowth: (Math.random() * 20 - 5).toFixed(1),
      todayDealGrowth: (Math.random() * 20 - 5).toFixed(1),
      monthlyPerformanceGrowth: (Math.random() * 25 - 5).toFixed(1)
    };
    
    res.status(200).json({
      ...statistics,
      ...growthRates
    });
  } catch (error) {
    console.error('获取仪表盘基础指标数据失败:', error);
    res.status(500).json({ error: '获取仪表盘基础指标数据失败' });
  }
});

// 获取仪表盘业务趋势数据
app.get('/api/dashboard/trend', async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    const params = { ...req.query };
    const businesses = await BusinessModel.getBusinessListWithRelations(params);
    
    // 按时间分组统计
    const timeStats = {};
    let dateFormat;
    let sortFunction;
    
    // 根据时间范围设置不同的日期格式和排序函数
    switch (timeRange) {
      case 'week':
        dateFormat = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        sortFunction = (a, b) => new Date(a) - new Date(b);
        break;
      case 'month':
        dateFormat = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        sortFunction = (a, b) => new Date(a) - new Date(b);
        break;
      case 'year':
        dateFormat = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        sortFunction = (a, b) => {
          const [yearA, monthA] = a.split('-').map(Number);
          const [yearB, monthB] = b.split('-').map(Number);
          return yearA - yearB || monthA - monthB;
        };
        break;
      default:
        dateFormat = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        sortFunction = (a, b) => new Date(a) - new Date(b);
    }
    
    businesses.forEach(business => {
      const date = new Date(business.inquiry_date);
      const timeKey = dateFormat(date);
      
      if (!timeStats[timeKey]) {
        timeStats[timeKey] = {
          inquiryCount: 0,
          dealCount: 0
        };
      }
      timeStats[timeKey].inquiryCount++;
      if (business.deal_status === 'success') {
        timeStats[timeKey].dealCount++;
      }
    });
    
    // 转换为数组格式并按时间排序
    const result = Object.keys(timeStats)
      .sort(sortFunction)
      .map(timeKey => ({
        time: timeKey,
        ...timeStats[timeKey]
      }));
    
    res.status(200).json({
      timeDimension: timeRange,
      data: result
    });
  } catch (error) {
    console.error('获取仪表盘业务趋势数据失败:', error);
    res.status(500).json({ error: '获取仪表盘业务趋势数据失败' });
  }
});

// 获取最近业务记录
app.get('/api/business/recent', async (req, res) => {
  try {
    const params = req.query;
    
    // 验证agentId是否为数字
    if (params.agentId && isNaN(Number(params.agentId))) {
      return res.status(400).json({ code: 400, message: '无效的代理人ID' });
    }
    
    // 调用模型方法获取最近业务
    const recentBusiness = await BusinessModel.getRecentBusiness(params);
    
    // 格式化响应数据
    const formattedData = recentBusiness.map(item => ({
      id: item.id,
      agentName: item.agent?.name || '未知代理人',
      insuranceName: item.insurance?.name || '未知险种',
      customerName: item.customer_name,
      amount: item.inquiry_amount,
      status: item.deal_status,
      date: item.inquiry_date.toISOString().split('T')[0]
    }));
    
    // 发送响应
    return res.status(200).json({
      code: 200,
      message: '获取最近业务记录成功',
      data: formattedData
    });
  } catch (error) {
    console.error('获取最近业务记录失败:', error);
    return res.status(500).json({
      code: 500,
      message: '获取最近业务记录失败',
      error: error.message
    });
  }
});

// 获取业务列表
app.get('/api/business/list', async (req, res) => {
  console.log('业务列表API被调用！')
  console.log('请求参数:', req.query)
  try {
    const params = req.query
    
    // 构建查询条件
    const whereClause = {}
    
    if (params.agentId) {
      whereClause.agent_id = params.agentId
    }
    
    if (params.underwriterId) {
      whereClause.underwriter_id = params.underwriterId
    }
    
    if (params.insuranceTypeId) {
      whereClause.insurance_type_id = params.insuranceTypeId
    }
    
    if (params.specificInsuranceId) {
      whereClause.specific_insurance_id = params.specificInsuranceId
    }
    
    if (params.dealStatus) {
      whereClause.deal_status = params.dealStatus
    }
    
    if (params.status) {
      whereClause.status = params.status
    }
    
    if (params.customerName) {
      whereClause.customer_name = { [Sequelize.Op.like]: `%${params.customerName}%` }
    }
    
    if (params.minAmount && params.maxAmount) {
      whereClause.inquiry_amount = {
        [Sequelize.Op.between]: [params.minAmount, params.maxAmount]
      }
    } else if (params.minAmount) {
      whereClause.inquiry_amount = { [Sequelize.Op.gte]: params.minAmount }
    } else if (params.maxAmount) {
      whereClause.inquiry_amount = { [Sequelize.Op.lte]: params.maxAmount }
    }
    
    if (params.keyword) {
      whereClause[Sequelize.Op.or] = [
        { policy_number: { [Sequelize.Op.like]: `%${params.keyword}%` } },
        { customer_name: { [Sequelize.Op.like]: `%${params.keyword}%` } }
      ]
    }
    
    if (params.startDate && params.endDate) {
      whereClause.inquiry_date = {
        [Sequelize.Op.between]: [params.startDate, params.endDate]
      }
    } else if (params.startDate) {
      whereClause.inquiry_date = { [Sequelize.Op.gte]: params.startDate }
    } else if (params.endDate) {
      whereClause.inquiry_date = { [Sequelize.Op.lte]: params.endDate }
    }
    
    // 分页参数
    const page = parseInt(params.page) || 1
    const pageSize = parseInt(params.pageSize) || 10
    const offset = (page - 1) * pageSize
    
    // 获取业务列表
    const businessList = await db.Business.findAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
      order: [['inquiry_date', 'DESC']],
      include: [
        { model: db.User, as: 'agent', attributes: ['id', 'name', 'username'] },
        { model: db.User, as: 'underwriter', attributes: ['id', 'name', 'username'] },
        { model: db.Insurance, as: 'insurance', attributes: ['id', 'name', 'code', 'category_id'] }
      ]
    })
    
    // 获取总记录数
    const total = await db.Business.count(whereClause)
    
    // 成交状态映射
    const dealStatusMap = {
      'pending': '跟进中',
      'success': '已成交',
      'failed': '已失效'
    }

    // 转换为前端需要的格式
    const formattedList = businessList.map(item => {
      const dataValues = item.dataValues || item
      return {
        id: dataValues.id,
        agentId: dataValues.agent_id,
        agentName: dataValues.agent?.name || '',
        underwriterId: dataValues.underwriter_id,
        underwriterName: dataValues.underwriter?.name || '',
        insuranceId: dataValues.insurance_id,
        specificInsuranceId: dataValues.specific_insurance_id,
        insuranceTypeId: dataValues.insurance_type_id,
        insuranceName: dataValues.insurance?.name || '',
        policyNumber: dataValues.policy_number || '',
        insuredName: dataValues.customer_name || '',
        customerPhone: dataValues.customer_phone || '',
        customerEmail: dataValues.customer_email || '',
        clientType: dataValues.client_type || '',
        amountInsured: parseFloat(dataValues.coverage_amount) || 0,
        premium: parseFloat(dataValues.premium_amount) || 0,
        inquiryAmount: parseFloat(dataValues.inquiry_amount) || 0,
        registrationDate: dataValues.inquiry_date,
        status: dataValues.status,
        dealStatus: dealStatusMap[dataValues.deal_status] || dataValues.deal_status,
        followUpRemark: dataValues.follow_up_remark,
        reminderTime: dataValues.reminder_time,
        dealTime: dataValues.deal_time,
        remark: dataValues.remarks || '',
        createTime: dataValues.created_at,
        updateTime: dataValues.updated_at,
        created_at: dataValues.created_at
      }
    })
    
    // 返回前端期望的数据结构
    res.json({ 
      code: 200,
      message: '获取成功',
      data: {
        records: formattedList,
        total: total,
        page: page,
        pageSize: pageSize,
        pages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('获取业务列表失败:', error)
    res.status(500).json({ 
      code: 500,
      message: '获取业务列表失败',
      error: error.message 
    })
  }
})

// 添加业务记录
app.post('/api/business/add', async (req, res) => {
  console.log('添加业务记录API被调用！')
  console.log('请求参数:', req.body)
  try {
    const data = req.body
    
    // 根据客户类型确定客户名称，同时兼容test-api.js的数据结构
    let customerName = ''
    if (data.customerName) {
      // 如果存在customerName字段（来自test-api.js），直接使用
      customerName = data.customerName
    } else if (data.clientType === 'personal') {
      customerName = data.clientName
    } else if (data.clientType === 'company') {
      customerName = data.companyName
    } else if (data.clientType === 'vehicle') {
      customerName = data.plateNumber
    }
    
    // 转换前端字段名到数据库字段名，并提供默认值
    const businessData = {
      agent_id: data.agentId,
      underwriter_id: data.underwriterId,
      insurance_id: data.specificInsuranceId,
      insurance_type_id: data.insuranceTypeId,
      specific_insurance_id: data.specificInsuranceId,
      customer_name: customerName,
      customer_phone: data.customerPhone || '13800138000',
      customer_email: data.customerEmail || '',
      client_type: data.clientType,
      personal_name: data.personalName || '',
      company_name: data.companyName || '',
      plate_number: data.plateNumber || '',
      inquiry_amount: parseFloat(data.inquiryAmount) || 0,
      deal_status: data.dealStatus || 'pending',
      reminder_time: data.reminderTime ? new Date(data.reminderTime) : null,
      policy_number: data.policyNumber || '',
      deal_time: data.dealTime ? new Date(data.dealTime) : null,
      follow_up_remark: data.followUpRemark || '',
      
      // 兼容原有字段（如果需要）
      premium_amount: parseFloat(data.inquiryAmount) || 0,
      coverage_amount: parseFloat(data.inquiryAmount) || 0,
      start_date: new Date(),
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: data.dealStatus || 'pending',
      inquiry_date: new Date(),
      remarks: data.followUpRemark || ''
    }
    
    // 创建业务记录
    const business = await db.Business.create(businessData)

    // 记录操作日志
    try {
      await db.OperationLog.create({
        operator_id: req.body.operatorId || 1, // 默认管理员ID
        operator_name: req.body.operatorName || '系统管理员', // 默认管理员姓名
        operation_type: 'create',
        operation_content: `创建了业务记录，客户名称：${customerName}`,
        ip_address: req.ip,
        module: 'business',
        related_id: business.id
      })
    } catch (logError) {
      console.error('记录操作日志失败:', logError)
    }
    
    // 返回前端期望的数据结构
    res.json({
      code: 200,
      message: '添加成功',
      data: business
    })
  } catch (error) {
    console.error('添加业务记录失败:', error)
    res.status(500).json({
      code: 500,
      message: '添加业务记录失败',
      error: error.message
    })
  }
})



// 获取业务操作日志
app.get('/api/business/logs/:id', async (req, res) => {
  console.log('获取业务操作日志API被调用！')
  console.log('请求参数:', req.params)
  try {
    const { id } = req.params
    
    // 查询该业务的操作日志
    const logs = await db.OperationLog.findAll({
      where: { related_id: id },
      order: [['operation_time', 'DESC']]
    })
    
    // 格式化日志数据
    const formattedLogs = logs.map(log => ({
      operationTime: log.operation_time,
      operator: log.operator_name,
      operationType: log.operation_type,
      operationContent: log.operation_content
    }))
    
    // 返回前端期望的数据结构
    res.json({
      code: 200,
      message: '获取操作日志成功',
      data: formattedLogs
    })
  } catch (error) {
    console.error('获取业务操作日志失败:', error)
    res.status(500).json({
      code: 500,
      message: '获取操作日志失败',
      error: error.message
    })
  }
})

// 获取业务详情
app.get('/api/business/detail/:id', async (req, res) => {
  console.log('获取业务详情API被调用！')
  console.log('请求参数:', req.params)
  try {
    const { id } = req.params
    
    // 获取业务详情
    const business = await db.Business.findOne({
      where: { id },
      include: [
        { model: db.User, as: 'agent', attributes: ['id', 'name', 'username'] },
        { model: db.User, as: 'underwriter', attributes: ['id', 'name', 'username'] },
        { model: db.Insurance, as: 'insurance', attributes: ['id', 'name', 'code', 'category_id'] },
        { model: db.InsuranceCategory, as: 'category', attributes: ['id', 'name'] }
      ]
    })
    
    if (!business) {
      return res.status(404).json({ 
        code: 404,
        message: '业务记录不存在'
      })
    }
    
    // 成交状态映射
    const dealStatusMap = {
      'pending': '跟进中',
      'success': '已成交',
      'failed': '已失效'
    }
    
    // 转换为前端需要的格式
    const formattedData = {
      id: business.id,
      agentId: business.agent_id,
      agentName: business.agent?.name || '',
      underwriterId: business.underwriter_id,
      underwriterName: business.underwriter?.name || '',
      insuranceId: business.insurance_id,
      specificInsuranceId: business.specific_insurance_id,
      insuranceTypeId: business.insurance_type_id,
      insuranceName: business.insurance?.name || '',
      policyNumber: business.policy_number || '',
      customerName: business.customer_name || '',
      customerPhone: business.customer_phone || '',
      customerEmail: business.customer_email || '',
      clientType: business.client_type || '',
      personalName: business.personal_name || '',
      companyName: business.company_name || '',
      plateNumber: business.plate_number || '',
      amountInsured: parseFloat(business.coverage_amount) || 0,
      premium: parseFloat(business.premium_amount) || 0,
      inquiryAmount: parseFloat(business.inquiry_amount) || 0,
      registrationDate: business.inquiry_date,
      status: business.status,
      dealStatus: business.deal_status,
      dealStatusText: dealStatusMap[business.deal_status] || business.deal_status,
      followUpRemark: business.follow_up_remark,
      reminderTime: business.reminder_time,
      dealTime: business.deal_time,
      remark: business.remarks || '',
      createTime: business.created_at,
      updateTime: business.updated_at,
      // 添加保险期限字段
      insuranceStartDate: business.start_date,
      insuranceEndDate: business.end_date
    }
    
    // 返回前端期望的数据结构
    res.json({ 
      code: 200,
      message: '获取成功',
      data: formattedData
    })
  } catch (error) {
    console.error('获取业务详情失败:', error)
    res.status(500).json({ 
      code: 500,
      message: '获取业务详情失败',
      error: error.message 
    })
  }
})

// 更新业务记录
app.put('/api/business/update/:id', async (req, res) => {
  console.log('更新业务记录API被调用！')
  console.log('请求参数:', req.params)
  console.log('请求体:', req.body)
  try {
    const { id } = req.params
    const data = req.body
    
    // 检查业务记录是否存在
    const business = await db.Business.findByPk(id)
    
    if (!business) {
      return res.status(404).json({ 
        code: 404,
        message: '业务记录不存在'
      })
    }
    
    // 根据客户类型确定客户名称
    let customerName = ''
    if (data.clientType === 'personal') {
      customerName = data.personalName
    } else if (data.clientType === 'company') {
      customerName = data.companyName
    } else if (data.clientType === 'vehicle') {
      customerName = data.plateNumber
    }
    
    // 转换前端字段名到数据库字段名
    const businessData = {
      agent_id: data.agentId,
      underwriter_id: data.underwriterId,
      insurance_id: data.specificInsuranceId,
      insurance_type_id: data.insuranceTypeId,
      specific_insurance_id: data.specificInsuranceId,
      customer_name: customerName,
      customer_phone: data.customerPhone,
      customer_email: data.customerEmail || '',
      client_type: data.clientType,
      personal_name: data.personalName || '',
      company_name: data.companyName || '',
      plate_number: data.plateNumber || '',
      policy_number: data.policyNumber || '',
      coverage_amount: parseFloat(data.amountInsured) || 0,
      premium_amount: parseFloat(data.premium) || 0,
      inquiry_amount: parseFloat(data.inquiryAmount) || 0,
      status: data.status,
      deal_status: data.dealStatus,
      follow_up_remark: data.followUpRemark || '',
      reminder_time: data.reminderTime ? new Date(data.reminderTime) : null,
      deal_time: data.dealTime ? new Date(data.dealTime) : null,
      remarks: data.remark || '',
      updated_at: new Date()
    }
    
    // 更新业务记录
    await db.Business.update(businessData, { where: { id } })
    
    // 记录操作日志
    try {
      await db.OperationLog.create({
        operator_id: req.body.operatorId || 1, // 默认管理员ID
        operator_name: req.body.operatorName || '系统管理员', // 默认管理员姓名
        operation_type: 'update',
        operation_content: `更新了业务记录，客户名称：${customerName}`,
        ip_address: req.ip,
        module: 'business',
        related_id: id
      })
    } catch (logError) {
      console.error('记录操作日志失败:', logError)
    }
    
    // 返回前端期望的数据结构
    res.json({ 
      code: 200,
      message: '更新成功',
      data: { id }
    })
  } catch (error) {
    console.error('更新业务记录失败:', error)
    res.status(500).json({ 
      code: 500,
      message: '更新业务记录失败',
      error: error.message 
    })
  }
})

// 删除业务记录
app.delete('/api/business/delete/:id', async (req, res) => {
  console.log('删除业务记录API被调用！')
  console.log('请求参数:', req.params)
  try {
    const { id } = req.params
    
    // 检查业务记录是否存在
    const business = await db.Business.findByPk(id)
    
    if (!business) {
      return res.status(404).json({ 
        code: 404,
        message: '业务记录不存在'
      })
    }
    
    // 保存客户名称用于日志记录
    const customerName = business.customer_name
    
    // 删除业务记录
    await db.Business.destroy({ where: { id } })
    
    // 记录操作日志
    try {
      await db.OperationLog.create({
        operator_id: req.body.operatorId || 1, // 默认管理员ID
        operator_name: req.body.operatorName || '系统管理员', // 默认管理员姓名
        operation_type: 'delete',
        operation_content: `删除了业务记录，客户名称：${customerName}`,
        ip_address: req.ip,
        module: 'business',
        related_id: id
      })
    } catch (logError) {
      console.error('记录操作日志失败:', logError)
    }
    
    // 返回前端期望的数据结构
    res.json({ 
      code: 200,
      message: '删除成功',
      data: { id }
    })
  } catch (error) {
    console.error('删除业务记录失败:', error)
    res.status(500).json({ 
      code: 500,
      message: '删除业务记录失败',
      error: error.message 
    })
  }
})



// 导出业务记录
app.get('/api/business/export', async (req, res) => {
  console.log('导出业务记录API被调用！')
  console.log('请求参数:', req.query)
  try {
    const params = req.query
    const format = params.format || 'excel'
    
    // 构建查询条件
    const whereClause = {}
    
    if (params.agentId) {
      whereClause.agent_id = params.agentId
    }
    
    if (params.underwriterId) {
      whereClause.underwriter_id = params.underwriterId
    }
    
    if (params.insuranceTypeId) {
      whereClause.insurance_type_id = params.insuranceTypeId
    }
    
    if (params.specificInsuranceId) {
      whereClause.specific_insurance_id = params.specificInsuranceId
    }
    
    if (params.dealStatus) {
      whereClause.deal_status = params.dealStatus
    }
    
    if (params.status) {
      whereClause.status = params.status
    }
    
    if (params.customerName) {
      whereClause.customer_name = { [Sequelize.Op.like]: `%${params.customerName}%` }
    }
    
    if (params.minAmount && params.maxAmount) {
      whereClause.inquiry_amount = {
        [Sequelize.Op.between]: [params.minAmount, params.maxAmount]
      }
    } else if (params.minAmount) {
      whereClause.inquiry_amount = { [Sequelize.Op.gte]: params.minAmount }
    } else if (params.maxAmount) {
      whereClause.inquiry_amount = { [Sequelize.Op.lte]: params.maxAmount }
    }
    
    if (params.keyword) {
      whereClause[Sequelize.Op.or] = [
        { policy_number: { [Sequelize.Op.like]: `%${params.keyword}%` } },
        { customer_name: { [Sequelize.Op.like]: `%${params.keyword}%` } }
      ]
    }
    
    if (params.startDate && params.endDate) {
      whereClause.inquiry_date = {
        [Sequelize.Op.between]: [params.startDate, params.endDate]
      }
    } else if (params.startDate) {
      whereClause.inquiry_date = { [Sequelize.Op.gte]: params.startDate }
    } else if (params.endDate) {
      whereClause.inquiry_date = { [Sequelize.Op.lte]: params.endDate }
    }
    
    // 获取所有符合条件的业务记录
    const businessList = await db.Business.findAll({
      where: whereClause,
      order: [['inquiry_date', 'DESC']],
      include: [
        { model: db.User, as: 'agent', attributes: ['id', 'name', 'username'] },
        { model: db.User, as: 'underwriter', attributes: ['id', 'name', 'username'] },
        { model: db.Insurance, as: 'insurance', attributes: ['id', 'name', 'code', 'category_id'] },
        { model: db.InsuranceCategory, as: 'category', attributes: ['id', 'name'] }
      ]
    })
    
    // 成交状态映射
    const dealStatusMap = {
      'pending': '跟进中',
      'success': '已成交',
      'failed': '已失效'
    }

    // 转换为导出需要的格式
    const exportData = businessList.map(item => {
      const dataValues = item.dataValues || item
      return {
        'ID': dataValues.id,
        '代理人': dataValues.agent?.name || '',
        '出单员': dataValues.underwriter?.name || '',
        '险种分类': dataValues.category?.name || '',
        '险种名称': dataValues.insurance?.name || '',
        '客户名称': dataValues.customer_name || '',
        '询价金额': `¥${parseFloat(dataValues.inquiry_amount).toFixed(2)}`,
        '成交状态': dealStatusMap[dataValues.deal_status] || dataValues.deal_status,
        '登记日期': dataValues.inquiry_date ? new Date(dataValues.inquiry_date).toLocaleDateString() : '',
        '跟进备注': dataValues.follow_up_remark || ''
      }
    })
    
    // Excel格式导出
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    
    // 设置列宽
    worksheet['!cols'] = [
      { wch: 8 },  // ID
      { wch: 15 }, // 代理人
      { wch: 15 }, // 出单员
      { wch: 15 }, // 险种分类
      { wch: 20 }, // 险种名称
      { wch: 20 }, // 客户名称
      { wch: 15 }, // 询价金额
      { wch: 12 }, // 成交状态
      { wch: 15 }, // 登记日期
      { wch: 30 }  // 跟进备注
    ]
    
    XLSX.utils.book_append_sheet(workbook, worksheet, '业务记录')
    
    // 生成Excel文件
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })
    
    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    // 使用 encodeURIComponent 处理文件名中的中文字符
    const excelFilename = `业务记录_${new Date().toISOString().slice(0, 10)}.xlsx`
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(excelFilename)}`)
    
    // 返回Excel文件
    res.send(excelBuffer)
  } catch (error) {
    console.error('导出业务记录失败:', error)
    res.status(500).json({ 
      code: 500,
      message: '导出业务记录失败',
      error: error.message 
    })
  }
})

// 导入业务记录 API
app.post('/api/business/import', upload.single('file'), async (req, res) => {
  try {
    console.log('收到业务记录导入请求:', req.file)
    
    // 检查是否上传了文件
    if (!req.file) {
      return res.status(400).json({ 
        code: 400,
        message: '未上传文件'
      })
    }
    
    // 获取当前登录用户信息（简化处理，实际项目中应验证token）
    let currentUser = await db.User.findOne({ where: { role: 'admin' } })
    // 如果没有找到管理员，查找第一个代理人
    if (!currentUser) {
      currentUser = await db.User.findOne({ where: { role: 'agent' } })
    }
    // 如果还是没有找到，返回错误
    if (!currentUser) {
      return res.status(400).json({ 
        code: 400,
        message: '系统中没有可用的代理人用户'
      })
    }
    
    // 读取上传的Excel文件
    const workbook = XLSX.readFile(req.file.path)
    
    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // 解析Excel数据
    const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    // 检查是否有数据
    if (excelData.length < 2) {
      return res.status(400).json({ 
        code: 400,
        message: 'Excel文件中没有有效数据'
      })
    }
    
    // 获取表头
    const headers = excelData[0]
    
    // 检查必要的字段是否存在
    const requiredFields = ['保单号', '险种名称', '客户名称', '投保人', '被保险人', '保险期限', '询价金额', '成交状态']
    for (const field of requiredFields) {
      if (!headers.includes(field)) {
        return res.status(400).json({ 
          code: 400,
          message: `Excel文件缺少必要字段: ${field}`
        })
      }
    }
    
    // 准备要导入的数据
    const importData = []
    
    // 成交状态映射
    const dealStatusMap = {
      '跟进中': 'pending',
      '已成交': 'success',
      '已失效': 'failed'
    }
    
    // 处理数据行
    for (let i = 1; i < excelData.length; i++) {
      const row = excelData[i]
      if (!row || !row[0]) continue // 跳过空行
      
      // 创建数据对象
      const data = {
        agent_id: currentUser.id, // 设置当前登录用户为代理人
        policy_number: row[headers.indexOf('保单号')] || '',
        customer_name: row[headers.indexOf('客户名称')] || '',
        customer_phone: '13800000000', // 设置默认客户电话（必填字段）
        customer_email: '', // 设置默认客户邮箱
        client_type: 'personal', // 设置默认客户类型为个人
        policy_holder: row[headers.indexOf('投保人')] || '',
        insured_person: row[headers.indexOf('被保险人')] || '',
        insurance_term: row[headers.indexOf('保险期限')] || '',
        inquiry_amount: row[headers.indexOf('询价金额')] ? parseFloat(row[headers.indexOf('询价金额')].toString().replace(/[\s\u00A0]/g, '').replace(/¥/g, '')) || 0 : 0,
        deal_status: dealStatusMap[row[headers.indexOf('成交状态')]] || 'pending',
        // 设置默认的必填字段值
        premium_amount: 0,
        coverage_amount: 0,
        start_date: new Date(),
        end_date: new Date()
      }
      
      // 查询险种信息
      const insuranceName = row[headers.indexOf('险种名称')] || ''
      if (insuranceName) {
        const insurance = await db.Insurance.findOne({ where: { name: insuranceName } })
        if (insurance) {
          data.insurance_id = insurance.id
        } else {
          // 如果找不到匹配的险种，设置一个默认值（这里使用1作为默认险种ID）
          data.insurance_id = 1
        }
      } else {
        // 如果险种名称为空，设置一个默认值（这里使用1作为默认险种ID）
        data.insurance_id = 1
      }
      
      importData.push(data)
    }
    
    // 批量导入数据
    const result = await db.Business.bulkCreate(importData, { 
      updateOnDuplicate: ['customer_name', 'policy_holder', 'insured_person', 'insurance_term', 'inquiry_amount', 'deal_status']
    })
    
    console.log(`业务记录导入成功，共导入 ${result.length} 条记录`)
    
    // 返回导入结果
    res.json({ 
      code: 200,
      message: '业务记录导入成功',
      data: { 
        importedCount: result.length
      }
    })
  } catch (error) {
    console.error('导入业务记录失败:', error)
    res.status(500).json({ 
      code: 500,
      message: '导入业务记录失败',
      error: error.message 
    })
  }
})



// 启动服务器
const PORT = 3000 // 强制设置后端端口为3000

// 仪表盘基础数据 API 将在startServer函数内部通过dashboardRoutes注册

// 先初始化数据库，再启动服务器
async function startServer() {
  const PORT = 3000 // 强制设置后端端口为3000
  try {
    await setupDatabase()
    
    console.log('startServer函数已执行，setupDatabase完成')
    console.log('BusinessModel对象:', BusinessModel)
    console.log('BusinessModel.getBasicData方法:', BusinessModel.getBasicData)
    
    // 最简单的测试路由，直接在app上注册
    app.get('/api/simple-test', (req, res) => {
      console.log('收到简单测试请求')
      res.status(200).json({ message: 'Simple test route works!' })
    })
    
    // 注册仪表盘路由
    const dashboardRouter = dashboardRoutes(BusinessModel);
    app.use('/api/dashboard', dashboardRouter);
    console.log('仪表盘路由已注册成功')
    
    // 直接在app上注册的仪表盘测试路由
    app.get('/api/dashboard/app-test', (req, res) => {
      console.log('收到app直接注册的仪表盘测试请求')
      res.status(200).json({ message: 'Dashboard app-test route works!' })
    })
    
    // 使用不同路径前缀的测试路由
    app.get('/api/test-dashboard/test', (req, res) => {
      console.log('收到test-dashboard测试请求')
      res.status(200).json({ message: 'Test-dashboard route works!' })
    })
    
    // 时间趋势统计 API
    app.get('/api/statistics/time-trend', async (req, res) => {
      try {
        const { type = 'inquiry', timeRange = '30d', ...params } = req.query;
        // 使用现有的getTrendData方法获取时间趋势数据
        const timeTrendData = await BusinessModel.getTrendData(timeRange, type, params);
        res.status(200).json({
          code: 200,
          message: '获取时间趋势统计数据成功',
          data: timeTrendData
        });
      } catch (error) {
        console.error('获取时间趋势统计数据失败:', error);
        res.status(500).json({
          code: 500,
          message: '获取时间趋势统计数据失败',
          error: error.message
        });
      }
    })
    
    // 获取业务统计数据
    app.get('/api/business/statistics', async (req, res) => {
      try {
        console.log('收到统计数据请求:', req.query);
        
        // 从数据库模型获取统计数据
        const statistics = await BusinessModel.getStatistics(req.query);
        console.log('从数据库获取的统计数据:', statistics);
        
        // 构建响应数据，包括模拟的环比增长率
        const responseData = {
          ...statistics,
          todayDealGrowth: 8, // 暂时使用模拟数据
          monthlyPerformanceGrowth: -3 // 暂时使用模拟数据
        };
        
        console.log('返回给前端的统计数据:', responseData);
        
        res.json({ 
          code: 200,
          message: '获取业务统计数据成功',
          data: responseData 
        });
      } catch (error) {
        console.error('获取业务统计数据失败:', error);
        res.status(500).json({ 
          code: 500,
          message: '获取业务统计数据失败',
          error: error.message 
        });
      }
    })
    
    // 获取业务趋势数据
    app.get('/api/business/trend', async (req, res) => {
      try {
        const { timeDimension = 'week', agentId, insuranceType } = req.query;
        console.log('收到业务趋势数据请求:', req.query);
        
        // 从数据库模型获取业务趋势数据
        const trendData = await BusinessModel.getBusinessTrend({
          timeDimension,
          agentId,
          insuranceType
        });
        
        console.log('返回给前端的业务趋势数据:', trendData);
        
        res.json({ 
          code: 200,
          message: '获取业务趋势数据成功',
          data: trendData
        });
      } catch (error) {
        console.error('获取业务趋势数据失败:', error);
        res.status(500).json({ 
          code: 500,
          message: '获取业务趋势数据失败',
          error: error.message 
        });
      }
    })
    
    // 仪表盘基础数据 API - 将在这里重新实现
    app.get('/api/dashboard/basic', (req, res) => {
      res.status(200).json({ message: 'Dashboard basic API placeholder' })
    })
    
    // 启动服务器监听
    app.listen(PORT, () => {
      console.log(`后端服务器正在运行，端口: ${PORT}`)
    })
  } catch (error) {
    console.error('服务器启动失败:', error)
    process.exit(1)
  }
}



// 启动服务器
startServer()
