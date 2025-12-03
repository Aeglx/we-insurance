// 后端服务器入口文件
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import mysql2 from 'mysql2/promise'
import { sequelize, Sequelize } from './src/database/connection.js'
import databaseService from './src/services/databaseService.js'
import { User, Insurance, Business, InsuranceCategory, BusinessLevel } from './src/database/models/index.js'

// 加载环境变量
dotenv.config()

// 创建Express应用
const app = express()

// 配置中间件
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

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
    return { User, Insurance, Business, InsuranceCategory }
  } catch (error) {
    console.error('数据库初始化失败:', error)
    throw error
  }
}

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// 初始化数据库
let db

// 初始化数据库并获取模型
const setupDatabase = async () => {
  try {
    db = await initDatabase()
    console.log('数据库自动创建和初始化完成！')
    return db
  } catch (error) {
    console.error('数据库初始化失败:', error)
    console.log('请确保MySQL服务已启动并配置正确。')
    return null
  }
}

// 险种API接口
// 获取险种列表
app.get('/api/insurance/list', async (req, res) => {
  try {
    const { keyword, typeId } = req.query
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
    
    const insuranceList = await db.Insurance.findAll({
      where,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: db.InsuranceCategory,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
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
      data: formattedList,
      total: formattedList.length
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
    
    res.json({ list: formattedList, total: formattedList.length })
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
    const { keyword, status } = req.query
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
    
    res.json({ list: formattedList, total: formattedList.length })
  } catch (error) {
    console.error('获取代理人列表失败:', error)
    res.status(500).json({ error: '获取代理人列表失败' })
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
    
    res.json({ list: formattedList, total: formattedList.length })
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

// 启动服务器
const PORT = process.env.API_PORT || 3000

app.listen(PORT, async () => {
  console.log(`服务器正在运行，端口: ${PORT}`)
  
  // 初始化数据库
  await setupDatabase()
})
