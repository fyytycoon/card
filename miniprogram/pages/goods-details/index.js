//index.js
//获取应用实例
var app = getApp();
// var WxParse = require('../../wxParse/wxParse.js');
import Poster from '../../components/wxa-plugin-canvas/poster/poster'
const db = wx.cloud.database()
const _ = db.command
const util = require("../../utils/util.js");

Page({
  data: {
    getSett:false,
    tygochat:false,
    showShareDialog:false,
    loading:0,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    goodsDetail:{},
    swiperCurrent: 0,  
    hasMoreSelect:false,
    hasCoupons:false,
    couponsList:[],
    couponsList1:[],
    selectSize:"选择：",
    selectSizePrice:0,
    shopNum:0,
    hideShopPopup:true,
    hideCouponPopup:true ,
    buyNumber:0,
    buyNumMin:1,
    buyNumMax:0,
    propertyChildIds:"",
    propertyChildNames:"",
    canSubmit:false, //  选中规格尺寸时候是否允许加入购物车
    shopCarInfo:{},
    shopType: "addShopCar",//购物类型，加入购物车或立即购买，默认为加入购物车
  },

  onLoad: function (e) {
    console.log(e)
    var that = this
    db.collection('productdata').where({_id:e.id}).get().then(res=>{
      that.setData({
        goodsDetail:res.data[0],
        loading:1,
      })
    })
    if(!app.globalData.userProfile){
      app.userInfoReadyCallback = res => {
        that.setData({
          phone: app.globalData.dongminguser.phone
        })
        that.shouquan()
      }
    }else{
      that.setData({
        phone: app.globalData.dongminguser.phone
      })
      that.shouquan()
    }
    if(e.cardid){
      console.log('cardid进入=>',e.cardid)
      app.globalData.nowopenid = e.cardid
      db.collection('carduser_list').where({ _openid: e.cardid }).get().then(res2 => {
        console.log('carduser=>',res2)
        that.setData({
          nowopenid : e.cardid,
          userProfile : res2.data[0]
        })
      })
    }else{
      that.setData({
        nowopenid : app.globalData.userProfile._openid,
        userProfile : app.globalData.userProfile
      })
    }
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

  gowant(){
    wx.showToast({
      title: '请保持电话畅通，稍后与您联系',
      icon: 'none',
      duration: 2000
    })
  },

  goindex(){
    var that = this
    wx.reLaunch({
      url: '/pages/index/index?id='+that.data.nowopenid
    })
  },

  //
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
            phone:that.data.phone,
            like: false,
            lookcount:lookcount,//浏览次数
            likeAvatarUrl:that.data.userProfile.likeAvatarUrl.concat([{'avatarUrl':app.globalData.dongminguser.avatar_url}]),
          },
          complete: res => {
            console.log('[index.js][userlookcard-add] [over]=>', res)
          }
        })
      }
      if(app.globalData.dongminguser){
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
      }else{
        wx.navigateTo({
          url: '/pages/chat/chat?cardid='+that.data.nowopenid+'&userid='+wx.getStorageSync('openid')+'&nickname='+that.data.userProfile.name+'&dis=0',
        })
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
                        console.log(res);
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
                          modalName: null,
                          tygochat: true
                        })
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

  //授权信息
  onGetUserInfo: function(e){
    var that = this
    wx.getSetting({
      success: res1 => {
        console.log(res1)
        if (res1.authSetting['scope.userInfo'] ) {
          console.log('已授权')
          that.setData({
            modalName:"DialogModal"
          })
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
                  phone:that.data.phone,
                  lookcount:lookcount,//浏览次数
                  likeAvatarUrl:that.data.userProfile.likeAvatarUrl.concat([{'avatarUrl':e.detail.userInfo.avatarUrl}]),
                },
                complete: res => {
                  console.log('[index.js][userlookcard-add] [over]=>', res)
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
              console.log('[index.js][app . userInfo] =>', app.globalData.userInfo)
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

  

  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  //点击图片
  gopreviewImage(e){
    let that = this
    console.log(e.currentTarget.id)
    
    wx.previewImage({
      current: that.data.goodsDetail.xijieimgList[e.currentTarget.id], // 当前显示图片的http链接
      urls: that.data.goodsDetail.xijieimgList // 需要预览的图片http链接列表
    })
  },
  
  
  
  hideDialog: function (e) {
    let that = this;
    that.setData({
        showShareDialog: false,
    });
  },
  shareTo:function(){
      this.setData({
          showShareDialog: !this.data.showShareDialog,
      });
  },

  //分享
  onShareAppMessage: function () {
    console.log(this.data.goodsDetail._id,app.globalData.dongminguser.lookcardlast)
    return {
      title: this.data.goodsDetail.name,
      path: '/pages/goods-details/index?id=' + this.data.goodsDetail._id + '&cardid=' + this.data.nowopenid,
      imageUrl: this.data.goodsDetail.pic,
      success: function (res) {
        // 转发成功
        console.log('转发成功')
      },
      fail: function (res) {
        // 转发失败
        console.log('转发失败')
      }
    }
  },

  //点击 海报 触发
  async onCreatePoster(){
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name:'getwxacode',
      data:{
        path:'/pages/goods-details/index?id=' + this.data.goodsDetail._id + '&cardid=' + this.data.nowopenid,
        imgid:this.data.goodsDetail.pic,
        flag:this.data.goodsDetail._id
      },
      success: res => {
        console.log(res)
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
            text: _this.data.goodsDetail.name,
            textAlign: 'center',
            fontSize: 35,
            color: '#333'
          },
          {
            x: 375,
            y: _baseHeight + 170,
            text: '在线咨询',
            textAlign: 'center',
            fontSize: 35,
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
    console.log('success:', e)
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
    console.log(this.data.posterImg)
    
    // wx.downloadFile({
    //   url:this.data.posterImg,
    //   success:(res)=>{
    //     console.log(res.tempFilePath)
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

})
