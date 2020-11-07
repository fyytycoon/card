// miniprogram/pages/fyy/fyy.js
const app = getApp();
const db = wx.cloud.database()
const _ = db.command
const util = require("../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperList:[]
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
    this.goswiperList()
  },

  //获取分类列表
  goswiperList(){
    var that = this
    db.collection('guanggaowei').where({}).get().then(res => {
      if (res.data.length == 0) {
        return false
      }else{
        that.setData({
          swiperList: res.data,
        })
      }
    })
  },

  //add
  gotonewform(e){
    if(this.data.swiperList.length < 20){
      wx.navigateTo({
        url: "/pages/fyy/form"
      })
    }else{
      wx.showModal({
        title: '提示',
        content: '分类数量已达上限',
        showCancel:false
      })
      return
    }
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