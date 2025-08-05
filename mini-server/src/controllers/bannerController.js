const { executeQuery } = require('../utils/database')
const log = require('../utils/logger')

// 获取轮播图列表
const getBannerList = async (req, res) => {
  try {
    const banners = await executeQuery(
      'SELECT * FROM banners WHERE status = 1 ORDER BY sort ASC, id ASC'
    )
    
    log.info('获取轮播图列表成功', { count: banners.length })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: banners
    })
  } catch (error) {
    log.error('获取轮播图列表失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '获取轮播图列表失败'
    })
  }
}

// 获取轮播图详情
const getBannerDetail = async (req, res) => {
  try {
    const { id } = req.params
    
    const banners = await executeQuery(
      'SELECT * FROM banners WHERE id = ? AND status = 1',
      [id]
    )
    
    if (banners.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '轮播图不存在'
      })
    }
    
    log.info('获取轮播图详情成功', { bannerId: id })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: banners[0]
    })
  } catch (error) {
    log.error('获取轮播图详情失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '获取轮播图详情失败'
    })
  }
}

module.exports = {
  getBannerList,
  getBannerDetail
}
