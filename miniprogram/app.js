const util = require("utils/util.js");
//app.js
App({
  onLaunch: function () {
    console.log('小程序初始化开始')
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'xxoo-xxoo',
        traceUser: true,
      })
    }
    // 登录
    this.goLogin();

    
      
    // 获取系统状态栏信息
    wx.getSystemInfo({
      success: e => {
        console.log(e)
        this.globalData.systrminfo = e;
        this.globalData.StatusBar = e.statusBarHeight;
        let capsule = wx.getMenuButtonBoundingClientRect();
        console.log(capsule)
        if (capsule) {
          this.globalData.Custom = capsule;
          this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
        } else {
          this.globalData.CustomBar = e.statusBarHeight + 50;
        }
      }
    })

    
    console.log('小程序初始化结束')
  },
  

  //获取类别列表
  getTlist() {
        var self = this;
        //划分分类
        var _data = this.globalData.data.fenleilist, _tlist = [];
        //选出一级分类，放入firstType
        for (var x in _data) {
          if (_data[x].pid == 0) {
            _tlist.push({
              firstType: _data[x],
              second: [],
            })
          }
          //判断是否存在二级分类
          if (self.globalData.navigate_type == 1 && _data[x].pid != 0){
            self.globalData.navigate_type = 2 ;
          }
        }
        //如果存在二级分类
        if (self.globalData.navigate_type == 2 ){
          //选出二级分类，放入对应的secondList
          for (var x in _data) {
            for (var y in _tlist) {
              if (_data[x].pid == _tlist[y].firstType._id) {
                _tlist[y].second.push(_data[x]);
              }
            }
          }
          //整理二级分类
          for (var x in _tlist) {
            //两行显示
            if (_tlist[x].second.length >= 10) {
              var _slist = _tlist[x].second;
              _tlist[x].secondList = [];
              _tlist[x].thirdList = [];
              for (var y in _slist) {
                if (y % 2) {
                  _tlist[x].thirdList.push(_slist[y]);
                } else {
                  _tlist[x].secondList.push(_slist[y]);
                }
              }
            }else{
              _tlist[x].secondList = _tlist[x].second;
            }
          }
        }
        self.globalData.tlist = _tlist;
        console.log('[app.js]分类',_tlist)
  },

  //登陆
  goLogin(){
    let that = this
    wx.login({
      success: res => {
        console.log(res)
          wx.cloud.callFunction({
            name: 'login',
            data: {},
            success: res => {
            console.log('[jscode2session] =>',res)
            wx.setStorageSync("openid", res.result.openid);
            this.globalData.openid = res.result.openid
            
            // 获取系统状态栏信息
            wx.getSystemInfo({
              success: e => {
                console.log('系统信息[getSystemInfo]',e)
                this.globalData.StatusBar = e.statusBarHeight;
                let capsule = wx.getMenuButtonBoundingClientRect();
                if (capsule) {
                  this.globalData.Custom = capsule;
                  this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
                } else {
                  this.globalData.CustomBar = e.statusBarHeight + 50;
                }
                wx.cloud.database().collection('dongming_user').where({ _openid: res.result.openid }).get().then(res1 => {
                  console.log('是否有浏览数据 =>',res1)
                  this.globalData.dongminguser = res1.data[0];
                  //[app.js]第一次访问
                  if(res1.data.length == 0 ){
                    const ctime = "" + (new Date()).valueOf() + wx.getStorageSync('openid')
                    console.log('[app.js]第一次访问')
                    wx.cloud.database().collection('carduser_list').where({ _openid: this.globalData.nowopenid?this.globalData.nowopenid:this.globalData.moren }).get().then(res2 => {
                      console.log('[app.js]第一次访问,card->data=>',res2)
                      if(res2.data.length != 0){
                        this.globalData.userProfile= res2.data[0]
                        wx.cloud.database().collection('productfenlei').where({ organizationid:res2.data[0].organizationid }).get().then(res5 => {
                          this.globalData.data.fenleilist = res5.data
                          that.getTlist()
                        })
                        //由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                      // 所以此处加入 callback 以防止这种情况
                      if (this.userInfoReadyCallback) {
                        this.userInfoReadyCallback(res2.data[0])
                      }
                      }
                    })
                    wx.cloud.callFunction({
                      // 云函数名称
                      name: 'user-add',
                      // 传给云函数的参数
                      data: {
                        nick_name: '',
                        sessionkey: '',
                        lookcardlist:[],//名片夹
                        lookcardlast: this.globalData.nowopenid?this.globalData.nowopenid:this.globalData.moren,
                        gender: '',
                        language: '',
                        city: '',
                        province: '',
                        avatar_url: '',
                        country: '',
                        createTime: util.formatTime(new Date()),
                        openid: res.result.openid,
                        brand: e.brand,//设备品牌e
                        model: e.model,//设备型号
                        version: e.version,//微信版本号
                        system: e.system,//操作系统及版本
                        relationId: ctime,
                        organization:'',
                        organizationid:'',
                        iscarduser:false,
                        dz: -1,
                        phone:''
                      },
                      complete: res => {
                        console.log('[app.js][user-add][over] =>', res)
                      }
                    })
                  }else{
                    console.log('[app.js]老用户')
                    this.globalData.userInfo = {
                      "avatarUrl":res1.data[0].avatar_url,
                      "nickName":res1.data[0].nick_name
                    }
                    wx.cloud.database().collection('userlookcard').where({ _openid: res.result.openid,cardopenid: this.globalData.nowopenid?this.globalData.nowopenid:res1.data[0].lookcardlast }).get().then(res4 => {
                      if(res4.data.length !== 0){
                        this.globalData.like= res4.data[0].like
                      }
                      wx.cloud.database().collection('carduser_list').where({ _openid: this.globalData.nowopenid?this.globalData.nowopenid:res1.data[0].lookcardlast }).get().then(res3 => {
                        console.log('card=>data=>',res3)
                        if(res3.data.length != 0){
                          this.globalData.userProfile= res3.data[0]
                          wx.cloud.database().collection('productfenlei').where({ organizationid:res3.data[0].organizationid }).get().then(res5 => {
                            this.globalData.data.fenleilist = res5.data
                            that.getTlist()
                          })
                          //由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                          // 所以此处加入 callback 以防止这种情况
                          if (this.userInfoReadyCallback) {
                            this.userInfoReadyCallback(res3.data[0])
                          }
                        }
                      })
                    })
                    
                    if(res1.data[0].organizationid == ''){
                      console.log('未绑定企业',res1.data[0].organizationid)
                    }else{
                      console.log('已绑定企业',res1.data[0].organizationid)
                      var _onejifenleilist=[],dengji = 1,_erjilist = [];
                      wx.cloud.database().collection('productfenlei').where({ organizationid:res1.data[0].organizationid }).get().then(res => {
                        console.log('管理员分类=>',res.data)
                        //选出一级分类，放入 _onejifenleilist
                        for (var x in res.data) {
                          if (res.data[x].pid == 0) {
                            _onejifenleilist.push(res.data[x])
                            _erjilist.push([])
                          }
                          //判断是否存在二级分类
                          if (dengji == 1 && res.data[x].pid != 0){
                            dengji = 2 ;
                          }
                        }
                        //如果存在二级分类
                        if (dengji == 2 ){
                          //选出二级分类，放入对应的secondList
                          for (var x in res.data) {
                            for (var y in _onejifenleilist) {
                              if (res.data[x].pid == _onejifenleilist[y]._id) {
                                _erjilist[y].push(res.data[x]);
                              }
                            }
                          }
                        }
                        this.globalData.guanlierjilist = _erjilist
                        this.globalData.guanlifenleidata = res.data
                        this.globalData.guanlionejifenleilist = _onejifenleilist
                        console.log('分类=>',_erjilist,_onejifenleilist)
                      })
                    }
                  }
                })
                // this.watch(this.globalData, {
                //   fenleilist: function (newVal) {
                //     console.log('this.globalData.fenleilist_setdata',newVal)
                //     that.getTlist()
                //   }
                // })
                // 获取用户信息
                wx.getSetting({
                  success: res1 => {
                    if (res1.authSetting['scope.userInfo'] ) {
                      console.log('已授权')
                      // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                      wx.getUserProfile({
                        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
                        success: (res) => {
                          console.log(res)
                          this.globalData.userInfo = res.userInfo
                        }
                      })
                    }else{
                      console.log('没授权')
                    }
                  }
                })
              }
            })
          }
        })
      }
    })
  },

    // 设置监听器
    watch: function (ctx, obj) {
      Object.keys(obj).forEach(key => {
        this.observer(ctx.data, key, ctx.data[key], function (value) {
          obj[key].call(ctx, value)
        })
      })
    },
    // 监听属性，并执行监听函数
    observer: function (data, key, val, fn) {
      Object.defineProperty(data, key, {
        configurable: true,
        enumerable: true,
        get: function () {
          return val
        },
        set: function (newVal) {
          if (newVal === val) return
          fn && fn(newVal)
          val = newVal
        },
      })
    },
  globalData: {
    navigate_type:1,
    like:false,
    moren:'oDmvK5el0YsVj0sLiqTFB7yuT1eI',
    tlist:[],
    data:{},
    userProfile:''
  },
})
