// API配置

// API基础URL
// 静态部署时，可根据实际情况修改为后端API地址
export const API_BASE_URL = process.env.VITE_API_BASE_URL || '/api'

// 请求超时时间（毫秒）
export const REQUEST_TIMEOUT = 10000

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [10, 20, 50, 100]
}

// API路径
export const API_PATHS = {
  // 认证相关
  AUTH: {
    LOGIN: '/user/login',
    LOGOUT: '/user/logout',
    REFRESH_TOKEN: '/auth/refresh',
    USER_INFO: '/user/info'
  },
  
  // 业务记录相关
  BUSINESS: {
    LIST: '/business/list',
    DETAIL: '/business/detail/',
    ADD: '/business/add',
    UPDATE: '/business/update/',
    DELETE: '/business/delete/',
    BATCH_DELETE: '/business/batch-delete',
    STATISTICS: '/business/statistics',
    EXPORT: '/business/export',
    IMPORT: '/business/import'
  },
  
  // 代理人相关
  AGENT: {
    LIST: '/agent/list',
    DETAIL: '/agent/detail/',
    ADD: '/agent/add',
    UPDATE: '/agent/update/',
    DELETE: '/agent/delete/',
    BATCH_DELETE: '/agent/batch-delete',
    SEARCH: '/agent/search',
    BATCH_IMPORT: '/agent/batch-import',
    DOWNLOAD_TEMPLATE: '/agent/download-template'
  },
  
  // 险种相关
  INSURANCE: {
    LIST: '/insurance/list',
    DETAIL: '/insurance/detail/',
    ADD: '/insurance/add',
    UPDATE: '/insurance/update/',
    DELETE: '/insurance/delete/',
    BATCH_DELETE: '/insurance/batch-delete',
    CATEGORIES: '/insurance/categories'
  },
  
  // 出单员相关
  UNDERWRITER: {
    LIST: '/underwriter/list',
    DETAIL: '/underwriter/detail/',
    ADD: '/underwriter/add',
    UPDATE: '/underwriter/update/',
    DELETE: '/underwriter/delete/',
    BATCH_DELETE: '/underwriter/batch-delete'
  },
  
  // 用户相关
  USER: {
    LIST: '/user/list',
    DETAIL: '/user/detail/',
    ADD: '/user/add',
    UPDATE: '/user/update/',
    DELETE: '/user/delete/',
    BATCH_DELETE: '/user/batch-delete',
    CHANGE_PASSWORD: '/user/change-password',
    UPDATE_PROFILE: '/user/update-profile'
  }
}

// 错误码配置
export const ERROR_CODES = {
  SUCCESS: 0,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  PARAM_ERROR: 10001,
  VALIDATION_ERROR: 10002,
  DATABASE_ERROR: 10003,
  BUSINESS_ERROR: 20000
}

// 错误信息映射
export const ERROR_MESSAGES = {
  [ERROR_CODES.UNAUTHORIZED]: '未授权，请重新登录',
  [ERROR_CODES.FORBIDDEN]: '权限不足，无法访问',
  [ERROR_CODES.NOT_FOUND]: '请求的资源不存在',
  [ERROR_CODES.SERVER_ERROR]: '服务器错误，请稍后重试',
  [ERROR_CODES.PARAM_ERROR]: '参数错误',
  [ERROR_CODES.VALIDATION_ERROR]: '数据验证失败',
  [ERROR_CODES.DATABASE_ERROR]: '数据库操作失败',
  [ERROR_CODES.BUSINESS_ERROR]: '业务逻辑错误'
}