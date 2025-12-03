// 模型基类，封装通用CRUD操作
class BaseModel {
  constructor(model) {
    this.model = model
  }

  // 创建记录
  async create(data) {
    try {
      return await this.model.create(data)
    } catch (error) {
      console.error(`创建${this.model.name}记录失败:`, error)
      throw error
    }
  }

  // 查询所有记录
  async findAll(params = {}) {
    try {
      return await this.model.findAll(params)
    } catch (error) {
      console.error(`查询${this.model.name}记录失败:`, error)
      throw error
    }
  }

  // 根据ID查询记录
  async findById(id, params = {}) {
    try {
      return await this.model.findByPk(id, params)
    } catch (error) {
      console.error(`根据ID查询${this.model.name}记录失败:`, error)
      throw error
    }
  }

  // 根据条件查询单个记录
  async findOne(params = {}) {
    try {
      return await this.model.findOne(params)
    } catch (error) {
      console.error(`根据条件查询${this.model.name}记录失败:`, error)
      throw error
    }
  }

  // 更新记录
  async update(id, data, params = {}) {
    try {
      const [affectedRows, updatedRows] = await this.model.update(data, {
        ...params,
        where: { id },
        returning: true
      })
      return updatedRows[0]
    } catch (error) {
      console.error(`更新${this.model.name}记录失败:`, error)
      throw error
    }
  }

  // 删除记录
  async delete(id, params = {}) {
    try {
      const affectedRows = await this.model.destroy({
        ...params,
        where: { id }
      })
      return affectedRows > 0
    } catch (error) {
      console.error(`删除${this.model.name}记录失败:`, error)
      throw error
    }
  }

  // 批量删除记录
  async batchDelete(ids, params = {}) {
    try {
      const affectedRows = await this.model.destroy({
        ...params,
        where: { id: ids }
      })
      return affectedRows
    } catch (error) {
      console.error(`批量删除${this.model.name}记录失败:`, error)
      throw error
    }
  }

  // 分页查询
  async paginate(page = 1, pageSize = 10, params = {}) {
    try {
      const offset = (page - 1) * pageSize
      const limit = pageSize

      const [rows, total] = await Promise.all([
        this.model.findAll({
          ...params,
          offset,
          limit
        }),
        this.model.count({
          where: params.where
        })
      ])

      return {
        rows,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    } catch (error) {
      console.error(`分页查询${this.model.name}记录失败:`, error)
      throw error
    }
  }

  // 统计查询
  async count(params = {}) {
    try {
      return await this.model.count(params)
    } catch (error) {
      console.error(`统计${this.model.name}记录失败:`, error)
      throw error
    }
  }

  // 聚合查询
  async aggregate(field, fn, params = {}) {
    try {
      const result = await this.model.aggregate(field, fn, params)
      return result
    } catch (error) {
      console.error(`聚合查询${this.model.name}记录失败:`, error)
      throw error
    }
  }
}

export default BaseModel
