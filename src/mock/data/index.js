import Mock from 'mockjs'

// 生成模拟代理人数据
export const mockAgents = Mock.mock({
  'list|8': [
    {
      'id|+1': 1,
      'name': '@cname',
      'phone': /1[3-9]\d{9}/,
      'email': '@email',
      'status': 'active',
      'created_at': '@datetime'
    }
  ]
}).list

// 生成模拟出单员数据
export const mockUnderwriters = Mock.mock({
  'list|6': [
    {
      'id|+1': 1,
      'name': '@cname',
      'phone': /1[3-9]\d{9}/,
      'email': '@email',
      'status': 'active',
      'created_at': '@datetime'
    }
  ]
}).list

// 生成模拟险种数据
export const mockInsuranceTypes = [
  {
    id: 1,
    name: '个人意外险',
    category: '意外险',
    description: '个人意外保险产品',
    status: 'active',
    created_at: '2024-01-01 00:00:00'
  },
  {
    id: 2,
    name: '团体意外险',
    category: '意外险',
    description: '团体意外保险产品',
    status: 'active',
    created_at: '2024-01-01 00:00:00'
  },
  {
    id: 3,
    name: '家庭财产险',
    category: '财产险',
    description: '家庭财产保险产品',
    status: 'active',
    created_at: '2024-01-01 00:00:00'
  },
  {
    id: 4,
    name: '企业财产险',
    category: '财产险',
    description: '企业财产保险产品',
    status: 'active',
    created_at: '2024-01-01 00:00:00'
  },
  {
    id: 5,
    name: '建筑工程险',
    category: '工程险',
    description: '建筑工程保险产品',
    status: 'active',
    created_at: '2024-01-01 00:00:00'
  },
  {
    id: 6,
    name: '安装工程险',
    category: '工程险',
    description: '安装工程保险产品',
    status: 'active',
    created_at: '2024-01-01 00:00:00'
  }
]

// 生成模拟业务数据
export const mockBusinessData = Mock.mock({
  'list|30': [
    {
      'id|+1': 1,
      'agent_id|1-8': 1,
      'agent_name': () => mockAgents[Mock.Random.integer(0, mockAgents.length - 1)].name,
      'underwriter_id|1-6': 1,
      'underwriter_name': () => mockUnderwriters[Mock.Random.integer(0, mockUnderwriters.length - 1)].name,
      'insurance_type_id|1-6': 1,
      'insurance_type_name': () => mockInsuranceTypes[Mock.Random.integer(0, mockInsuranceTypes.length - 1)].name,
      'inquiry_amount|1000-100000.2': 1,
      'actual_amount|1000-100000.2': 1,
      'status|1': ['pending', 'success', 'failed'],
      'customer_name': '@cname',
      'customer_phone': /1[3-9]\d{9}/,
      'customer_email': '@email',
      'remark': '@cparagraph(1, 3)',
      'created_at': '@datetime',
      'updated_at': '@datetime'
    }
  ]
}).list

// 模拟用户数据
export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    name: '管理员',
    role: 'admin'
  },
  {
    id: 2,
    username: 'user',
    password: 'user123',
    name: '普通用户',
    role: 'user'
  }
]

// 模拟统计数据
export const mockStatistics = {
  totalCount: mockBusinessData.length,
  totalInquiryAmount: mockBusinessData.reduce((sum, item) => sum + item.inquiry_amount, 0),
  totalActualAmount: mockBusinessData.reduce((sum, item) => sum + item.actual_amount, 0),
  successCount: mockBusinessData.filter(item => item.status === 'success').length,
  failedCount: mockBusinessData.filter(item => item.status === 'failed').length,
  pendingCount: mockBusinessData.filter(item => item.status === 'pending').length,
  successRate: Math.round(mockBusinessData.filter(item => item.status === 'success').length / mockBusinessData.length * 100),
  // 按月份统计的数据
  monthlyData: [
    { month: '1月', inquiryAmount: 150000, actualAmount: 120000, count: 8 },
    { month: '2月', inquiryAmount: 180000, actualAmount: 145000, count: 10 },
    { month: '3月', inquiryAmount: 210000, actualAmount: 175000, count: 12 },
    { month: '4月', inquiryAmount: 190000, actualAmount: 160000, count: 11 },
    { month: '5月', inquiryAmount: 230000, actualAmount: 190000, count: 14 },
    { month: '6月', inquiryAmount: 250000, actualAmount: 210000, count: 15 }
  ],
  // 险种分布数据
  insuranceTypeData: mockInsuranceTypes.map(type => ({
    name: type.name,
    count: mockBusinessData.filter(item => item.insurance_type_id === type.id).length,
    amount: mockBusinessData.filter(item => item.insurance_type_id === type.id).reduce((sum, item) => sum + item.actual_amount, 0)
  }))
}