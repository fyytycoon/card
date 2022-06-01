const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    CustomBar: app.globalData.CustomBar,
    menuBorder:true,
    checkbox: [],
    swiperList:[],
    page:1,//当前tab页的页码数
    productlist:[]
  },
  onShow(){
    this.goproductlist()
  },

  //获取产品列表
  goproductlist(){
    var that = this
    var _page = that.data.page;
    wx.cloud.database().collection('productdata').where({organizationid:app.globalData.dongminguser.organizationid}).skip((_page - 1) * 15).limit(15).get().then(res=>{
      if(res.data.length == 0){
        that.setData({
          jiazai:true
        })
        return false
      }
      if(_page == 1){
        that.setData({
          productlist: res.data,
          page: _page + 1
        })
      }else{
        that.setData({
          productlist: that.data.productlist.concat(res.data),
          page: _page + 1
        })
      }
      that.setData({
        jiazai:true
      })
      console.log('产品列表',that.data.productlist)
      app.globalData.guanlichanpinliList = that.data.productlist
    })
  },

  //该方法绑定了页面滑动到底部的事件
  onReachBottom: function () {
    console.log('onReachBottom')
    var self = this;
    self.goproductlist();
  },

  //新add分类
  gotonewform(e){
    wx.navigateTo({
      url: "/pages/product_data/form"
    })
  },

  //修改分类
  gotoform(e){
    let that = this
    console.log('跳转=>/pages/product_data/form?id=',e.currentTarget.dataset.target)
    wx.navigateTo({
      url: "/pages/product_data/form?id=" + e.currentTarget.dataset.target
    })
  },
  
  //删除按钮
  showModal(e) {
    let that = this
    let idz = that.data.productlist[e.currentTarget.dataset.target]._id
    wx.showModal({
      title: '',
      content: '是否要删除？',
      cancelText: '否',
      confirmText: '是',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中...',
            icon: 'loading',
            duration: 2000
          })
          wx.cloud.callFunction({
            name:'productdata-add',
            data:{
              _id:idz,
              flag:false,
            },
            success: res => {
              wx.hideLoading()
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              })
              console.log('[云函数_productdata-add] success=>', res)
              setTimeout(function(){
                wx.navigateBack()
              },2500)
            },
            fail: res => {
              wx.hideLoading()
              wx.showToast({
                title: '删除失败',
                icon: 'none',
                duration: 2000
              })
              setTimeout(function(){
                wx.navigateBack()
              },2500)
              console.log('[云函数_productdata-add] success=>',res)
            }
          })
        }
      }
    })
    
  },
})