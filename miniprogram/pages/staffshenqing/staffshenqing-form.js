// miniprogram/pages/staffshenqing/staffshenqing-form.js
const app = getApp();
const db = wx.cloud.database()
const _ = db.command
const util = require("../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperList:[],
    page:1,//当前tab页的页码数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.goswiperList()
  },

  goswiperList(){
    var that = this
    var _page = that.data.page;
    db.collection('organizationstaff').where({organizationid:app.globalData.dongminguser.organizationid,dz:false}).skip((_page - 1) * 15).limit(15).get().then(res=>{
      if(res.data.length == 0){
        return false
      }
      if(_page == 1){
        that.setData({
          swiperList: res.data,
          page: _page + 1
        })
      }else{
        that.setData({
          swiperList: that.data.swiperList.concat(res.data),
          page: _page + 1
        })
      }
      console.log(that.data.swiperList)
    })
  },

  //该方法绑定了页面滑动到底部的事件
  onReachBottom: function () {
    var self = this;
    self.goswiperList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  gotoform: function(e){
    var that = this
    var index = e.currentTarget.dataset.target
    console.log(index)
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      // 云函数名称
      name: 'organizationstaff',
      // 传给云函数的参数
      data: {
        _id: that.data.swiperList[index]._id,
        _openid: that.data.swiperList[index]._openid,
        organization: app.globalData.dongminguser.organization,
        organizationid: app.globalData.dongminguser.organizationid,
      },
      success: res => {
        wx.hideLoading()
        console.log('[staffshenqing.js][organizationstaff] [update]=>', res)
        that.data.swiperList.splice(index,1)
        that.setData({
          swiperList:that.data.swiperList
        })
        console.log(that.data.swiperList)
      },
      fail: res => {
        console.log('[staffshenqing.js][organizationstaff] [update]=>', res)
      }
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})