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

// 加载环境变量
dotenv.config()

// 创建Express应用
const app = express()

// 配置中间件
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// 添加日志中间件，记录所有请求
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// 简单测试路由 - 直接在app实例上定义
app.get('/test', (req, res) => {
  console.log('收到测试请求')
  res.status(200).json({ message: 'Test route works!' })
})

// 确保批量导入路由被注册在最前面，不受其他路由影响
console.log('在文件最前面注册批量导入路由')
app.post('/api/agent/batch-import', async (req, res) => {
  try {
    console.log('收到批量导入请求:', req.body);
    
    const { agents } = req.body;
    
    if (!agents || !Array.isArray(agents) || agents.length === 0) {
      return res.status(400).json({ 
        code: 400, 
        message: '导入数据不能为空',
        success: false 
      });
    }
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // 批量导入代理人
    for (const agent of agents) {
      try {
        // 自动生成用户名：使用姓名的拼音首字母 + 时间戳后6位
        const timestamp = Date.now().toString().slice(-6);
        const getPinyinFirstLetter = (str) => {
          return str.replace(/[\u4e00-\u9fa5]/g, function (char) {
            return char.charCodeAt(0).toString(16).slice(-4);
          }).slice(0, 3).toUpperCase();
        };
        const username = `${getPinyinFirstLetter(agent.name)}${timestamp}`;
        
        // 自动生成密码：使用默认密码 'agent123'
        const password = 'agent123';
        
        // 创建新代理人
        await User.create({
          username,
          name: agent.name,
          password,
          phone: agent.phone || '',
          email: agent.email || '',
          role: 'agent',
          status: agent.status !== undefined ? agent.status : true,
          department: agent.department || ''
        });
        
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push({
          name: agent.name,
          error: error.message
        });
        console.error(`导入代理人 ${agent.name} 失败:`, error);
      }
    }
    
    res.json({
      code: 200,
      success: true,
      message: `批量导入完成，成功 ${successCount} 条，失败 ${errorCount} 条`,
      data: {
        successCount,
        errorCount,
        errors
      }
    });
  } catch (error) {
    console.error('批量导入代理人失败:', error);
    res.status(500).json({ 
      code: 500,
      success: false,
      message: '批量导入代理人失败',
      error: error.message 
    });
  }
})

