const BannerModel = require('../models/bannerModel')
const log = require('../utils/logger')

// 获取轮播图列表
const getBannerList = async (req, res) => {
  try {
    const { position = 'home' } = req.query
    
    const banners = await BannerModel.getByPosition(position)
    
    log.info('获取轮播图列表成功', { count: banners.length, position })
    
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
    
    const banner = await BannerModel.findById(id)
    
    if (!banner) {
      return res.status(404).json({
        code: 404,
        message: '轮播图不存在'
      })
    }
    
    log.info('获取轮播图详情成功', { bannerId: id })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: banner
    })
  } catch (error) {
    log.error('获取轮播图详情失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '获取轮播图详情失败'
    })
  }
}

// 获取所有轮播图位置
const getBannerPositions = async (req, res) => {
  try {
    const positions = await BannerModel.getPositions()
    
    log.info('获取轮播图位置成功', { count: positions.length })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: positions
    })
  } catch (error) {
    log.error('获取轮播图位置失败', { error: error.message })
    res.status(500).json({
      code: 500,
      message: '获取轮播图位置失败'
    })
  }
}

module.exports = {
  getBannerList,
  getBannerDetail,
  getBannerPositions
}
