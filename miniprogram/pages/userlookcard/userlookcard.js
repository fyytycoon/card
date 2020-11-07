// pages/userlookcard/userlookcard.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const util = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userlist:[],
    page:1,//当前tab页的页码数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.gouserlist()
  },
  
  //获取列表
  gouserlist(){
    var that = this
    var _page = that.data.page;
    db.collection("userlookcard").where({cardopenid:wx.getStorageSync('openid'),_openid:_.neq(wx.getStorageSync('openid'))}).skip((_page - 1) * 15).limit(15).get().then(res=>{
      console.log(res.data)
      if(res.data.length == 0){
        that.setData({
          jiazai:true
        })
        return false
      }
      if(_page == 1){
        that.setData({
          userlist: res.data,
          page: _page + 1
        })
      }else{
        that.setData({
          userlist: that.data.userlist.concat(res.data),
          page: _page + 1
        })
      }
      that.setData({
        jiazai:true
      })
      console.log('谁看过我列表=>',that.data.userlist)
    })
  },

  //该方法绑定了页面滑动到底部的事件
  onReachBottom: function () {
    this.gouserlist();
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

  call(e){
    console.log(e.currentTarget.dataset.v.phone)
    var phone = e.currentTarget.dataset.v.phone
    if(phone){
      wx.makePhoneCall({
        phoneNumber: phone
      })
    }else{
      wx.showToast({
        title: '对方未授权',
        icon: 'none',
        duration: 2000
      })
      return
    }
  },

  

  // ListTouch触摸开始
  ListTouchStart(e) {
    this.setData({
      ListTouchStart: e.touches[0].pageX
    })
  },

  // ListTouch计算方向
  ListTouchMove(e) {
    this.setData({
      ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
    })
  },

  // ListTouch计算滚动
  ListTouchEnd(e) {
    if (this.data.ListTouchDirection =='left'){
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    } else {
      this.setData({
        modalName: null
      })
    }
    this.setData({
      ListTouchDirection: null
    })
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