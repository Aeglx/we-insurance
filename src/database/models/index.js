// 模型索引文件，统一导出所有模型
import { User, UserModel } from './User.js'
import { Business, BusinessModel } from './Business.js'
import { Insurance, InsuranceModel } from './Insurance.js'
import { InsuranceCategory, InsuranceCategoryModel } from './InsuranceCategory.js'
import { BusinessLevel, BusinessLevelModel } from './BusinessLevel.js'
import { OperationLog, OperationLogModel } from './OperationLog.js'

// 导出所有模型和模型实例
export {
  // 模型
  User,
  Business,
  Insurance,
  InsuranceCategory,
  BusinessLevel,
  OperationLog,
  
  // 模型实例
  UserModel,
  BusinessModel,
  InsuranceModel,
  InsuranceCategoryModel,
  BusinessLevelModel,
  OperationLogModel
}
