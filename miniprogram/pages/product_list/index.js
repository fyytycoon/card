var app = getApp();
// pages/product_list/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:1,
    hidden:true,
    ceshilist:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      id:options.id
    })
    wx.cloud.database().collection('productfenlei').where({_id:options.id}).get().then(res=>{
      console.log(res)
      this.setData({
        fenleiname:res.data[0].name
      })
    })
    this.getList();
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getList();
  },
  getList(){
    var self = this;
    var _page = self.data.page;
    self.setData({
      hidden: false
    })
    //获取分类商品
    wx.cloud.database().collection('productdata').where({categoryId:self.data.id}).skip((_page - 1) * 6).limit(6).get().then(res=>{
        if (res.data.length == 0) {
          wx.showToast({
            title: res.data.msg
          })
          self.setData({
            hidden: true
          })
          return false
        }
      self.setData({
        page : _page+1,
        list:res.data
      });//当前页页数+1
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
      self.setData({
        hidden: true
      })
    })

        
    
  }
})