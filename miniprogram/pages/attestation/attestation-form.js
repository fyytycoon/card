const app = getApp();
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgList: [],
    logoimgList: [],
    setlogoimgList: [],
    Locationname:'',
    address:'',
    latitude:'',
    longitude:'',
    setimgList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  getLocation(){
    var that = this
    wx.chooseLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      isHighAccuracy: true,
      altitude:true,
      success(res){
        that.setData({
          Locationname : res.name,
          address : res.address,
          latitude : res.latitude,
          longitude : res.longitude
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

  uploadform(e){
    console.log(e)
    var that = this;
    var name = e.detail.value.name;
    var zuoji = e.detail.value.zuoji;
    var address = that.data.address;
    var linkmanphone = that.data.linkmanphone;

    if (name == ""){
      wx.showModal({
        title: '提示',
        content: '请填写企业名称',
        showCancel:false
      })
      return
    }
    if (zuoji == ""){
      wx.showModal({
        title: '提示',
        content: '请填写企业座机',
        showCancel:false
      })
      return
    }
    if (address == ""){
      wx.showModal({
        title: '提示',
        content: '请填写企业地址',
        showCancel:false
      })
      return
    }
    if (linkmanphone == ""){
      wx.showModal({
        title: '提示',
        content: '请填写手机号码',
        showCancel:false
      })
      return
    }
    if (that.data.latitude == ""){
      wx.showModal({
        title: '提示',
        content: '请重新获取位置',
        showCancel:false
      })
      return
    }
    if (that.data.setlogoimgList.length == 0){
      wx.showModal({
        title: '提示',
        content: '请企业相关营业执照',
        showCancel:false
      })
      return
    }
    if (that.data.imgList.length == 0){
      wx.showModal({
        title: '提示',
        content: '请企业相关营业执照',
        showCancel:false
      })
      return
    }
    if(that.data.imgList.length !== 0){
      wx.showLoading({
        title: '保存中',
      })
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
    }
    // 调用监听器，监听数据变化
    app.watch(that, {
      setimgList: function (newVal) {
        console.log('数据监听=>')
        wx.cloud.callFunction({
          name:'organizationlist',
          data:{
            _id:'',
            _openid:wx.getStorageSync('openid'),
            name: name,
            zuoji: zuoji,
            address: address,
            linkmanphone: linkmanphone,
            latitude : that.data.latitude,
            longitude : that.data.longitude,
            setimgList: newVal,
            setlogoimgList: that.data.setlogoimgList,
            dz: false
          },
          success: res => {
            wx.showToast({
              title: '成功,待平台审核',
              icon: 'success',
              duration: 2000
            })
            
            console.log('[add/update_organizationlist] success=>', res)
          },
          fail: res => {
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
                          linkmanphone: res.result.data.phoneNumber
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


  ChooseImage() {
    wx.chooseImage({
      count: 4, //默认9
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
      }
    });
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  DelImg(e) {
    wx.showModal({
      title: '召唤师',
      content: '确定要删除吗？',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
        }
      }
    })
  },

  //logo
  ChooselogoImage() {
    wx.chooseImage({
      count: 1, //默认1
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        wx.showLoading({
          title: '上传中',
        })
        this.setData({
          logoimgList: res.tempFilePaths
        })
        var filename = res.tempFilePaths[0].substring(res.tempFilePaths[0].length - 13),
        // 并发上传文件
        uploadTasks = res.tempFilePaths.map(item => this.uploadFile(res.tempFilePaths[0], filename, 'image'))
        Promise.all(uploadTasks).then(result => {
          console.log("[上传文件] [result的值] =>", result)
          wx.hideLoading()
          this.setData({
            setlogoimgList:[result[0].fileID]
          })
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 2000
          })
        }).catch(res => {
          wx.hideLoading()
          wx.showToast({ title: '文件上传错误', icon: 'error' })
          console.log('"[上传文件] [文件上传错误] =>', res)
        })
      }
    })
  },

  ViewlogoImage(e) {
    wx.previewImage({
      urls: this.data.logoimgList,
      current: e.currentTarget.dataset.url
    });
  },
  DellogoImg(e) {
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      cancelText: '是',
      confirmText: '否',
      success: res => {
        if (res.cancel) {
          this.data.logoimgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            logoimgList: this.data.logoimgList
          })
        }
      }
    })
  },

  //上传文件
  uploadFile: function (filePath, filename, filetype) {
    const cloudPath = "dongming/qiye/"  + filename
    return wx.cloud.uploadFile({
      cloudPath,
      filePath,
    })
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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