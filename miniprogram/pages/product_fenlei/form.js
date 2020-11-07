const app = getApp();
const util = require("../../utils/util.js");
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    _index: null,
    _data:{_id:-1},
    oneindex: null,
    onehidden:true,
    imgList: [],
    index:0,
    levellist:[{id:1,name:'一级分类'},{id:2,name:'二级分类'}]
  },
  onLoad:function(e){
    
    if(e.id == null || e.id ==''){
      console.log('新增进入1=>',e)
      this.setData({
        _onejifenlei:app.globalData.onejifenleilist
      })
    }else{
      console.log('跳转进入=>',e)
      if(app.globalData.guanlifenleidata[e.id].pid !== '0'){
        console.log('当前二级分类=>')
        for(var x in app.globalData.onejifenleilist){
          if(app.globalData.guanlifenleidata[e.id].pid == app.globalData.onejifenleilist[x]._id){
            this.setData({
              oneindex:x,
              onehidden:false
            })
          }
        }
      }
      this.setData({
        _data:app.globalData.guanlifenleidata[e.id],
        _onejifenlei:app.globalData.onejifenleilist,
        _index:app.globalData.guanlifenleidata[e.id].level,
        imgList:app.globalData.guanlifenleidata[e.id].icon
      })
    }
  },

  onShow:function(e){

  },

  uploadform(e){
    var that = this;
    var pid;
    var icon;
    console.log(e)
    var name = e.detail.value.name
    if (name == ""){
      wx.showModal({
        title: '提示',
        content: '请填写分类名称',
        showCancel:false
      })
      return
    }
    if(that.data._index == null){
      wx.showModal({
        title: '提示',
        content: '请选择分类级别',
        showCancel:false
      })
      return
    }
    if(that.data._index == 1 && !that.data.onehidden && that.data.oneindex == null){
      wx.showModal({
        title: '提示',
        content: '请选择上级分类',
        showCancel:false
      })
      return
    }
    if(!that.data.onehidden){
      pid = app.globalData.onejifenleilist[that.data.oneindex]._id
      icon = that.data.setoneimg
    }else{
      pid = 0
      icon = []
    }
    wx.showLoading({
      title: '上传中',
    })
    wx.cloud.callFunction({
      name:'productfenlei',
      data:{
        _id:that.data._data._id,
        createTime:util.formatTime(new Date()),
        organizationid:app.globalData.dongminguser.organizationid,
        icon:icon,
        name:name,
        level:that.data._index,
        pid:pid,
        isUse:true,
        careateOpenid: wx.getStorageSync('openid'),
      },
      success: res => {
        wx.hideLoading()
        wx.showToast({
          title: '保存成功',
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
          title: '保存失败',
          icon: 'none',
          duration: 2000
        })
        setTimeout(function(){
          wx.navigateBack()
        },2500)
        console.log('[云函数_productfenlei] success=>',res)
      }
    })
  },

  PickeroneChange(e) {
    console.log(e);
    this.setData({
      oneindex: e.detail.value
    })
  },
  PickerChange(e) {
    console.log(e);
    //二级分类
    if(e.detail.value == 1){
      this.setData({
        onehidden:false
      })
    }else{
      this.setData({
        onehidden:true
      })
    }
  
    this.setData({
      _index: e.detail.value
    })
  },
  
  ChooseImage() {
    wx.chooseImage({
      count: 1, //默认1
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        wx.showLoading({
          title: '上传中',
        })
        this.setData({
          imgList: res.tempFilePaths
        })
        var filename = res.tempFilePaths[0].substring(res.tempFilePaths[0].length - 13),
        // 并发上传文件
        uploadTasks = res.tempFilePaths.map(item => this.uploadFile(res.tempFilePaths[0], filename, 'image'))
        Promise.all(uploadTasks).then(result => {
          console.log("[上传文件] [result的值] =>", result)
          wx.hideLoading()
          this.setData({
            setoneimg:[result[0].fileID]
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

  //上传文件
  uploadFile: function (filePath, filename, filetype) {
    const cloudPath = "fenlei/" +wx.getStorageSync('openid')+"/" + filename
    return wx.cloud.uploadFile({
      cloudPath,
      filePath,
    })
  },

  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  DelImg(e) {
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      cancelText: '是',
      confirmText: '否',
      success: res => {
        if (res.cancel) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
        }
      }
    })
  },
  
})