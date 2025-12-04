// Excel解析工具
import * as XLSX from 'xlsx'

/**
 * 解析Excel文件
 * @param {File} file - Excel文件对象
 * @param {Object} options - 解析选项
 * @returns {Promise<Array>} 解析后的数据数组
 */
export const parseExcelFile = async (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // 默认获取第一个工作表
        const sheetName = options.sheetName || workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        
        // 解析数据
        const parsedData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1, // 先获取标题行
          raw: false, // 使用格式化后的数据
          dateNF: 'yyyy-mm-dd' // 日期格式
        })
        
        // 如果没有数据，返回空数组
        if (parsedData.length === 0) {
          resolve([])
          return
        }
        
        // 获取标题行和数据行
        const headers = parsedData[0]
        const dataRows = parsedData.slice(1)
        
        // 转换为对象数组
        const result = dataRows.map(row => {
          const obj = {}
          headers.forEach((header, index) => {
            // 去除标题中的空格
            const key = header?.trim() || `column_${index}`
            obj[key] = row[index]
          })
          return obj
        })
        
        resolve(result)
      } catch (error) {
        reject(new Error(`解析Excel文件失败: ${error.message}`))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('读取文件失败'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 验证Excel数据结构
 * @param {Array} data - 解析后的数据数组
 * @param {Array} requiredFields - 必填字段列表
 * @returns {Object} 验证结果 { isValid: boolean, errors: Array }
 */
export const validateExcelData = (data, requiredFields) => {
  const errors = []
  
  data.forEach((row, index) => {
    const rowNum = index + 2 // 数据行从第2行开始
    
    // 检查必填字段
    requiredFields.forEach(field => {
      if (row[field] === undefined || row[field] === null || row[field] === '') {
        errors.push(`第${rowNum}行缺少必填字段: ${field}`)
      }
    })
    
    // 检查询价金额是否为有效数字
    if (row['询价金额'] !== undefined && row['询价金额'] !== null && row['询价金额'] !== '') {
      const amount = parseFloat(row['询价金额']?.replace(/[\s\u00A0]/g, '').replace(/¥/g, ''))
      if (isNaN(amount)) {
        errors.push(`第${rowNum}行的询价金额不是有效数字: ${row['询价金额']}`)
      }
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 格式化Excel数据为业务模型
 * @param {Array} data - 解析后的数据数组
 * @returns {Array} 格式化后的业务数据数组
 */
export const formatBusinessData = (data) => {
  return data.map(row => {
    // 根据实际业务模型进行字段映射
    return {
      policy_number: row['保单号']?.trim(),
      customer_name: row['客户名称']?.trim(),
      policy_holder: row['投保人']?.trim(),
      insured_person: row['被保险人']?.trim(),
      insurance_term: row['保险期限']?.trim(),
      inquiry_amount: parseFloat(row['询价金额']?.replace(/[\s\u00A0]/g, '').replace(/¥/g, '')) || 0,
      insuranceName: row['险种名称']?.trim(),
      deal_status: row['成交状态']?.trim()
    }
  })
}