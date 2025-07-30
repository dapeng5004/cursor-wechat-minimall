import { defineStore } from 'pinia'
import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    userInfo: {},
    roles: []
  }),
  
  getters: {
    isLogin: (state) => !!state.token
  },
  
  actions: {
    // 登录
    async login(userInfo) {
      try {
        const response = await login(userInfo)
        this.token = response.token
        setToken(response.token)
        return response
      } catch (error) {
        throw error
      }
    },
    
    // 获取用户信息
    async getInfo() {
      try {
        const response = await getInfo()
        this.userInfo = response
        this.roles = response.roles || []
        return response
      } catch (error) {
        // 如果getInfo失败，使用登录时保存的用户信息
        console.warn('获取用户信息失败，使用登录信息:', error)
        return this.userInfo
      }
    },
    
    // 退出登录
    async logout() {
      try {
        await logout()
        this.token = ''
        this.userInfo = {}
        this.roles = []
        removeToken()
      } catch (error) {
        throw error
      }
    }
  }
}) 