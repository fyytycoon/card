// miniprogram/pages/binding/bindingform.js
const app = getApp();
const db = wx.cloud.database()
const _ = db.command
const util = require("../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: null,
    picker: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    db.collection('organizationlist').where({dz:true}).get().then(res=>{
      this.setData({
        picker:res.data
      })
    })
  },

  getUserInfo(e){
    var that = this
    var index = that.data.index
    if (index == null){
      wx.showModal({
        title: '提示',
        content: '请选择企业',
        showCancel:false
      })
      return
    }
    const doc = {
      organizationid: that.data.picker[index]._id,
      organizationname: that.data.picker[index].name,
      openid: wx.getStorageSync('openid'),
      name: e.detail.userInfo.nickName,
      avatarUrl: e.detail.userInfo.avatarUrl,
      cardname:'',
      img:'',
      title:'',
      dz: false,
      time: util.formatTime(new Date()),
    }
    wx.getSetting({
      success:res=>{
        if (res.authSetting['scope.userInfo'] ) {
          console.log('已授权')
          db.collection('organizationstaff').add({
            data: doc,
          })
          wx.showModal({
            title: '提示',
            content: '已提交,等待审核认证',
            showCancel:false,
            success (res) {
              if(res.confirm){
                wx.navigateBack()
              }
            }
          })
        }else{
          console.log('没授权')
          wx.showModal({
            title: '提示',
            content: '请允许授权',
            showCancel:false
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  PickerChange(e) {
    this.setData({
      index: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})