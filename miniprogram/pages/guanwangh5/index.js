// miniprogram/pages/guanwnagh5/index.js
var app = getApp();
const db = wx.cloud.database()
const _ = db.command
const util = require("../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardCur: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      guanwang:wx.getStorageSync('guanwang'),
      jiazai:true
    })
    this.setData({
      text:this.data.guanwang.gsjs.replace(/&/g,'\n'),
      swiperList:this.data.guanwang.zhizizhengshu
    })
    this.towerSwiper('swiperList');
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (e) {
    
  },

  //地图
  weizhi(){
    var that = this
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success (res) {
        const latitude = that.data.guanwang.markers[0].latitude
        const longitude = that.data.guanwang.markers[0].longitude
        wx.openLocation({
          latitude,
          longitude,
          scale: 18,
          name:that.data.guanwang.name,
          address:that.data.guanwang.address
        })
      },
      fail(res){
        wx.showToast({
          title: '请开启位置授权',
          icon: 'none',
          duration: 2000
        })
      }
     })
  },

  //拨打电话
  call(){
    var that = this
    wx.makePhoneCall({
      phoneNumber: that.data.guanwang.call
    })
  },

  //浏览视频/图片
  gopreviewMedia(e){
    var that = this
    var id = e.currentTarget.dataset.id
    wx.previewMedia({
      sources:[{url:that.data.guanwang.swiperList[id].url,type:that.data.guanwang.swiperList[id].type}],
      current:0,
      url:that.data.guanwang.swiperList[id].url
    })
  },

  //公众号文章
  gogzh(e){
    var that = this
    var id = e.currentTarget.dataset.id
    wx.setStorageSync("gzhid", that.data.guanwang.qiyezixun[id].url);
    wx.navigateTo({
      url:'/pages/gongzhonghao/gongzhonghao'
    })
  },

  // cardSwiper
  cardSwiper(e) {
    this.setData({
      cardCur: e.detail.current
    })
  },
  // 初始化towerSwiper
  towerSwiper(name) {
    let list = this.data[name];
    for (let i = 0; i < list.length; i++) {
      list[i].zIndex = parseInt(list.length / 2) + 1 - Math.abs(i - parseInt(list.length / 2))
      list[i].mLeft = i - parseInt(list.length / 2)
    }
    this.setData({
      swiperList: list
    })
    console.log(this.data.swiperList)
  },
  // towerSwiper触摸开始
  towerStart(e) {
    this.setData({
      towerStart: e.touches[0].pageX
    })
  },
  // towerSwiper计算方向
  towerMove(e) {
    this.setData({
      direction: e.touches[0].pageX - this.data.towerStart > 0 ? 'right' : 'left'
    })
  },
  // towerSwiper计算滚动
  towerEnd(e) {
    let direction = this.data.direction;
    let list = this.data.swiperList;
    if (direction == 'right') {
      let mLeft = list[0].mLeft;
      let zIndex = list[0].zIndex;
      for (let i = 1; i < list.length; i++) {
        list[i - 1].mLeft = list[i].mLeft
        list[i - 1].zIndex = list[i].zIndex
      }
      list[list.length - 1].mLeft = mLeft;
      list[list.length - 1].zIndex = zIndex;
      this.setData({
        swiperList: list
      })
    } else {
      let mLeft = list[list.length - 1].mLeft;
      let zIndex = list[list.length - 1].zIndex;
      for (let i = list.length - 1; i > 0; i--) {
        list[i].mLeft = list[i - 1].mLeft
        list[i].zIndex = list[i - 1].zIndex
      }
      list[0].mLeft = mLeft;
      list[0].zIndex = zIndex;
      this.setData({
        swiperList: list
      })
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