//index.js
//获取应用实例
var app = getApp();
const db = wx.cloud.database();
const _ = db.command
Page({
  data: {
    addressList:[]
  },

  selectTap: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.request({
      url:  app.globalData.baseUrl +'/user/shipping-address/update',
      data: {
        token:app.globalData.token,
        id:id,
        isDefault:'true'
      },
      success: (res) =>{
        wx.navigateBack({})
      }
    })
  },

  addAddess : function () {
    wx.navigateTo({
      url:"/pages/address-add/index"
    })
  },
  
  editAddess: function (e) {
    wx.navigateTo({
      url: "/pages/address-add/index?id=" + e.currentTarget.dataset.id
    })
  },
  
  onLoad: function () {
    console.log('onLoad')

   
  },
  onShow : function () {
    this.initShippingAddress();
  },
  initShippingAddress: function () {
    var that = this;
    db.collection('address').where({openid:wx.getStorageSync('openid')}).get().then(res=>{
      console.log(res.data)
      that.setData({
        addressList:res.data
      });
    })
  }

})
