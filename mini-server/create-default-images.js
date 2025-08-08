const fs = require('fs');
const path = require('path');

// 创建一个简单的SVG图片作为默认图片
const createDefaultSVG = (width = 300, height = 200, text = '默认图片') => {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f0f0f0"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#666" text-anchor="middle" dy=".3em">${text}</text>
  </svg>`;
};

// 需要创建的图片文件列表
const imageFiles = [
  {
    path: 'uploads/2025/07/31/file-1753931600851-330663896.jpg',
    content: createDefaultSVG(800, 400, '轮播图1')
  },
  {
    path: 'uploads/2025/07/31/file-1753931635826-410011327.jpg',
    content: createDefaultSVG(800, 400, '轮播图2')
  },
  {
    path: 'uploads/image-1754192984548-467454774.png',
    content: createDefaultSVG(800, 400, '轮播图3')
  },
  {
    path: 'uploads/2025/07/31/file-1753931154921-931001502.jpg',
    content: createDefaultSVG(800, 400, '轮播图4')
  },
  {
    path: 'uploads/banner/banner3.png',
    content: createDefaultSVG(800, 400, '品牌推荐')
  },
  {
    path: 'uploads/image-1754192954543-548233715.jpg',
    content: createDefaultSVG(800, 400, '限时特惠')
  },
  {
    path: 'uploads/image-1754196076358-757158485.jpg',
    content: createDefaultSVG(400, 400, 'SK-II神仙水')
  },
  {
    path: 'uploads/test.jpg',
    content: createDefaultSVG(400, 400, '测试商品')
  },
  {
    path: 'uploads/category/beauty.jpg',
    content: createDefaultSVG(200, 200, '美妆护肤')
  },
  {
    path: 'uploads/category/digital.jpg',
    content: createDefaultSVG(200, 200, '数码配件')
  },
  {
    path: 'uploads/category/sports.jpg',
    content: createDefaultSVG(200, 200, '运动户外')
  },
  {
    path: 'uploads/image-1754186030220-730886712.jpeg',
    content: createDefaultSVG(200, 200, '服装配饰')
  }
];

console.log('开始创建默认图片文件...');

imageFiles.forEach(file => {
  const fullPath = path.join(__dirname, file.path);
  const dir = path.dirname(fullPath);
  
  // 确保目录存在
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // 创建文件
  fs.writeFileSync(fullPath, file.content);
  console.log(`✅ 创建文件: ${file.path}`);
});

console.log('默认图片文件创建完成！'); 