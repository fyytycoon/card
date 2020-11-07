const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({
	data: {
    dz:'',
    fyy: false,
    wxlogin: true,
    balance:0.00,
    freeze:0,
    score:0,
    growth:0,
    score_sign_continuous:0,
    rechargeOpen: false, // 是否开启充值[预存]功能
    // 用户订单统计数据
    count_id_no_confirm: 0,
    count_id_no_pay: 0,
    count_id_no_reputation: 0,
    count_id_no_transfer: 0,
    chatnum:0
  },
	onLoad() {
    console.log('[my.js] onLoad()')
    var that = this
    that.setData({
      apiUserInfoMap:app.globalData.userInfo,
      iscarduser:app.globalData.dongminguser.iscarduser,
      dongminguser:app.globalData.dongminguser
    })
    if(wx.getStorageSync('openid') == 'oDmvK5el0YsVj0sLiqTFB7yuT1eI'){
      that.setData({
        fyy:true,
      })
    }
    
    db.collection('organizationstaff').where({_openid:wx.getStorageSync('openid')}).get().then(res=>{
      if(res.data.length !== 0){
        that.setData({
          dz: res.data[0].dz
        })
      }
    })
    db.collection('organizationlist').where({_openid: wx.getStorageSync('openid')}).get().then(res=>{
      if(!res.data.length == 0){
        that.setData({
          guangli: true
        })
      }
      if(res.data.length !== 0 && !res.data[0].dz ){
        that.setData({
          daishenhe: true
        })
      }
      if(res.data.length !== 0 && res.data[0].dz){
        that.setData({
          yitongguo:true
        })
      }
    })
	},
  onShow() {
    const _this = this
    const order_hx_uids = wx.getStorageSync('order_hx_uids')
    _this.setData({
      version: "7.9.0",
      order_hx_uids
    })
    db.collection('carduser_list').where({_openid:wx.getStorageSync('openid')}).get().then(res=>{
      if(!res.data.length == 0){
        _this.setData({
          wodemingpian: true
        })
      }
    })
    db.collection('chatlist').where({cardid:wx.getStorageSync('openid'),nums:_.neq(0)}).get().then(res=>{
      _this.setData({
        chatnum:res.data.length
      })
    })
  },

  //我的名片
  gowodemingpian(){
    wx.reLaunch({
      url: '/pages/index/index?id='+wx.getStorageSync('openid')
    })
  },

  //绑定企业
  gobinding(){
    console.log(this.data.dz)
    if(this.data.dz === true){
      wx.showModal({
        title: '提示',
        content: '已通过审核',
        showCancel:false,
      })
    }else if(this.data.dz === false){
      wx.showModal({
        title: '提示',
        content: '已提交,等待审核认证',
        showCancel:false,
      })
    }else{
      wx.navigateTo({
        url: "/pages/binding/bindingform"
      })
    }
  },

  gofenleilist(){
    wx.navigateTo({
      url: "/pages/product_fenleilist/index"
    })
  },

  godatalist(){
    wx.navigateTo({
      url: "/pages/product_datalist/index"
    })
  },

  gouserlook(){
    wx.navigateTo({
      url: "/pages/userlookcard/userlookcard"
    })
  },

  goform(){
    wx.navigateTo({
      url: "/pages/form/form"
    })
  },

  aboutUs : function () {
    wx.showModal({
      title: '关于我们',
      content: '太原东明技术支持',
      showCancel:false
    })
  },

  //企业认证
  goqiyerenzheng(){
    
      if(this.data.daishenhe ){
        wx.showModal({
          title: '提示',
          content: '已提交，待审核',
          showCancel:false
        })
      }else if(this.data.yitongguo){
        wx.showModal({
          title: '提示',
          content: '已提交，已通过审核',
          showCancel:false
        })
      }else{
        wx.navigateTo({
          url: "/pages/attestation/attestation-form"
        })
      }
  },

  //企业管理
  goqiyeguanli(){
    wx.navigateTo({
      url: "/pages/qiyeshezhi/qiyeshezhi"
    })
  },

  //授权
  onGetUserInfo: function(e){
    console.log(e)
    wx.getSetting({
      success: res1 => {
        if (res1.authSetting['scope.userInfo'] ) {
          console.log('已授权')
          wx.cloud.callFunction({
            // 云函数名称
            name: 'user-add',
            // 传给云函数的参数
            data: {
              nick_name: e.detail.userInfo.nickName,
              gender: e.detail.userInfo.gender,
              language: e.detail.userInfo.language,
              city: e.detail.userInfo.city,
              province: e.detail.userInfo.province,
              avatar_url: e.detail.userInfo.avatarUrl,
              country: e.detail.userInfo.country,
              openid: wx.getStorageSync('openid'),
              localStorageTime:''
            },
            complete: res => {
              app.globalData.userInfo = e.detail.userInfo;
              this.setData({
                apiUserInfoMap:e.detail.userInfo
              })
              console.log('[index.js][user-add] =>', res)
              console.log('[index.js][app . userInfo] =>', app.globalData.userInfo)
            }
          })
        }else{
          console.log('没授权')
        }
      }
    })
  },

  //下来刷新
  onPullDownRefresh: function() {
    // 页面相关事件处理函数--监听用户下拉动作
    db.collection('chatlist').where({cardid:wx.getStorageSync('openid'),nums:_.neq(0)}).get().then(res=>{
      this.setData({
        chatnum:res.data.length
      })
    })
    this.setData({
      apiUserInfoMap:app.globalData.userInfo
    })
  },

  loginOut(){
    // AUTH.loginOut()
    wx.reLaunch({
      url: '/pages/my/index'
    })
  },
  
  goScore: function () {
    wx.navigateTo({
      url: "/pages/score/index"
    })
  },
  goOrder: function (e) {
    wx.navigateTo({
      url: "/pages/order-list/index?type=" + e.currentTarget.dataset.type
    })
  },
  goChatlist(){
    wx.navigateTo({
      url: "/pages/chatlist/list"
    })
  },

  gofyy(){
    wx.navigateTo({
      url: '/pages/fyy/fyy',
    })
  },

  cancelLogin() {
    this.setData({
      wxlogin: true
    })
  },

  scanOrderCode(){
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        wx.navigateTo({
          url: '/pages/order-details/scan-result?hxNumber=' + res.result,
        })
      },
      fail(err) {
        console.error(err)
        wx.showToast({
          title: err.errMsg,
          icon: 'none'
        })
      }
    })
  },
  clearStorage(){
    wx.clearStorageSync()
    wx.showToast({
      title: '已清除',
      icon: 'success'
    })
  },
})