// miniprogram/pages/card-holder/cardholder.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const util = require("../../utils/util.js");


Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:1,//当前tab页的页码数
    cardlist:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.gocardlist()
  },

  //该方法绑定了页面滑动到底部的事件
  onReachBottom: function () {
    this.gocardlist();
  },

  //获取名片列表
  gocardlist(){
    var that = this
    var _page = that.data.page;
    db.collection("userlookcard").where({_openid:wx.getStorageSync('openid')}).skip((_page - 1) * 15).limit(15).get().then(res=>{
      if(res.data.length == 0){
        that.setData({
          jiazai:true
        })
        return false
      }
      if(_page == 1){
        that.setData({
          cardlist:res.data,
          page: _page + 1
        })
      }else{
        that.setData({
          cardlist:that.data.cardlist.concat(res.data),
          page: _page + 1
        })
      }
      that.setData({
        jiazai: true
      })
      console.log('名片夹列表=>',that.data.cardlist)
    })
  },

  goindex(e){
    const openid = e.currentTarget.dataset.id
    wx.reLaunch({
      url: '/pages/index/index?id='+openid
    })
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