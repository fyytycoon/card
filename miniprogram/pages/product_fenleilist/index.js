const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    CustomBar: app.globalData.CustomBar,
    checkbox: [],
    swiperList:[]
  },
  onShow(){
    this.goswiperList()
  },

  //获取分类列表
  goswiperList(){
    var that = this
    var _onejifenleilist=[];
    db.collection('productfenlei').where({ organizationid:app.globalData.dongminguser.organizationid }).get().then(res => {
      if (res.data.length == 0) {
        that.setData({
          jiazai:true
        })
        return false
      }else{
        for (var x in res.data) {
          if (res.data[x].pid == 0) {
            _onejifenleilist.push(res.data[x])
          }
        }
      }
      that.setData({
        swiperList: res.data,
        onejifenleilist: _onejifenleilist,
        jiazai:true
      })
      console.log('管理员分类=>',that.data.swiperList)
      app.globalData.guanlifenleidata = that.data.swiperList
      app.globalData.onejifenleilist = that.data.onejifenleilist;
    })
  },

  //该方法绑定了页面滑动到底部的事件
  onReachBottom: function () {
    this.goswiperList();
  },

  //修改分类
  gotoform(e){
    let that = this
    console.log('跳转=>/pages/product_fenlei/form?id=',e.currentTarget.dataset.target)
    wx.navigateTo({
      url: "/pages/product_fenlei/form?id=" + e.currentTarget.dataset.target
    })
  },

  //新add分类
  gotonewform(e){
    if(this.data.swiperList.length < 20){
      wx.navigateTo({
        url: "/pages/product_fenlei/form"
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

  //删除按钮
  showModal(e) {
    let that = this
    let idz = that.data.swiperList[e.currentTarget.dataset.target]._id
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
            name:'productfenlei',
            data:{
              _id:idz,
              isUse:false,
            },
            success: res => {
              wx.hideLoading()
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              })
              console.log('[云函数_productfenlei] success=>', res)
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
              console.log('[云函数_productfenlei] success=>',res)
            }
          })
        }
      }
    })
  },
})