import Mock from 'mockjs'
import { 
  mockBusinessData, 
  mockAgents, 
  mockUnderwriters, 
  mockInsuranceTypes, 
  mockUsers,
  mockStatistics 
} from './data/index'

// 设置Mock响应延迟
Mock.setup({
  timeout: '200-600'
})

// 业务记录相关接口
Mock.mock(/\/api\/business\/list/, 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: mockBusinessData
  }
})

Mock.mock(/\/api\/business\/add/, 'post', (options) => {
  const newRecord = JSON.parse(options.body)
  newRecord.id = Date.now()
  newRecord.created_at = new Date().toISOString()
  newRecord.updated_at = new Date().toISOString()
  newRecord.agent_name = mockAgents.find(a => a.id === newRecord.agent_id)?.name || '未知代理人'
  newRecord.underwriter_name = mockUnderwriters.find(u => u.id === newRecord.underwriter_id)?.name || '未知出单员'
  newRecord.insurance_type_name = mockInsuranceTypes.find(it => it.id === newRecord.insurance_type_id)?.name || '未知险种'
  
  mockBusinessData.unshift(newRecord)
  
  return {
    code: 200,
    message: '添加成功',
    data: newRecord
  }
})

Mock.mock(/\/api\/business\/update\/\d+/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/api\/business\/update\/(\d+)/)[1])
  const updateData = JSON.parse(options.body)
  
  const index = mockBusinessData.findIndex(item => item.id === id)
  if (index !== -1) {
    mockBusinessData[index] = { ...mockBusinessData[index], ...updateData, updated_at: new Date().toISOString() }
    return {
      code: 200,
      message: '更新成功',
      data: mockBusinessData[index]
    }
  } else {
    return {
      code: 404,
      message: '记录不存在'
    }
  }
})

Mock.mock(/\/api\/business\/delete\/\d+/, 'delete', (options) => {
  const id = parseInt(options.url.match(/\/api\/business\/delete\/(\d+)/)[1])
  
  const index = mockBusinessData.findIndex(item => item.id === id)
  if (index !== -1) {
    mockBusinessData.splice(index, 1)
    return {
      code: 200,
      message: '删除成功'
    }
  } else {
    return {
      code: 404,
      message: '记录不存在'
    }
  }
})

Mock.mock(/\/api\/business\/statistics/, 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: mockStatistics
  }
})

// 代理人相关接口
Mock.mock(/\/api\/agents/, 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: mockAgents
  }
})

// 出单员相关接口
Mock.mock(/\/api\/underwriters/, 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: mockUnderwriters
  }
})

// 险种相关接口
Mock.mock(/\/api\/insurance-types/, 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: mockInsuranceTypes
  }
})

// 险种相关接口 - insurance/list
Mock.mock(/\/api\/insurance\/list/, 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: {
      list: mockInsuranceTypes
    }
  }
})

// 险种详情接口
Mock.mock(/\/api\/insurance\/detail\/\d+/, 'get', (options) => {
  const id = parseInt(options.url.match(/\/api\/insurance\/detail\/(\d+)/)[1])
  const insurance = mockInsuranceTypes.find(item => item.id === id)
  
  if (insurance) {
    return {
      code: 200,
      message: 'success',
      data: insurance
    }
  } else {
    return {
      code: 404,
      message: '险种不存在'
    }
  }
})

// 添加险种接口
Mock.mock(/\/api\/insurance\/add/, 'post', (options) => {
  const newInsurance = JSON.parse(options.body)
  newInsurance.id = Date.now()
  newInsurance.created_at = new Date().toISOString()
  newInsurance.updated_at = new Date().toISOString()
  
  mockInsuranceTypes.push(newInsurance)
  
  return {
    code: 200,
    message: '添加险种成功',
    data: newInsurance
  }
})

// 更新险种接口
Mock.mock(/\/api\/insurance\/update\/\d+/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/api\/insurance\/update\/(\d+)/)[1])
  const updateData = JSON.parse(options.body)
  
  const index = mockInsuranceTypes.findIndex(item => item.id === id)
  if (index !== -1) {
    mockInsuranceTypes[index] = { ...mockInsuranceTypes[index], ...updateData, updated_at: new Date().toISOString() }
    return {
      code: 200,
      message: '更新险种成功',
      data: mockInsuranceTypes[index]
    }
  } else {
    return {
      code: 404,
      message: '险种不存在'
    }
  }
})

// 删除险种接口
Mock.mock(/\/api\/insurance\/delete\/\d+/, 'delete', (options) => {
  const id = parseInt(options.url.match(/\/api\/insurance\/delete\/(\d+)/)[1])
  
  const index = mockInsuranceTypes.findIndex(item => item.id === id)
  if (index !== -1) {
    mockInsuranceTypes.splice(index, 1)
    return {
      code: 200,
      message: '删除险种成功'
    }
  } else {
    return {
      code: 404,
      message: '险种不存在'
    }
  }
})

