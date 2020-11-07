//获取应用实例
var app = getApp();
const db = wx.cloud.database();
const _ = db.command
Page({
  data: {
    banners: [],//轮播数组
    currentTab: 0,//当前tab页
    tlist:[],//分类数组
    page:1,//当前tab页的页码数
    navigate_type:'',//分类类型，是否包含二级分类
    list:[],//当前页产品数据
    noticeList:[],//公告信息
    coupons:[],//优惠券
    hasNoCoupons:true,//是否有优惠券
    hidden: true ,//加载动画显示与隐藏
    mtype:1,//加载更多动画显示类型
    slideWidth:'',//滑块宽
    slideLeft:0 ,//滑块位置
    totalLength:'',//当前滚动列表总长
    slideShow:false,
    slideRatio:'',
    producttextlist:[]
  },
  onLoad: function () {
    var self = this ;
    var systemInfo = wx.getSystemInfoSync() ;
    self.setData({
      tlist: app.globalData.tlist
    })
    if(!app.globalData.tlist.length == 0){
      
      var _list = [];
      for (var x in self.data.tlist) {
        _list.push([]);
      }
      self.setData({
        list: _list,
        windowHeight: app.globalData.navigate_type == 1 ? systemInfo.windowHeight : systemInfo.windowHeight - 35,
        windowWidth: systemInfo.windowWidth,
        navigate_type: app.globalData.navigate_type
      })
      console.log('分类对应产品=>',self.data.list)
      console.log('分类列表=>',self.data.tlist)
      self.getList();
      //计算比例
      self.getRatio();
    }
  },



  //根据分类获取比例
  getRatio(){
    var self = this ;
    if (!self.data.tlist[self.data.currentTab].secondList || self.data.tlist[self.data.currentTab].secondList.length<=5){
      this.setData({
        slideShow:false
      })
    }else{
      var _totalLength = self.data.tlist[self.data.currentTab].secondList.length * 150; //分类列表总长度
      var _ratio = 230 / _totalLength * (750 / this.data.windowWidth); //滚动列表长度与滑条长度比例
      var _showLength = 750 / _totalLength * 230; //当前显示红色滑条的长度(保留两位小数)
      this.setData({
        slideWidth: _showLength,
        totalLength: _totalLength,
        slideShow: true,
        slideRatio:_ratio
      })
    }
  } ,
  
  //下拉刷新
  onPullDownRefresh: function () {
    var param = {}, str1 = "list[" + this.data.currentTab + "]";
    param[str1] = [];
    param.page = 1 ;
    param.mtype= 1 ;
    this.setData(param); //当前页数据清空
    this.getList(); //重新请求
  },
  //该方法绑定了页面滑动到底部的事件
  onReachBottom: function () {
    var self = this;
    self.getList();
  },
  //获取商品列表
  getList(){
    var self = this ;
    var current = self.data.currentTab ; 
    var _page = self.data.page;
    self.setData({
      hidden : false
    })
    //获取分类商品
    db.collection('productdata').where({categoryoneId:self.data.tlist[current].firstType._id,organizationid:app.globalData.userProfile.organizationid}).skip((_page - 1) * 6).limit(6).get().then(res=>{
      
      if (res.data.length == 0) {
        self.setData({
          mtype:3
        })
        return false
      }
      var param = {}, str1 = "list[" + current + "]";
      if(self.data.page == 1){
        param[str1] =  res.data;
      }else{
        param[str1] = self.data.list[current].concat(res.data);
      }
      param.page = _page+1 ; 
      self.setData(param);//当前页页数+1
      wx.stopPullDownRefresh() //停止下拉刷新
      self.setData({
        hidden: true
      })
      console.log(self.data.list)
    })
        
  } ,
  // 点击tab切换 
  swichNav: function (res) {

    if (this.data.currentTab == res.detail.currentNum) return;
    this.setData({
      currentTab: res.detail.currentNum,
      page:1,
      mtype:1
    })
    console.log('当前tab=>',this.data.currentTab)
    this.getList();
    this.getRatio();
  } ,
  getProductList(e){
    var _id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/product_list/index?id=" + _id
    })
  } ,
  getleft(e){
    //slideLeft动态变化
    this.setData({
      slideLeft: e.detail.scrollLeft * this.data.slideRatio
    })
  } 
})
