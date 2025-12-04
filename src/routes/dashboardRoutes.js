// 仪表盘路由模块
import express from 'express';
const router = express.Router();

// 导出路由函数，接收BusinessModel作为参数
export default function(BusinessModel) {
  // 仪表盘测试路由
  router.get('/test', (req, res) => {
    res.json({ message: '仪表盘测试路由正常工作', BusinessModel: BusinessModel ? '已加载' : '未加载' });
  });

  // 仪表盘基础指标数据路由
  router.get('/basic', async (req, res) => {
    try {
      // 使用BusinessModel获取数据
      const basicStats = await BusinessModel.getBasicStatistics();
      res.json({
        code: 200,
        message: '获取仪表盘基础数据成功',
        data: basicStats
      });
    } catch (error) {
      console.error('获取仪表盘基础数据失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取仪表盘基础数据失败',
        error: error.message
      });
    }
  });

  // 仪表盘趋势数据路由
  router.get('/trend', async (req, res) => {
    try {
      const { timeRange = '30d', type = 'inquiry' } = req.query;
      const trendData = await BusinessModel.getTrendData(timeRange, type);
      res.json({
        code: 200,
        message: '获取仪表盘趋势数据成功',
        data: trendData
      });
    } catch (error) {
      console.error('获取仪表盘趋势数据失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取仪表盘趋势数据失败',
        error: error.message
      });
    }
  });

  // 仪表盘险种分布数据路由
  router.get('/insurance', async (req, res) => {
    try {
      const insuranceData = await BusinessModel.getInsuranceDistribution();
      res.json({
        code: 200,
        message: '获取仪表盘险种分布数据成功',
        data: insuranceData
      });
    } catch (error) {
      console.error('获取仪表盘险种分布数据失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取仪表盘险种分布数据失败',
        error: error.message
      });
    }
  });

  return router;
}