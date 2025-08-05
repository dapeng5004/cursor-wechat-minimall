const axios = require('axios')

async function testStatsAPI() {
  try {
    console.log('正在测试统计API接口...\n')
    
    const baseURL = 'http://localhost:3001'
    
    // 测试销售统计
    console.log('1. 测试销售统计接口...')
    const salesRes = await axios.get(`${baseURL}/admin/stats/sales?type=month`)
    console.log('销售统计响应:', JSON.stringify(salesRes.data, null, 2))
    
    // 测试订单统计
    console.log('\n2. 测试订单统计接口...')
    const orderRes = await axios.get(`${baseURL}/admin/stats/orders`)
    console.log('订单统计响应:', JSON.stringify(orderRes.data, null, 2))
    
    // 测试转化率统计
    console.log('\n3. 测试转化率统计接口...')
    const conversionRes = await axios.get(`${baseURL}/admin/stats/conversion`)
    console.log('转化率统计响应:', JSON.stringify(conversionRes.data, null, 2))
    
    // 测试销售趋势
    console.log('\n4. 测试销售趋势接口...')
    const trendRes = await axios.get(`${baseURL}/admin/stats/sales-trend?days=7`)
    console.log('销售趋势响应:', JSON.stringify(trendRes.data, null, 2))
    
    // 测试热销商品
    console.log('\n5. 测试热销商品接口...')
    const goodsRes = await axios.get(`${baseURL}/admin/stats/hot-goods?limit=5`)
    console.log('热销商品响应:', JSON.stringify(goodsRes.data, null, 2))
    
    console.log('\n✅ 所有统计API测试完成！')
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message)
  }
}

testStatsAPI() 