// 险种分类接口
Mock.mock(/\/api\/insurance\/categories/, 'get', () => {
  const categories = [...new Set(mockInsuranceTypes.map(item => item.category))]
  return {
    code: 200,
    message: 'success',
    data: categories
  }
})

// 用户登录接口
Mock.mock(/\/api\/user\/login/, 'post', (options) => {
  const { username, password } = JSON.parse(options.body)
  const user = mockUsers.find(u => u.username === username && u.password === password)
  
  if (user) {
    return {
      code: 200,
      message: '登录成功',
      data: {
        userInfo: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        },
        token: 'mock-token-' + Date.now()
      }
    }
  } else {
    return {
      code: 401,
      message: '用户名或密码错误'
    }
  }
})

// 用户信息接口
Mock.mock(/\/api\/user\/info/, 'get', () => {
  const username = localStorage.getItem('username')
  const user = mockUsers.find(u => u.username === username)
  
  if (user) {
    return {
      code: 200,
      message: 'success',
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    }
  } else {
    return {
      code: 401,
      message: '用户未登录'
    }
  }
})

// 代理人列表接口
Mock.mock(/\/api\/agent\/list/, 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: {
      list: mockAgents
    }
  }
})

// 代理人详情接口
Mock.mock(/\/api\/agent\/detail\/\d+/, 'get', (options) => {
  const id = parseInt(options.url.match(/\/api\/agent\/detail\/(\d+)/)[1])
  const agent = mockAgents.find(item => item.id === id)
  
  if (agent) {
    return {
      code: 200,
      message: 'success',
      data: agent
    }
  } else {
    return {
      code: 404,
      message: '代理人不存在'
    }
  }
})

// 添加代理人接口
Mock.mock(/\/api\/agent\/add/, 'post', (options) => {
  const newAgent = JSON.parse(options.body)
  newAgent.id = Date.now()
  newAgent.created_at = new Date().toISOString()
  newAgent.updated_at = new Date().toISOString()
  
  mockAgents.push(newAgent)
  
  return {
    code: 200,
    message: '添加代理人成功',
    data: newAgent
  }
})

// 更新代理人接口
Mock.mock(/\/api\/agent\/update\/\d+/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/api\/agent\/update\/(\d+)/)[1])
  const updateData = JSON.parse(options.body)
  
  const index = mockAgents.findIndex(item => item.id === id)
  if (index !== -1) {
    mockAgents[index] = { ...mockAgents[index], ...updateData, updated_at: new Date().toISOString() }
    return {
      code: 200,
      message: '更新代理人成功',
      data: mockAgents[index]
    }
  } else {
    return {
      code: 404,
      message: '代理人不存在'
    }
  }
})

// 删除代理人接口
Mock.mock(/\/api\/agent\/delete\/\d+/, 'delete', (options) => {
  const id = parseInt(options.url.match(/\/api\/agent\/delete\/(\d+)/)[1])
  
  const index = mockAgents.findIndex(item => item.id === id)
  if (index !== -1) {
    mockAgents.splice(index, 1)
    return {
      code: 200,
      message: '删除代理人成功'
    }
  } else {
    return {
      code: 404,
      message: '代理人不存在'
    }
  }
})

// 搜索代理人接口
Mock.mock(/\/api\/agent\/search/, 'get', (options) => {
  const urlParams = new URLSearchParams(options.url.split('?')[1])
  const keyword = urlParams.get('keyword')
  
  if (keyword) {
    const filteredAgents = mockAgents.filter(agent => 
      agent.name.includes(keyword) || 
      agent.code.includes(keyword) || 
      agent.phone.includes(keyword)
    )
    return {
      code: 200,
      message: 'success',
      data: filteredAgents
    }
  } else {
    return {
      code: 200,
      message: 'success',
      data: mockAgents
    }
  }
})

// 用户列表接口
Mock.mock(/\/api\/user\/list/, 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: {
      list: mockUsers
    }
  }
})

// 用户详情接口
Mock.mock(/\/api\/user\/detail\/\d+/, 'get', (options) => {
  const id = parseInt(options.url.match(/\/api\/user\/detail\/(\d+)/)[1])
  const user = mockUsers.find(item => item.id === id)
  
  if (user) {
    return {
      code: 200,
      message: 'success',
      data: user
    }
  } else {
    return {
      code: 404,
      message: '用户不存在'
    }
  }
})

// 添加用户接口
Mock.mock(/\/api\/user\/add/, 'post', (options) => {
  const newUser = JSON.parse(options.body)
  newUser.id = Date.now()
  
  mockUsers.push(newUser)
  
  return {
    code: 200,
    message: '添加用户成功',
    data: newUser
  }
})

// 删除用户接口
Mock.mock(/\/api\/user\/delete\/\d+/, 'delete', (options) => {
  const id = parseInt(options.url.match(/\/api\/user\/delete\/(\d+)/)[1])
  
  const index = mockUsers.findIndex(item => item.id === id)
  if (index !== -1) {
    mockUsers.splice(index, 1)
    return {
      code: 200,
      message: '删除用户成功'
    }
  } else {
    return {
      code: 404,
      message: '用户不存在'
    }
  }
})

export default Mock