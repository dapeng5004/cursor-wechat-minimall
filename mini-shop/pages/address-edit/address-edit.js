// pages/address-edit/address-edit.js
// 引入请求工具
const request = require('../../utils/request');

Page({
  data: {
    addressId: null,
    isEdit: false,
    loading: false,
    submitting: false,
    formData: {
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      isDefault: false
    },
    region: ['', '', ''],
    regionText: '请选择所在地区'
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        addressId: options.id,
        isEdit: true
      });
      this.loadAddressData(options.id);
    }
  },

  /**
   * 加载地址数据（编辑模式）
   */
  loadAddressData(addressId) {
    this.setData({ loading: true });
    
    request.get(`/api/address/${addressId}`).then(res => {
      if (res.code === 200) {
        const address = res.data;
        this.setData({
          formData: {
            name: address.name || '',
            phone: address.phone || '',
            province: address.province || '',
            city: address.city || '',
            district: address.district || '',
            detail: address.detail || '',
            isDefault: address.isDefault || false
          },
          region: [address.province || '', address.city || '', address.district || ''],
          regionText: this.getRegionText(address.province, address.city, address.district),
          loading: false
        });
      } else {
        wx.showToast({
          title: res.message || '获取地址失败',
          icon: 'error'
        });
        this.setData({ loading: false });
      }
    }).catch(err => {
      console.error('获取地址数据失败:', err);
      wx.showToast({
        title: '获取地址失败',
        icon: 'error'
      });
      this.setData({ loading: false });
    });
  },

  /**
   * 输入框变化处理
   */
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value
    });
  },

  /**
   * 地区选择器变化
   */
  onRegionChange(e) {
    const region = e.detail.value;
    const regionText = this.getRegionText(region[0], region[1], region[2]);
    
    this.setData({
      region: region,
      regionText: regionText,
      'formData.province': region[0],
      'formData.city': region[1],
      'formData.district': region[2]
    });
  },

  /**
   * 获取地区文本
   */
  getRegionText(province, city, district) {
    if (!province && !city && !district) {
      return '请选择所在地区';
    }
    return [province, city, district].filter(item => item).join(' ');
  },

  /**
   * 默认地址开关变化
   */
  onDefaultChange(e) {
    this.setData({
      'formData.isDefault': e.detail.value
    });
  },

  /**
   * 表单验证
   */
  validateForm() {
    const { formData } = this.data;
    
    if (!formData.name.trim()) {
      wx.showToast({
        title: '请输入收货人姓名',
        icon: 'error'
      });
      return false;
    }
    
    if (!formData.phone.trim()) {
      wx.showToast({
        title: '请输入手机号码',
        icon: 'error'
      });
      return false;
    }
    
    // 简单的手机号验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'error'
      });
      return false;
    }
    
    if (!formData.province || !formData.city || !formData.district) {
      wx.showToast({
        title: '请选择所在地区',
        icon: 'error'
      });
      return false;
    }
    
    if (!formData.detail.trim()) {
      wx.showToast({
        title: '请输入详细地址',
        icon: 'error'
      });
      return false;
    }
    
    return true;
  },

  /**
   * 保存地址
   */
  onSave() {
    if (!this.validateForm()) {
      return;
    }
    
    this.setData({ submitting: true });
    
    const { formData, addressId, isEdit } = this.data;
    const url = isEdit ? `/api/address/${addressId}` : '/api/address';
    const method = isEdit ? 'put' : 'post';
    
    request[method](url, formData).then(res => {
      if (res.code === 200) {
        wx.showToast({
          title: isEdit ? '修改成功' : '添加成功',
          icon: 'success'
        });
        
        // 返回上一页并刷新
        setTimeout(() => {
          const pages = getCurrentPages();
          const prevPage = pages[pages.length - 2];
          
          if (prevPage && prevPage.loadAddressData) {
            prevPage.loadAddressData();
          }
          
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({
          title: res.message || (isEdit ? '修改失败' : '添加失败'),
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error('保存地址失败:', err);
      wx.showToast({
        title: isEdit ? '修改失败' : '添加失败',
        icon: 'error'
      });
    }).finally(() => {
      this.setData({ submitting: false });
    });
  },

  /**
   * 删除地址
   */
  onDelete() {
    if (!this.data.isEdit) return;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个地址吗？',
      success: (res) => {
        if (res.confirm) {
          this.deleteAddress();
        }
      }
    });
  },

  /**
   * 删除地址请求
   */
  deleteAddress() {
    this.setData({ submitting: true });
    
    request.delete(`/api/address/${this.data.addressId}`).then(res => {
      if (res.code === 200) {
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });
        
        // 返回上一页并刷新
        setTimeout(() => {
          const pages = getCurrentPages();
          const prevPage = pages[pages.length - 2];
          
          if (prevPage && prevPage.loadAddressData) {
            prevPage.loadAddressData();
          }
          
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({
          title: res.message || '删除失败',
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error('删除地址失败:', err);
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      });
    }).finally(() => {
      this.setData({ submitting: false });
    });
  }
});