// 统计API路由 - 直接在app实例上定义
app.get('/statistics', (req, res) => {
  try {
    console.log('收到统计数据请求:', req.query)
    // 暂时返回模拟数据
    const statistics = {
      totalAmount: 100000,
      totalPolicies: 50,
      dailyTrend: [10, 15, 20, 25, 30, 35, 40],
      monthlyTrend: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200]
    }
    console.log('统计数据计算结果:', statistics)
    
    res.json({ 
      code: 200,
      message: '获取业务统计数据成功',
      data: statistics 
    })
  } catch (error) {
    console.error('获取业务统计数据失败:', error)
    res.status(500).json({ 
      code: 500,
      message: '获取业务统计数据失败',
      error: error.message 
    })
  }
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

// 简单测试路由
app.get('/api/test', (req, res) => {
  console.log('收到测试请求')
  res.status(200).json({ message: 'Test route works!' })
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
    const currentPage = parseInt(page)
    const limit = parseInt(pageSize)
    const offset = (currentPage - 1) * limit
    
    // 获取总数
    const totalCount = await db.Insurance.count({ where })
    
    // 获取分页数据
    const insuranceList = await db.Insurance.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
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
      pagination: {
        currentPage,
        pageSize: limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
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
    const currentPage = parseInt(page)
    const limit = parseInt(pageSize)
    const offset = (currentPage - 1) * limit
    
    // 获取总数
    const totalCount = await db.User.count({ where })
    
    // 获取分页数据
    const agentList = await db.User.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset
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
      data: formattedList,
      pagination: {
        currentPage,
        pageSize: limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
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
    const { id } = req.params;
    
    // 验证ID是否有效
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: '无效的代理人ID' });
    }
    
    // 查找代理人
    const agent = await db.User.findOne({
      where: {
        id: parseInt(id),
        role: 'agent'
      }
    });
    
    if (!agent) {
      return res.status(404).json({ error: '代理人不存在' });
    }
    
    // 检查是否有关联的业务记录
    const relatedBusiness = await db.Business.count({
      where: {
        agent_id: agent.id
      }
    });
    
    if (relatedBusiness > 0) {
      return res.status(400).json({ error: '该代理人存在关联的业务记录，无法删除' });
    }
    
    // 删除代理人
    await agent.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error('删除代理人失败:', error);
    res.status(500).json({ error: '删除代理人失败' });
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



// 启动服务器
const PORT = 3000 // 强制设置后端端口为3000

// 先初始化数据库，再启动服务器
async function startServer() {
  try {
    console.log('startServer函数开始执行')
    await setupDatabase()
    console.log('数据库初始化完成，开始注册路由')
    
    // 简单测试路由
    app.get('/api/test', (req, res) => {
      console.log('收到测试请求')
      res.status(200).json({ message: 'Test route works!' })
    })
    
    // 调试路由：查看所有已注册的路由
    app.get('/api/routes', (req, res) => {
      const routes = [];
      // 检查app._router.stack
      if (app._router && app._router.stack) {
        app._router.stack.forEach(middleware => {
          if (middleware.route) {
            // 路由中间件
            routes.push({
              path: middleware.route.path,
              methods: Object.keys(middleware.route.methods)
            });
          } else if (middleware.name === 'router') {
            // 子路由
            middleware.handle.stack.forEach(handler => {
              if (handler.route) {
                routes.push({
                  path: handler.route.path,
                  methods: Object.keys(handler.route.methods)
                });
              }
            });
          }
        });
      }
      res.json({ routes });
    })
    
    // 批量导入路由已在文件最前面注册
    
    // 获取业务统计数据
    app.get('/api/business/statistics', (req, res) => {
      try {
        console.log('收到统计数据请求:', req.query)
        // 返回前端期望的数据结构
        const statistics = {
          todayInquiryCount: 12,
          todayDealCount: 5,
          monthlyPerformance: 250000,
          todayInquiryGrowth: 12,
          todayDealGrowth: 8,
          monthlyPerformanceGrowth: -3,
          dailyTrend: [10, 15, 20, 25, 30, 35, 40],
          monthlyTrend: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200]
        }
        console.log('统计数据计算结果:', statistics)
        
        res.json({ 
          code: 200,
          message: '获取业务统计数据成功',
          data: statistics 
        })
      } catch (error) {
        console.error('获取业务统计数据失败:', error)
        res.status(500).json({ 
          code: 500,
          message: '获取业务统计数据失败',
          error: error.message 
        })
      }
    })
    
    console.log('所有路由注册完成，开始监听端口')
    app.listen(PORT, () => {
      console.log(`后端服务器正在运行，端口: ${PORT}`)
    })
    
    // 批量导入路由已在文件最前面注册
  } catch (error) {
    console.error('服务器启动失败:', error)
    process.exit(1)
  }
}

// 启动服务器
startServer()

// 直接在app上注册一个测试路由
app.get('/api/direct-test', (req, res) => {
  console.log('收到直接测试请求')
  res.status(200).json({ message: 'Direct test route works!' })
})

// 直接在app上注册批量导入路由
app.post('/api/agent/direct-batch-import', async (req, res) => {
  try {
    console.log('收到直接批量导入请求:', req.body);
    res.json({
      success: true,
      message: '直接批量导入接口测试成功'
    });
  } catch (error) {
    console.error('直接批量导入代理人失败:', error);
    res.status(500).json({ error: '直接批量导入代理人失败' });
  }
})
