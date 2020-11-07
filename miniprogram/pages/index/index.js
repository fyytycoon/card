//index.js
import Poster from '../../components/wxa-plugin-canvas/poster/poster'
const util = require("../../utils/util.js");
import { $wuxDialog } from '../../components/wuxui/index'
//获取应用实例
const app = getApp()

Page({
  data: {
    showShareDialog: false,//分享弹出框
    icon_like: '/images/icon/dianzan1.png',
	  icon_unlike: '/images/icon/dianzan0.png',
	  like:false, //是否已点赞
    canvasHidden: true,
    isFold: true,//简介展开
    modalName:'',
    guanggaoweilist:[],

    userProfile:{},
    inputValue:{
      shoujiicon: "/images/cell.png ",
      weixinicon: "/images/weixin.png ",
      youxiangicon: "/images/youxiang.png ",
      dizhiicon: "/images/dizhi.png ",
      zuojiicon: "/images/zuoji.png ",
    },
    jiazai:false,//加载动画显示
    getSett:false,//授权区分
    tygochat:false,
    qipaokuang:true//气泡框
    
  },

  onLoad: function(options) {
    var that = this
    wx.cloud.database().collection('guanggaowei').where({}).get().then(res => {
      that.setData({
        guanggaoweilist:res.data
      })
    })
    
    if(options.id == null || options.id == ''){
      // console.log(app.globalData.userProfile)
      if(!app.globalData.userProfile){
        app.userInfoReadyCallback = res => {
          console.log('[index.js]获取[app.js]card信息 ',res)
          that.setData({
            userProfile: app.globalData.userProfile,
            nowopenid: app.globalData.userProfile._openid,
            dianzancount: app.globalData.userProfile.dianzancount,
            like:app.globalData.like,
            jiazai:true,
          })
          if(!app.globalData.dongminguser){
            that.setData({
              phone: app.globalData.dongminguser.phone,
            })
          }
          that.shouquan()
        }  
      }else{
        console.log('[index.js]k获取[app.js]card信息 ',app.globalData.userProfile)
        that.setData({
            userProfile: app.globalData.userProfile,
            nowopenid: app.globalData.userProfile._openid,
            dianzancount: app.globalData.userProfile.dianzancount,
            like:app.globalData.like,
            jiazai:true,
          })
          if(!app.globalData.dongminguser){
            that.setData({
              phone: app.globalData.dongminguser.phone,
            })
          }
          that.shouquan()
      //   }
      }
    }else{
      //url进入
      app.globalData.nowopenid = options.id
      console.log("分享进入",options.id)
      wx.login({
        success: res2 => {
          // 调用云函数
          wx.cloud.callFunction({
            name: 'login',
            data: {},
            success: res => {
              wx.setStorageSync("openid", res.result.openid);
              app.globalData.openid = res.result.openid
              wx.cloud.database().collection('carduser_list').where({ _openid: options.id }).get().then(res3 => {
                wx.cloud.database().collection('productfenlei').where({ organizationid:res3.data[0].organizationid }).get().then(res5 => {
                  app.globalData.data.fenleilist = res5.data
                  this.getTlist()
                })
                this.setData({
                  userProfile: res3.data[0],
                  nowopenid: options.id,
                  dianzancount: res3.data[0].dianzancount,
                  jiazai:true
                })
                app.globalData.userProfile=res3.data[0]
              })
            }
          })
        }
      })
      if(!app.globalData.userProfile){
        app.userInfoReadyCallback = res => {
          console.log('[index.js]获取[app.js]用户信息 ',res)
          that.setData({
            like:app.globalData.like,
            phone: app.globalData.dongminguser.phone
          })
          that.shouquan()
        }  
      }else{
        console.log('[index.js]获取k')
        that.setData({
          like:app.globalData.like,
          phone: app.globalData.dongminguser.phone
        })
        that.shouquan()
      }
    }
  },
  onShow: function(e){
    var that = this
    if(!that.data.guanggaoweilist.length == 0){
      var num =  Math.floor(Math.random()*that.data.guanggaoweilist.length)
      that.setData({
        guanggaowei: that.data.guanggaoweilist[num].imgurl,
        guanggaonum:num,
        nowopenid: app.globalData.userProfile._openid
      })
    setTimeout(that.settime, 1500);
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    var that = this
    that.setData({
      qipaokuang:false
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  //检查授权
  shouquan(){
    var that = this
    wx.getSetting({
      success (res){
        console.log('shouji',that.data.phone)
        if(res.authSetting['scope.userInfo']){
          if (that.data.phone) {
            that.setData({
              tygochat: true
            })
          }else{
            that.setData({
              getSett:true//有信息权限没有手机号
            })
          }
        }
      }
    })
  },

  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  goh5(){
    wx.cloud.database().collection('guanwang').where({organizationid:app.globalData.userProfile.organizationid}).get().then(res => {
      if(!res.data.length == 0){
        wx.setStorageSync("guanwang", res.data[0]);
        wx.navigateTo({
          url:'/pages/guanwangh5/index'
        })
      }
    })
  },

  //定时器
  settime(){
    var num =  Math.floor(Math.random()*2)
    if(num == 1){
      this.setData({
        modalName:'Image'
      })
    }
  },

  goguanggao(){
    wx.navigateTo({
      url:'/pages/goods-details/index?id=' + this.data.guanggaoweilist[this.data.guanggaonum].id + '&cardid=' +  this.data.guanggaoweilist[this.data.guanggaonum].cardid,
    })
  },

  //获取类别列表
  getTlist() {
    var self = app;
    //划分分类
    var _data = app.globalData.data.fenleilist, _tlist = [];
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
    }else{
      
    }
    self.globalData.tlist = _tlist;
  },

  //点击图片
  gopreviewImage(e){
    let that = this
    wx.previewImage({
      current: that.data.userProfile.imgsList[e.currentTarget.id], // 当前显示图片的http链接
      urls: that.data.userProfile.imgsList // 需要预览的图片http链接列表
    })
  },

  //点击简介 显示全部
  showAll: function() {
    this.setData({
      isFold: !this.data.isFold
    })
  },

  godetails(e){
    var _id = e.currentTarget.dataset.id ;
      console.log("[product_box]->",_id)
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + _id
      })
  },

  //点赞
  onLike(e) {
    var that = this
    wx.vibrateShort() //手机振动API
    this.animation = wx.createAnimation({
      duration: 300, // 动画持续时间，单位 ms
      timingFunction: 'linear', // 动画的效果
      delay: 10, // 动画延迟时间，单位 ms
      transformOrigin: '50% 50%' // 动画的中心点
    })
    let likecount = that.data.like
    let dianzan = that.data.dianzancount
    dianzan = likecount ? dianzan - 1 : dianzan + 1
    if (!likecount) {
      setTimeout(function () {
        this.animation.scale(1.5).step();
        this.animation.scale(1.0).step();
        this.setData({
          animation: this.animation.export()
        });
      }.bind(this), 50);
    }
    that.setData({
      dianzancount:dianzan,
      like: !likecount
    })
    //浏览记录
    wx.cloud.database().collection('userlookcard').where({ _openid: wx.getStorageSync('openid'),cardopenid:that.data.nowopenid }).get().then(res1 => {
      if(res1.data.length !== 0){
        wx.cloud.callFunction({
          // 云函数名称
          name: 'updatelike',
          // 传给云函数的参数
          data: {
            openid:wx.getStorageSync('openid'),
            dianzancount:that.data.dianzancount,//点赞次数
            like:that.data.like,
            nowopenid:that.data.nowopenid
          },
          complete: res => {
            console.log('[index.js][updatelooklike-updated] [over]=>', res)
          }
        })
      }
    })
  },

  prompt() {
    const alert = (content) => {
        $wuxDialog('#wux-dialog--alert').alert({
            resetOnClose: true,
            title: '提示',
            content: content,
        })
    }

    $wuxDialog().prompt({
        resetOnClose: true,
        title: '提示',
        content: '密码为8位数字',
        fieldtype: 'number',
        password: !0,
        defaultText: '',
        placeholder: '请输入Wi-Fi密码',
        maxlength: 20,
        openType:share,
        onConfirm(e, response) {
            const content = response.length === 8 ? `Wi-Fi密码到手了: ${response}` : `请输入正确的Wi-Fi密码`
            alert(content)
        },
    })
  },

  //点击 海报 触发
  async onCreatePoster(){
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name:'getwxacode',
      data:{
        path:'/pages/index/index?id='+this.data.nowopenid,
        imgid:this.data.userProfile.img[0],
        flag:this.data.nowopenid
      },
      success: res => {
        const imgurl=res.result.fileList[1].tempFileURL
        //菊花码
        const qrcode=res.result.fileList[0].tempFileURL
        const height = 467
        this.drawSharePicDone(height, qrcode,imgurl)
        wx.hideLoading()
      },
      fail: err => {
        // handle error
      },
      complete:com=>{

      }
    })
    
  },
  //海报
  drawSharePicDone(picHeight, qrcode,img) {
    const _this = this
    const _baseHeight = 74 + (picHeight + 120)
    this.setData({
      posterConfig: {
        width: 750,
        height: picHeight + 660,
        backgroundColor: '#fff',
        debug: false,
        blocks: [
          {
            x: 76,
            y: 74,
            width: 604,
            height: picHeight + 120,
            borderWidth: 2,
            borderColor: '#c2aa85',
            borderRadius: 8
          }
        ],
        images: [
          {
            x: 133,
            y: 133,
            url: img, // 商品图片
            width: 490,
            height: picHeight
          },
          {
            x: 76,
            y: _baseHeight + 199,
            url: qrcode, // 二维码
            width: 222,
            height: 222
          }
        ],
        texts: [
          {
            x: 375,
            y: _baseHeight + 80,
            width: 650,
            lineNum:2,
            text: '你好，我是'+_this.data.userProfile.organization+'的'+_this.data.userProfile.title+_this.data.userProfile.name,
            textAlign: 'center',
            fontSize: 40,
            color: '#333'
          },
          {
            x: 352,
            y: _baseHeight + 320,
            text: '长按识别小程序码',
            fontSize: 28,
            color: '#999'
          }
        ],
      }
    }, () => {
      Poster.create();
    });
  },
  //海报生成 成功
  onPosterSuccess(e) {
    this.setData({
      posterImg: e.detail,
      showposterImg: true,
      showShareDialog:false
    })
  },
  onPosterFail(e) {
    console.error('fail:', e)
  },
  //保存海报
  savePosterPic() {
    const _this = this
        wx.saveImageToPhotosAlbum({
          filePath: this.data.posterImg,
          success: (res1) => {
            wx.showModal({
              content: '已保存到手机相册',
              showCancel: false,
              confirmText: '知道了',
              confirmColor: '#333'
            })
          },
          complete: () => {
            _this.setData({
              showposterImg: false
            })
          },
          fail: (err) => {
            console.log(err)
            if (err.errMsg === "saveImageToPhotosAlbum:fail:auth denied" || err.errMsg === "saveImageToPhotosAlbum:fail auth deny" || err.errMsg === "saveImageToPhotosAlbum:fail authorize no response") {
              // 这边微信做过调整，必须要在按钮中触发，因此需要在弹框回调中进行调用
              wx.showModal({
                title: '提示',
                content: '需要您授权保存相册',
                showCancel: false,
                success: modalSuccess => {
                  wx.openSetting({
                    success(settingdata) {
                      console.log("settingdata", settingdata)
                      if (settingdata.authSetting['scope.writePhotosAlbum']) {
                        wx.showModal({
                          title: '提示',
                          content: '获取权限成功,再次点击图片即可保存',
                          showCancel: false,
                        })
                      } else {
                        wx.showModal({
                          title: '提示',
                          content: '获取权限失败，将无法保存到相册哦~',
                          showCancel: false,
                        })
                      }
                    },
                    fail(failData) {
                      console.log("failData", failData)
                    },
                    complete(finishData) {
                      console.log("finishData", finishData)
                    }
                  })
                }
              })
            }

            wx.showToast({
              title: err.errMsg,
              icon: 'none',
              duration: 2000
            })
          }
        })
    //   }
    // })
    
  },
  //点击查看海报
  previewImage: function(){
    wx.previewImage({
      current: this.data.posterImg, // 当前显示图片的http链接
      urls: [this.data.posterImg] // 需要预览的图片http链接列表
    })
  },
  //取消海报显示
  xiaoqu: function(){
    this.setData({
      showposterImg: false
    })
  },

  //分享弹出框 取消
  hideDialog: function (e) {
    let that = this;
    that.setData({
        showShareDialog: false,
    });
  },

  //分享弹出框
  setshowShare: function(){
    this.setData({
      showShareDialog: !this.data.showShareDialog,
    })

  },

  //取消顶部弹出框
  switchShow:function(){
    this.setData({
      show:false
    })
  },
  
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  // 编辑页
  edit: function() {
    wx.navigateTo({
      url: '../edit/edit',
    })
  },
  // 电话薄页
  phone: function() {
    wx.navigateTo({
      url: '../phone/phone',
    })
  },
  // 二维码面
  ma: function() {
    wx.navigateTo({
      url: '../card/card?avatarUrl=' + this.data.userInfo.avatarUrl,
    })
  },
  // 分享转发
  onShareAppMessage(res) {
    var that = this;
    that.setData({
      showShareDialog: false,
    });

    // 转发在群聊中被其他用户打开时，能使用这个小程序查看信息
    wx.showShareMenu({
      withShareTicket: true
    })

    return {
      title: '你好，我是'+_this.data.userProfile.organization+'的'+that.data.userProfile.title+that.data.userProfile.name,
      path: '/pages/index/index?id='+this.data.nowopenid
    }
  },

  //存入手机通讯录
  addPhoneContact() {
    // 调用登录接口
    wx.addPhoneContact({
      firstName:this.data.userProfile.name,
      photoFilePath: this.data.userProfile.img,
      organization: this.data.userProfile.organization,
      title: this.data.userProfile.title,
      mobilePhoneNumber: this.data.userProfile.mobile,
      weChatNumber:this.data.userProfile.weChat,
      email:this.data.userProfile.email
    })
  },

  //拨打电话
  callPhone(e){
    const v = e.currentTarget.dataset.v
    wx.makePhoneCall({
      phoneNumber: v
    })
  },

  //复制
  copyData(e){
    const v = e.currentTarget.dataset.v
    wx.setClipboardData({
      data: v,
      success: (res) => {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        })
      }
    })
  },

  //地图
  weizhi(){
    var that = this
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success (res) {
        const latitude = that.data.userProfile.latitude
        const longitude = that.data.userProfile.longitude
        wx.openLocation({
          latitude,
          longitude,
          scale: 18,
          name:that.data.userProfile.organization,
          address:that.data.userProfile.address
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

  //授权信息
  onGetUserInfo: function(e){
    var that = this
    console.log('当前浏览openid',that.data.nowopenid)
    wx.getSetting({
      success: res1 => {
        if (res1.authSetting['scope.userInfo'] ) {
          console.log('已授权')
          that.setData({
            modalName:"DialogModal1"
          })
          //浏览记录
          wx.cloud.database().collection('userlookcard').where({ _openid: wx.getStorageSync('openid'),cardopenid:that.data.nowopenid }).get().then(res1 => {
            if(res1.data.length == 0){
              console.log('无浏览记录')
              let lookcount = this.data.userProfile.lookcount + 1
              if(that.data.userProfile.likeAvatarUrl.length > 5){
                that.data.userProfile.likeAvatarUrl.splice(0, that.data.userProfile.likeAvatarUrl.length-5)
              }
              wx.cloud.callFunction({
                // 云函数名称
                name: 'userlookcard',
                // 传给云函数的参数
                data: {
                  nick_name: e.detail.userInfo.nickName,
                  gender: e.detail.userInfo.gender,
                  language: e.detail.userInfo.language,
                  city: e.detail.userInfo.city,
                  province: e.detail.userInfo.province,
                  avatar_url: e.detail.userInfo.avatarUrl,
                  country: e.detail.userInfo.country,
                  openid: wx.getStorageSync('openid'),
                  createTime: util.formatTime(new Date()),
                  cardopenid:that.data.nowopenid,
                  cardname:that.data.userProfile.name,
                  cardorganization:that.data.userProfile.organization,
                  cardtitle:that.data.userProfile.title,
                  cardimg:that.data.userProfile.img[0],
                  like:that.data.like,
                  phone:''
                },
                complete: res => {
                  console.log('[index.js][userlookcard-add] [over]=>', res)
                }
              })
              //修改card的浏览信息
              wx.cloud.callFunction({
                // 云函数名称
                name: 'updatelook',
                // 传给云函数的参数
                data: {
                  lookcount:lookcount,//浏览次数
                  likeAvatarUrl:that.data.userProfile.likeAvatarUrl.concat([{'avatarUrl':e.detail.userInfo.avatarUrl}]),
                  openid: wx.getStorageSync('openid'),
                  createTime: util.formatTime(new Date()),
                  nowopenid:this.data.nowopenid,
                },
                complete: res => {
                  console.log('[index.js][updatelook-update] [over]=>', res)
                }
              })
            }
          })
          wx.cloud.callFunction({
            // 云函数名称
            name: 'user-add',
            // 传给云函数的参数
            data: {
              nick_name: e.detail.userInfo.nickName,
              gender: e.detail.userInfo.gender,
              language: e.detail.userInfo.language,
              city: e.detail.userInfo.city,
              province: e.detail.userInfo.province,
              avatar_url: e.detail.userInfo.avatarUrl,
              country: e.detail.userInfo.country,
              openid: wx.getStorageSync('openid'),
              localStorageTime:util.formatTime(new Date()),
              lookcardlast: that.data.nowopenid,
            },
            complete: res => {
              app.globalData.userInfo = e.detail.userInfo;
              console.log('[index.js][user-add] =>', res)
            }
          })
          
        }else{
          console.log('没授权')
          wx.showModal({
            title: '提示',
            content: '为了舒适体检，请允许授权',
            showCancel:false
          })
        }
      }
    })
  },

  //获取手机号
  getPhoneNumber(e){
    let that = this;
    
    wx.login({
      success(re) {
            wx.cloud.callFunction({
                  name: 'regist', // 对应云函数名
                  data: {
                        $url: "phone", //云函数路由参数
                        encryptedData: e.detail.encryptedData,
                        iv: e.detail.iv,
                        code: re.code
                  },
                  success: res => {
                        wx.hideLoading();
                        if (res.result == null) {
                              wx.showToast({
                                    title: '获取失败,请重新获取',
                                    icon: 'none',
                                    duration: 2000
                              })
                              return false;
                        }
                        //获取成功，设置手机号码
                        that.setData({
                              phone: res.result.data.phoneNumber,
                              modalName:null,
                              tygochat: true
                        })
                        app.globalData.dongminguser.phone = res.result.data.phoneNumber
                        wx.cloud.callFunction({
                          // 云函数名称
                          name: 'addphone',
                          // 传给云函数的参数
                          data: {
                            openid: wx.getStorageSync('openid'),
                            phone:that.data.phone
                          },
                          complete: res => {
                          }
                        })
                        that.gochat()
                  },
                  fail: err => {
                        wx.showToast({
                              title: '获取失败,请重新获取',
                              icon: 'none',
                              duration: 2000
                        })
                  }
            })
      },
      fail: err => {
            wx.showToast({
                  title: '获取失败,请重新获取',
                  icon: 'none',
                  duration: 2000
            })
      }
    })
  },

  gochat(){
    var that = this
    //浏览记录
    wx.cloud.database().collection('userlookcard').where({ _openid: wx.getStorageSync('openid'),cardopenid:that.data.nowopenid }).get().then(res1 => {
      if(res1.data.length == 0){
        console.log('无浏览记录')
        let lookcount = that.data.userProfile.lookcount + 1
        if(that.data.userProfile.likeAvatarUrl.length > 5){
          that.data.userProfile.likeAvatarUrl.splice(0, that.data.userProfile.likeAvatarUrl.length-5)
        }
        wx.cloud.callFunction({
          // 云函数名称
          name: 'userlookcard',
          // 传给云函数的参数
          data: {
            nick_name: app.globalData.dongminguser.nick_name,
            gender: app.globalData.dongminguser.gender,
            language: app.globalData.dongminguser.language,
            city: app.globalData.dongminguser.city,
            province: app.globalData.dongminguser.province,
            avatar_url: app.globalData.dongminguser.avatar_url,
            country: app.globalData.dongminguser.country,
            openid: wx.getStorageSync('openid'),
            createTime: util.formatTime(new Date()),
            cardopenid:that.data.nowopenid,
            cardname:that.data.userProfile.name,
            cardorganization:that.data.userProfile.organization,
            cardtitle:that.data.userProfile.title,
            cardimg:that.data.userProfile.img[0],
            like:that.data.like,
            phone:that.data.phone,
            lookcount:lookcount,//浏览次数
            likeAvatarUrl:that.data.userProfile.likeAvatarUrl.concat([{'avatarUrl':app.globalData.dongminguser.avatar_url}]),
          },
          success: res => {
            console.log('[index.js][userlookcard-add] [success]=>', res)
          },
          fail: res => {
            console.log('[index.js][userlookcard-add] [fail]=>', res)
          }
        })
      }
      wx.cloud.callFunction({
        // 云函数名称
        name: 'user-add',
        // 传给云函数的参数
        data: {
          nick_name: app.globalData.dongminguser.nick_name,
          gender: app.globalData.dongminguser.gender,
          language: app.globalData.dongminguser.language,
          city: app.globalData.dongminguser.city,
          province: app.globalData.dongminguser.province,
          avatar_url: app.globalData.dongminguser.avatar_url,
          country: app.globalData.dongminguser.country,
          openid: wx.getStorageSync('openid'),
          localStorageTime:util.formatTime(new Date()),
          lookcardlast: that.data.nowopenid,
        },
        success: res => {
          console.log('[index.js][user-add]success =>', res)
          wx.navigateTo({
            url: '/pages/chat/chat?cardid='+that.data.nowopenid+'&userid='+wx.getStorageSync('openid')+'&nickname='+that.data.userProfile.name+'&dis=0',
          })
        },
        fail:res =>{
          console.log('[index.js][user-add]fail =>',res)
        }
      })
      
    })
  },

  gotongshi(e){
    var openid = e.currentTarget.dataset.id
    wx.reLaunch({
      url: '/pages/index/index?id='+openid
    })
  }
})