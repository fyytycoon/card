// miniprogram/pages/fyy/form.js
const app = getApp();
const db = wx.cloud.database()
const _ = db.command
const util = require("../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  uploadform(e){
    var that = this;
    var imgurl = e.detail.value.imgurl
    var id = e.detail.value.id
    var cardid = e.detail.value.cardid
    if (imgurl == ""){
      wx.showModal({
        title: '提示',
        content: '请填写',
        showCancel:false
      })
      return
    }
    if (id == ""){
      wx.showModal({
        title: '提示',
        content: '请填写',
        showCancel:false
      })
      return
    }
    if (cardid == ""){
      wx.showModal({
        title: '提示',
        content: '请填写',
        showCancel:false
      })
      return
    }
    const doc = {
      imgurl : imgurl,
      id : id,
      cardid : cardid
    }
    db.collection('guanggaowei').add({
      data: doc,
    })
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