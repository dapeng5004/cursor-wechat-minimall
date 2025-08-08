// components/loading/loading.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 是否显示加载组件
    show: {
      type: Boolean,
      value: false
    },
    // 加载类型：spinner | circle | dots | wave | pulse
    type: {
      type: String,
      value: 'spinner'
    },
    // 加载文字
    text: {
      type: String,
      value: '加载中...'
    },
    // 是否显示遮罩层
    mask: {
      type: Boolean,
      value: true
    },
    // 样式类型：normal | inline | small
    style: {
      type: String,
      value: 'normal'
    },
    // 自动隐藏时间（毫秒），0表示不自动隐藏
    autoHide: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    timer: null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 显示加载
     */
    showLoading() {
      this.setData({
        show: true
      });
      
      // 设置自动隐藏
      if (this.data.autoHide > 0) {
        this.setAutoHide();
      }
    },

    /**
     * 隐藏加载
     */
    hideLoading() {
      this.setData({
        show: false
      });
      
      // 清除定时器
      if (this.data.timer) {
        clearTimeout(this.data.timer);
        this.setData({
          timer: null
        });
      }
    },

    /**
     * 设置自动隐藏
     */
    setAutoHide() {
      if (this.data.timer) {
        clearTimeout(this.data.timer);
      }
      
      const timer = setTimeout(() => {
        this.hideLoading();
        // 触发自动隐藏事件
        this.triggerEvent('autohide');
      }, this.data.autoHide);
      
      this.setData({
        timer: timer
      });
    },

    /**
     * 点击遮罩层
     */
    onMaskTap() {
      // 触发遮罩点击事件
      this.triggerEvent('masktap');
    }
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      // 组件实例进入页面节点树时执行
      if (this.data.show && this.data.autoHide > 0) {
        this.setAutoHide();
      }
    },
    
    detached() {
      // 组件实例被从页面节点树移除时执行
      if (this.data.timer) {
        clearTimeout(this.data.timer);
      }
    }
  },

  /**
   * 数据监听器
   */
  observers: {
    'show': function(show) {
      if (show && this.data.autoHide > 0) {
        this.setAutoHide();
      } else if (!show && this.data.timer) {
        clearTimeout(this.data.timer);
        this.setData({
          timer: null
        });
      }
    }
  }
});