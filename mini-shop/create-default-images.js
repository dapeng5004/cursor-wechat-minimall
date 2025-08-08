const fs = require('fs');
const path = require('path');

// 创建一个简单的SVG图片作为默认图片
const createDefaultSVG = (width = 300, height = 200, text = '默认图片', bgColor = '#f0f0f0') => {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${bgColor}"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#666" text-anchor="middle" dy=".3em">${text}</text>
  </svg>`;
};

// 需要创建的默认图片文件列表
const defaultImages = [
  {
    path: 'images/default/banner.png',
    content: createDefaultSVG(800, 400, '轮播图', '#e3f2fd')
  },
  {
    path: 'images/default/goods.png',
    content: createDefaultSVG(400, 400, '商品图片', '#f3e5f5')
  },
  {
    path: 'images/default/category.png',
    content: createDefaultSVG(200, 200, '分类图片', '#e8f5e8')
  },
  {
    path: 'images/default/avatar.png',
    content: createDefaultSVG(100, 100, '头像', '#fff3e0')
  }
];

console.log('开始创建小程序默认图片文件...');

defaultImages.forEach(file => {
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

console.log('小程序默认图片文件创建完成！'); 