// 响应式工具类
export const BREAKPOINTS = {
  XS: 480,
  SM: 768,
  MD: 992,
  LG: 1200,
  XL: 1920
}

// 获取当前屏幕尺寸
export function getScreenSize() {
  const width = window.innerWidth
  if (width < BREAKPOINTS.XS) return 'xs'
  if (width < BREAKPOINTS.SM) return 'sm'
  if (width < BREAKPOINTS.MD) return 'md'
  if (width < BREAKPOINTS.LG) return 'lg'
  if (width < BREAKPOINTS.XL) return 'xl'
  return 'xxl'
}

// 检查是否为移动端
export function isMobile() {
  return window.innerWidth <= BREAKPOINTS.SM
}

// 检查是否为平板
export function isTablet() {
  return window.innerWidth > BREAKPOINTS.SM && window.innerWidth <= BREAKPOINTS.MD
}

// 检查是否为桌面端
export function isDesktop() {
  return window.innerWidth > BREAKPOINTS.MD
}

// 响应式监听器
export function createResponsiveListener(callback) {
  let currentSize = getScreenSize()
  
  const handleResize = () => {
    const newSize = getScreenSize()
    if (newSize !== currentSize) {
      currentSize = newSize
      callback(newSize, currentSize)
    }
  }
  
  window.addEventListener('resize', handleResize)
  
  // 返回清理函数
  return () => {
    window.removeEventListener('resize', handleResize)
  }
}

// 响应式Vue组合式函数
export function useResponsive() {
  import { ref, onMounted, onUnmounted } from 'vue'
  
  const screenSize = ref(getScreenSize())
  const isMobileScreen = ref(isMobile())
  const isTabletScreen = ref(isTablet())
  const isDesktopScreen = ref(isDesktop())
  
  const updateScreenInfo = () => {
    screenSize.value = getScreenSize()
    isMobileScreen.value = isMobile()
    isTabletScreen.value = isTablet()
    isDesktopScreen.value = isDesktop()
  }
  
  let cleanup = null
  
  onMounted(() => {
    cleanup = createResponsiveListener(updateScreenInfo)
  })
  
  onUnmounted(() => {
    if (cleanup) {
      cleanup()
    }
  })
  
  return {
    screenSize,
    isMobile: isMobileScreen,
    isTablet: isTabletScreen,
    isDesktop: isDesktopScreen,
    updateScreenInfo
  }
}

// 响应式样式类
export const RESPONSIVE_CLASSES = {
  // 隐藏类
  HIDDEN_XS: 'hidden-xs',
  HIDDEN_SM: 'hidden-sm',
  HIDDEN_MD: 'hidden-md',
  HIDDEN_LG: 'hidden-lg',
  HIDDEN_XL: 'hidden-xl',
  
  // 显示类
  VISIBLE_XS: 'visible-xs',
  VISIBLE_SM: 'visible-sm',
  VISIBLE_MD: 'visible-md',
  VISIBLE_LG: 'visible-lg',
  VISIBLE_XL: 'visible-xl',
  
  // 文本响应式
  TEXT_RESPONSIVE: 'text-responsive',
  
  // 间距响应式
  SPACING_RESPONSIVE: 'spacing-responsive'
}

// 获取响应式类名
export function getResponsiveClasses(size, type = 'hidden') {
  const classes = []
  
  switch (size) {
    case 'xs':
      classes.push(type === 'hidden' ? RESPONSIVE_CLASSES.HIDDEN_XS : RESPONSIVE_CLASSES.VISIBLE_XS)
      break
    case 'sm':
      classes.push(type === 'hidden' ? RESPONSIVE_CLASSES.HIDDEN_SM : RESPONSIVE_CLASSES.VISIBLE_SM)
      break
    case 'md':
      classes.push(type === 'hidden' ? RESPONSIVE_CLASSES.HIDDEN_MD : RESPONSIVE_CLASSES.VISIBLE_MD)
      break
    case 'lg':
      classes.push(type === 'hidden' ? RESPONSIVE_CLASSES.HIDDEN_LG : RESPONSIVE_CLASSES.VISIBLE_LG)
      break
    case 'xl':
      classes.push(type === 'hidden' ? RESPONSIVE_CLASSES.HIDDEN_XL : RESPONSIVE_CLASSES.VISIBLE_XL)
      break
  }
  
  return classes
}

// 响应式表格列配置
export function getResponsiveTableColumns(columns) {
  return columns.map(col => ({
    ...col,
    minWidth: col.minWidth || 100,
    showOverflowTooltip: col.showOverflowTooltip !== false,
    // 移动端隐藏某些列
    hidden: isMobile() ? col.mobileHidden : false
  }))
}

// 响应式表单布局
export function getResponsiveFormLayout() {
  if (isMobile()) {
    return {
      labelWidth: '80px',
      labelPosition: 'top'
    }
  } else if (isTablet()) {
    return {
      labelWidth: '100px',
      labelPosition: 'left'
    }
  } else {
    return {
      labelWidth: '120px',
      labelPosition: 'left'
    }
  }
}

// 响应式对话框配置
export function getResponsiveDialogConfig() {
  if (isMobile()) {
    return {
      width: '90%',
      top: '5vh'
    }
  } else if (isTablet()) {
    return {
      width: '70%',
      top: '10vh'
    }
  } else {
    return {
      width: '50%',
      top: '15vh'
    }
  }
}

export default {
  BREAKPOINTS,
  getScreenSize,
  isMobile,
  isTablet,
  isDesktop,
  createResponsiveListener,
  useResponsive,
  RESPONSIVE_CLASSES,
  getResponsiveClasses,
  getResponsiveTableColumns,
  getResponsiveFormLayout,
  getResponsiveDialogConfig
} 