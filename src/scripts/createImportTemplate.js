// 创建业务记录导入模板
import * as XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'

// 创建工作簿
const workbook = XLSX.utils.book_new()

// 定义表头
const headers = ['保单号', '客户名称', '险种名称', '投保人', '被保险人', '保险期限', '询价金额', '成交状态']

// 创建示例数据
const sampleData = [
  ['P20240001', '张三', '车险', '张三', '张三', '1年', '5000', '跟进中'],
  ['P20240002', '李四', '寿险', '李四', '李四', '30年', '10000', '已成交'],
  ['P20240003', '王五', '医疗险', '王五', '王五', '1年', '3000', '已失效']
]

// 创建工作表数据（表头 + 示例数据）
const worksheetData = [headers, ...sampleData]

// 创建工作表
const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

// 添加工作表到工作簿
XLSX.utils.book_append_sheet(workbook, worksheet, '业务记录')

// 设置列宽
const colWidths = headers.map(() => ({ wch: 15 }))
worksheet['!cols'] = colWidths

// 导出Excel文件
const templatePath = path.join(process.cwd(), 'public', 'templates', 'business_import_template.xlsx')

// 确保目录存在
fs.mkdirSync(path.dirname(templatePath), { recursive: true })

// 写入文件
XLSX.writeFile(workbook, templatePath)

console.log(`导入模板已创建: ${templatePath}`)
