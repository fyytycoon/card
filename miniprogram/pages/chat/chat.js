const app = getApp();
const db = wx.cloud.database()
const _ = db.command
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    takeSession: false,
    requestResult: '',

    // functions for used in chatroom components
    onGetUserInfo: null,
    getOpenID: null,
    
    
  },
  onLoad(e){
    console.log(e)
    this.setData({
      openId:e.userid,
      lookopenId:e.cardid,
      nickname:e.nickname,
      groupId: e.cardid+'@'+e.userid,
      userInfo:app.globalData.userInfo,
      dis:e.dis
    })
    if(e.dis == '0'){
      this.setData({
        cardInfo:app.globalData.userProfile
      })
    }
    if(e.dis == '1'){
      this.setData({
        cardInfo:[],
        userInfo:{avatarUrl: app.globalData.userProfile.img[0],nickName: app.globalData.userProfile.name}
      })
    }
    wx.getSystemInfo({
      success: res => {
        console.log('system info', res)
        if (res.safeArea) {
          const { top, bottom } = res.safeArea
          this.setData({
            containerStyle: `padding-top: ${(/ios/i.test(res.system) ? 10 : 20) + top}px; padding-bottom: ${20 + res.windowHeight - bottom}px`,
          })
        }
      },
    })
    if(wx.getStorageSync('openid') == this.data.lookopenId){
      wx.cloud.callFunction({
        // 云函数名称
        name: 'chatlist',
        // 传给云函数的参数
        data: {
          nums:0,
          cardid: wx.getStorageSync('openid')
        },
        complete: res => {
          console.log('[app.js][chatlist][over] =>', res)
        }
      })
    }
  },


  
})