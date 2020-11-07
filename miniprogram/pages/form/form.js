const app = getApp();
const db = wx.cloud.database()
const _ = db.command
import { $wuxSelect } from '../../components/wuxui/index'
Page({
  data: {
    carddata:{},
    organizationindex: '',//picker默认显示数组下标
    organizationlist: [],
    organizationlist: [{_id:'d6b130aa5f9d0a47000385cf4ef2084d',name:'分销商',organization:'',address:'',zuoji:'',setlogoimgList:[],latitude:37.760741,longitude:112.653195}],
    name:'',
    mobile:'',
    weChat:'',
    email:'',
    imgList: [],//我的照片
    oneimg: [],//头像
    videourl:'',//我的视频
    tongshivalue:[],
    tongshititle:[],
    productvalue:[],
    producttitle:[],
    textarea: "",
    fxsorganization:'',

    setoneimg: '',
    setimgList: [],
    setvideourl:'',
    setproductlist:[],
    settongshilist:[],

    textareaAValue: '',
    textareaBValue: '',
    fenxiaoshang:false,//分销商标志
    about:false,
    video:false,
    photo:false,
    tongshi:false,
    qiye:false,
    product:false,

    allproductlist:[],

    alltongshilist:[],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(app.globalData.dongminguser.organizationid){
      this.setData({
        organizationren:true
      })
      db.collection('organizationlist').where({_id:app.globalData.dongminguser.organizationid,dz:true}).get().then(res=>{
        this.setData({
          organizationlist:res.data.concat(this.data.organizationlist)
        })
        
        console.log('企业列表=>',this.data.organizationlist)
      })
      db.collection('organizationstaff').where({organizationid:app.globalData.dongminguser.organizationid,_openid:_.neq(wx.getStorageSync('openid')),dz:true}).get().then(res=>{
        for (let i = 0; i < res.data.length; ++i) {
          this.data.alltongshilist.push({
            title: res.data[i].cardname,
            value: res.data[i]._openid,
            img: res.data[i].img,
            zhiwei: res.data[i].title,
          })
        }
        console.log('企业人员列表=>',this.data.alltongshilist)
      })
      db.collection('productdata').where({organizationid:app.globalData.dongminguser.organizationid}).get().then(res=>{
        for (let i = 0; i < res.data.length; ++i) {
          this.data.allproductlist.push({
            title: res.data[i].name,
            value: res.data[i]._id,
            pic:res.data[i].pic
          })
        }
        console.log('企业产品列表=>',this.data.allproductlist)
      })
    }else{
      db.collection('productdata').where({organizationid:'d6b130aa5f9d0a47000385cf4ef2084d'}).get().then(res=>{
        for (let i = 0; i < res.data.length; ++i) {
          this.data.allproductlist.push({
            title: res.data[i].name,
            value: res.data[i]._id,
            pic:res.data[i].pic
          })
        }
        console.log('默认dm产品列表=>',this.data.allproductlist)
      })
    }
    
    db.collection('carduser_list').where({ _openid: wx.getStorageSync('openid') }).get().then(res=>{
      console.log(res)
      if(!res.data.length == 0){
        this.setData({
          carddata : res.data[0],
          mobile: res.data[0].mobile,
          weChat: res.data[0].weChat,
          oneimg: res.data[0].img,
          setoneimg: res.data[0].img,
          imgList:res.data[0].imgsList,
          setimgList:res.data[0].imgsList,
          organization:res.data[0].organization,
          setorganization:res.data[0].organization,
          address:res.data[0].address,
          zuoji:res.data[0].zuoji,
          producttitle: res.data[0].producttitle,
          setproductlist:res.data[0].productlist,
          settongshilist:res.data[0].tongshilist,
          tongshititle: res.data[0].tongshititle,
          tongshivalue: res.data[0].tongshivalue,
          productvalue:res.data[0].productvalue,
          fenxiaoshang:res.data[0].fenxiaoshang,//分销商标志
          about:res.data[0].about,
          video:res.data[0].video,
          photo:res.data[0].photo,
          tongshi:res.data[0].tongshi,
          qiye:res.data[0].qiye,
          product:res.data[0].product,
          videourl:res.data[0].videourl,
          setvideourl:res.data[0].videourl,
          organizationid:res.data[0].organizationid,
          latitude:res.data[0].latitude,
          longitude:res.data[0].longitude,
        })
      }
    })
    
  },

  //表单提交
  uploadform(e){
    console.log(e)
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    const mo = e.detail.value.setmobile
    const we = e.detail.value.setweChat
    const na = e.detail.value.setname
    const ti = e.detail.value.settitle
    const ma = e.detail.value.setemail
    const or = e.detail.value.setorganization
    const lo = e.detail.value.setaddress
    const zu = e.detail.value.setzuoji
    const textarea = e.detail.value.settextarea
    if (na == null || na == "") {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (mo == null || mo == "") {
      wx.showToast({
        title: '请输入手机号码',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (!(/^1[34578]\d{9}$/.test(mo))) {
      if (mo.length !== 11) {
        wx.showToast({
          title: '手机号有误',
          icon: 'none',
          duration: 2000
        })
        return
      }
    }
    if (we == ''||we ==null) {
      wx.showToast({
        title: '请输入微信',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (!(/^1[34578]\d{9}$/.test(we))) {
      if (we.length !== 11) {
        wx.showToast({
          title: '微信手机号有误',
          icon: 'none',
          duration: 2000
        })
        return
      }
    }
    let str = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/
    if (str.test(ma)) {
    }else{
      wx.showToast({
        title: '请输入正确邮箱',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (ti == ''||ti ==null) {
      wx.showToast({
        title: '请输入职位',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (that.data.organizationid == ''||that.data.organizationid ==null) {
      wx.showToast({
        title: '请进行企业选择',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (that.data.setoneimg == ''||that.data.setoneimg ==null) {
      wx.showToast({
        title: '请上传头像',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (or==""||lo==""||zu==""||or==null||lo==null||zu==null){
      wx.showToast({
        title: '请完善企业信息',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (textarea==""||textarea==null){
      wx.showToast({
        title: '请完善个人简介',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    if(!that.data.imgList.length == 0){
      const filesdata = new Array();
      const lsdata = new Array();
      for (let i = 0; i < that.data.imgList.length; ++i) {
        if(that.data.imgList[i].indexOf('cloud')== -1){
          filesdata.push({
            filename: that.data.imgList[i].substring(that.data.imgList[i].length - 13),
            filetype: 'image',
            path: that.data.imgList[i],
          })
        }
      }
      console.log('[文件上传] [filesdata 数据] =>', filesdata)
      // 并发上传文件
      const uploadTasks = filesdata.map(item => that.uploadFile(item.path, item.filename, item.filetype))
      Promise.all(uploadTasks).then(result => {
        console.log("[上传文件] [result的值] =>", result)
        for (let i = 0; i < result.length; ++i) {
          if (result[i].errMsg == 'cloud.uploadFile:ok') {
            lsdata.push(result[i].fileID)
          }
        }
        if(that.data.imgList[0].indexOf('cloud') >= 0){
          that.setData({
            setimgList:that.data.setimgList.concat(lsdata)
          })
        }else{
          that.setData({
            setimgList:lsdata
          })
        }
        console.log(that.data.setimgList)
      })
      // 调用监听器，监听数据变化
      app.watch(that, {
        setimgList: function (newVal) {
          console.log('数据监听=>')
          wx.cloud.callFunction({
            name:'carduser',
            data:{
              openid:wx.getStorageSync('openid'),
              name:e.detail.value.setname,
              mobile:e.detail.value.setmobile,
              weChat:e.detail.value.setweChat,
              email:e.detail.value.setemail,
              img:that.data.setoneimg,
              textarea:e.detail.value.settextarea,
              organization:e.detail.value.setorganization,
              organizationid:that.data.organizationid,
              title:e.detail.value.settitle,
              address:e.detail.value.setaddress,
              zuoji:e.detail.value.setzuoji,
              imgsList:newVal,
              videourl:that.data.setvideourl,
              tongshilist:that.data.settongshilist,
              tongshivalue:that.data.tongshivalue,
              tongshititle:that.data.tongshititle,
              productvalue:that.data.productvalue,
              producttitle:that.data.producttitle,
              productlist:that.data.setproductlist,
              qiye:that.data.qiye,
              fenxiaoshang:that.data.fenxiaoshang,//分销商标志
              about:that.data.about,
              video:that.data.video,
              photo:that.data.photo,
              tongshi:that.data.tongshi,
              product:that.data.product,
              latitude:that.data.latitude,
              longitude:that.data.longitude,
              logoimg: that.data.setlogoimgList,
            },
            success: res => {
              wx.hideLoading()
              wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 2000
              })
              console.log('[add/update_carduser] success=>', res)
              setTimeout(function(){
                wx.navigateBack()
              },2500)
            },
            fail: res => {
              wx.hideLoading()
              wx.showToast({
                title: '保存失败',
                icon: 'none',
                duration: 2000
              })
              console.log(res)
            }
          })
        }
      })
    }else{
      wx.cloud.callFunction({
        name:'carduser',
        data:{
          openid:wx.getStorageSync('openid'),
          name:e.detail.value.setname,
          mobile:e.detail.value.setmobile,
          weChat:e.detail.value.setweChat,
          email:e.detail.value.setemail,
          img:that.data.setoneimg,
          textarea:e.detail.value.settextarea,
          organization:e.detail.value.setorganization,
          organizationid:that.data.organizationid,
          title:e.detail.value.settitle,
          address:e.detail.value.setaddress,
          zuoji:e.detail.value.setzuoji,
          imgsList:that.data.setimgList,
          videourl:that.data.setvideourl,
          tongshilist:that.data.settongshilist,
          tongshivalue:that.data.tongshivalue,
          tongshititle:that.data.tongshititle,
          productvalue:that.data.productvalue,
          producttitle:that.data.producttitle,
          productlist:that.data.setproductlist,
          qiye:that.data.qiye,
          fenxiaoshang:that.data.fenxiaoshang,//分销商标志
          about:that.data.about,
          video:that.data.video,
          photo:that.data.photo,
          tongshi:that.data.tongshi,
          product:that.data.product,
          latitude:that.data.latitude,
          longitude:that.data.longitude,
          logoimg: that.data.setlogoimgList,
        },
        success: res => {
          wx.hideLoading()
          wx.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 2000
          })
          console.log('[add/update_carduser] success=>', res)
          setTimeout(function(){
            wx.navigateBack()
          },2500)
        },
        fail: res => {
          wx.hideLoading()
          wx.showToast({
            title: '保存失败',
            icon: 'none',
            duration: 2000
          })
          console.log(res)
        }
      })
    }
  },

  //企业地址
  getLocation(){
    var that = this
    wx.chooseLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      isHighAccuracy: true,
      altitude:true,
      complete(res){
        console.log(res)
        if(res.errMsg == 'chooseLocation:ok'){
          that.setData({
            setorganization : res.name,
            address : res.address,
            latitude : res.latitude,
            longitude : res.longitude
          })
        }else{
          wx.showModal({
            title: '提示',
            content: '请开启位置授权',
            showCancel:false
          })
          return
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
                          mobile: res.result.data.phoneNumber,
                          weChat: res.result.data.phoneNumber
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
      fail: err => {
            wx.showToast({
                  title: '获取失败,请重新获取',
                  icon: 'none',
                  duration: 2000
            })
      }
    })
  },

  //
  tongshionClick() {
    $wuxSelect('#tongshi-select3').open({
        value: this.data.tongshivalue,
        multiple: true,
        toolbar: {
            title: '选择展示同事',
            confirmText: 'ok',
        },
        options: this.data.alltongshilist,
        onChange: (value, index, options) => {
            console.log('onChange', value, index, options)
            this.setData({
              tongshivalue: value,
              tongshititle: index.map((n) => options[n].title),
              settongshilist: index.map((n) => options[n]),
            })
        },
        onConfirm: (value, index, options) => {
            console.log('onConfirm', value, index, options)
            this.setData({
              tongshivalue: value,
              tongshititle: index.map((n) => options[n].title),
              settongshilist: index.map((n) => options[n]),
            })
        },
    })
  },

  productonClick() {
    $wuxSelect('#product-select3').open({
        value: this.data.productvalue,
        multiple: true,
        toolbar: {
            title: '选择展示产品',
            confirmText: 'ok',
        },
        options: this.data.allproductlist,
        onChange: (value, index, options) => {
            console.log('onChange', value, index, options)
            this.setData({
              productvalue: value,
              producttitle: index.map((n) => options[n].title),
              setproductlist: index.map((n) => options[n]),
            })
        },
        onConfirm: (value, index, options) => {
            console.log('onConfirm', value, index, options)
            this.setData({
              productvalue: value,
              producttitle: index.map((n) => options[n].title),
              setproductlist: index.map((n) => options[n]),
            })
        },
    })
  },

  //产品推荐开关
  productswitch(e){
    this.setData({
      product:e.detail.value
    })
  },

  //我的企业开关
  qiyeswitch(e){
    this.setData({
      qiye:e.detail.value
    })
  },

  //我的同事开关
  tongshiswitch(e){
    this.setData({
      tongshi:e.detail.value
    })
  },

  //简历开关
  aboutswitch(e){
    this.setData({
      about:e.detail.value
    })
  },

  //视频开关
  videoswitch(e){
    this.setData({
      video:e.detail.value,
      videourl:''
    })
  },

  //照片开关
  photoswitch(e){
    this.setData({
      photo:e.detail.value
    })
  },
  
  //企业选择
  PickerChange(e) {
    console.log(e);
    if(e.detail.value == this.data.organizationlist.length -1){
      this.setData({
        fenxiaoshang: true
      })
    }else{
      this.setData({
        fenxiaoshang: false
      })
    }
    this.setData({
      organizationid: this.data.organizationlist[ e.detail.value]._id,
      organization:this.data.organizationlist[ e.detail.value].name,
      setorganization:this.data.organizationlist[ e.detail.value].name,
      address:this.data.organizationlist[ e.detail.value].address,
      zuoji:this.data.organizationlist[ e.detail.value].zuoji,
      latitude:this.data.organizationlist[ e.detail.value].latitude,
      longitude:this.data.organizationlist[ e.detail.value].longitude,
      setlogoimgList:this.data.organizationlist[ e.detail.value].setlogoimgList[0],
    })
  },
  
  ChooseoneImage() {
    const uploadTasks = '';
    wx.chooseImage({
      count: 1, //默认1
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        this.setData({
          oneimg: res.tempFilePaths
        })
        var filename = res.tempFilePaths[0].substring(res.tempFilePaths[0].length - 13),
        // 并发上传文件
        uploadTasks = res.tempFilePaths.map(item => this.uploadFile(res.tempFilePaths[0], filename, 'image'))
        Promise.all(uploadTasks).then(result => {
          console.log("[上传文件] [result的值] =>", result)
          this.setData({
            setoneimg:[result[0].fileID]
          })
        }).catch(res => {
          wx.hideLoading()
          wx.showToast({ title: '文件上传错误', icon: 'error' })
          console.log('"[上传文件] [文件上传错误] =>', res)
        })
          
      }
    });
  },

  ChooseImage() {
    const uploadTasks = '';
    wx.chooseImage({
      count: 9, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            imgList: res.tempFilePaths
          })
        }
        console.log(this.data.imgList)
      }
    });
  },

  chooseVideo(){
    let that = this
    const filesdata = new Array();
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success(res) {
        console.log('[选择视频] =>',res)
        wx.showLoading({
          title: '上传中',
        })
        that.setData({
          videourl:res.tempFilePath
        })
        filesdata.push({
          filename: res.tempFilePath.substring(res.tempFilePath.length - 13),
          filetype: 'video',
          path: res.tempFilePath,
          size: res.size,
        })
        
        console.log('[文件上传][视频] [filesdata 数据] =>', filesdata)
        // 并发上传文件
        const uploadTasks = filesdata.map(item => that.uploadFile(item.path, item.filename, item.filetype))
        Promise.all(uploadTasks).then(result => {
          console.log("[上传文件] [视频] [result的值] =>", result)
          wx.hideLoading()
          that.setData({
            setvideourl:result[0].fileID
          })
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 2000
          })
          
        }).catch(err=>{
          wx.hideLoading()
          wx.showToast({ title: '文件上传错误', icon: 'none' })
          console.log('"[上传文件] [文件上传错误] =>', err)
        })
      }
    })
  },

  //上传文件
  uploadFile: function (filePath, filename, filetype) {
    const cloudPath = "dongming/"+wx.getStorageSync('openid')+"/"  + filename
    return wx.cloud.uploadFile({
      cloudPath,
      filePath,
    })
  },

  ViewoneImage(e) {
    wx.previewImage({
      urls: this.data.oneimg,
      current: e.currentTarget.dataset.url
    });
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  DeloneImg(e) {
    wx.showModal({
      title: '',
      content: '是否要删除？',
      cancelText: '否',
      confirmText: '是',
      success: res => {
        if (res.confirm) {
          this.data.oneimg.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            oneimg: this.data.oneimg
          })
        }
      }
    })
  },
  DelImg(e) {
    console.log(e)
    wx.showModal({
      title: '',
      content: '是否要删除？',
      cancelText: '否',
      confirmText: '是',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.data.setimgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
        }
      }
    })
  },
  
  textareaBInput(e) {
    this.setData({
      settextarea: e.detail.value
    })
  }
})