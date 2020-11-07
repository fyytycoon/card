// const { setFlavor } = require("../../wxParse/showdown");
const util = require("../../utils/util.js");

const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    _data:{
      
    },
    oneindex: null,
    erjiindex: null,
    luesuotuimgList: [],
    imgList: [],
    xijieimgList: [],
    erji:false,
    erjiswitch:false
  },
  onLoad(e){
    if(e.id == null || e.id ==''){
      console.log('新增进入=>',e)
      this.setData({
        guanlionejifenleilist:app.globalData.guanlionejifenleilist,
        _data:{_id:0},
      })
    }else{
      console.log('跳转进入=>',e)
      console.log(app.globalData.guanlichanpinliList[e.id])
    this.setData({
      _data:app.globalData.guanlichanpinliList[e.id],
      oneindex: app.globalData.guanlichanpinliList[e.id].oneindex,
      erjiindex: app.globalData.guanlichanpinliList[e.id].erjiindex,
      luesuotuimgList:[app.globalData.guanlichanpinliList[e.id].pic],
      imgList:app.globalData.guanlichanpinliList[e.id].pics,
      xijieimgList:app.globalData.guanlichanpinliList[e.id].xijieimgList,
      guanlichanpinliList:app.globalData.guanlichanpinliList,
      guanlifenleidata:app.globalData.guanlifenleidata,
      guanlionejifenleilist:app.globalData.guanlionejifenleilist,
      // guanlierjilist:app.globalData.guanlierjilist
    })
    if(app.globalData.guanlierjilist[app.globalData.guanlichanpinliList[e.id].oneindex].length  !== 0 ){
      this.setData({
        erji : true,
        erjiswitch : true,
        guanlierjilist:app.globalData.guanlierjilist[app.globalData.guanlichanpinliList[e.id].oneindex]
      })
    }
    }
    
  },

  uploadform(e){
    var that = this;
    console.log(that.data.setoneimg)
    console.log(that.data.imgList)
    console.log(that.data.xijieimgList)
    console.log(that.data.oneindex)
    console.log(that.data.erjiindex)
    var seterjiindex
    var categoryId
    var categoryoneId
    var name = e.detail.value.name
    if(that.data.oneindex == "" || that.data.oneindex == null){
      wx.showModal({
        title: '提示',
        content: '请选择一级分类',
        showCancel:false
      })
      return
    }
    if (name == ""){
      wx.showModal({
        title: '提示',
        content: '请填写产品名称',
        showCancel:false
      })
      return
    }
    if(that.data.luesuotuimgList.length == 0){
      wx.showModal({
        title: '提示',
        content: '请上传产品略缩图',
        showCancel:false
      })
      return
    }
    if(that.data.imgList.length == 0){
      wx.showModal({
        title: '提示',
        content: '请上传产品图片',
        showCancel:false
      })
      return
    }
    
    
    if(that.data.erji && that.data.erjiswitch){
      if(that.data.erjiindex == "" || that.data.erjiindex == null){
        wx.showModal({
          title: '提示',
          content: '请选择二级分类',
          showCancel:false
        })
        return
      }
      seterjiindex = that.data.erjiindex
      categoryId = that.data.guanlierjilist[that.data.erjiindex]._id
      categoryoneId = that.data.guanlionejifenleilist[that.data.oneindex]._id
    }else{
      seterjiindex = null
      categoryId = that.data.guanlionejifenleilist[that.data.oneindex]._id
      categoryoneId = that.data.guanlionejifenleilist[that.data.oneindex]._id
    }
    wx.showLoading({
      title: '保存中',
    })
    wx.cloud.callFunction({
      name:'productdata-add',
      data:{
        _id:that.data._data._id,
        createTime:util.formatTime(new Date()),
        name:name,
        oneindex:that.data.oneindex,
        seterjiindex:seterjiindex,
        categoryId:categoryId,
        categoryoneId:categoryoneId,
        pic:that.data.setoneimg,
        pics:that.data.imgList,
        numberlook:0,
        xijieimgList:that.data.xijieimgList,
        organizationid:app.globalData.dongminguser.organizationid,
        flag: true
      },
      success: res => {
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        })
        console.log('[add/update_productdata] success=>', res)
        setTimeout(function(){
          wx.navigateBack()
        },2500)
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
    

  },

  //二级开关
  erjiswitch(e){
    this.setData({
      erji:e.detail.value
    })
  },

  PickerChange(e) {
    console.log(e.detail.value);
    if(app.globalData.guanlierjilist[e.detail.value].length  !== 0 ){
      console.log(app.globalData.guanlierjilist[e.detail.value])
      this.setData({
        erji : true,
        erjiswitch: true,
        guanlierjilist:app.globalData.guanlierjilist[e.detail.value]
      })
    }else{
      this.setData({
        erji : false,
        erjiswitch: false,
        guanlierjilist:[]
      })
    }
    this.setData({
      oneindex: e.detail.value
    })
  },

  PickererjiChange(e) {
    console.log(e.detail.value);
    
    this.setData({
      erjiindex: e.detail.value
    })
  },

  ChooseluesuotuImage() {
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        this.setData({
          luesuotuimgList: this.data.luesuotuimgList.concat(res.tempFilePaths)
        })
        wx.showLoading({
          title: '上传中',
        })
        var filename = res.tempFilePaths[0].substring(res.tempFilePaths[0].length - 13),
        // 并发上传文件
        uploadTasks = res.tempFilePaths.map(item => this.uploadFile(res.tempFilePaths[0], filename, 'image'))
        Promise.all(uploadTasks).then(result => {
          console.log("[上传文件] [result的值] =>", result)
          wx.hideLoading()
          this.setData({
            setoneimg:result[0].fileID
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
    });
  },

  //上传文件
  uploadFile: function (filePath, filename, filetype) {
    const cloudPath = "product/"+wx.getStorageSync('openid')+"/"+  filename
    return wx.cloud.uploadFile({
      cloudPath,
      filePath,
    })
  },
  ViewluesuotuImage(e) {
    wx.previewImage({
      urls: this.data.luesuotuimgList,
      current: e.currentTarget.dataset.url
    });
  },
  
  DelluesuotuImg(e) {
    wx.showModal({
      title: '提示',
      content: '确定要删除？',
      cancelText: '否',
      confirmText: '是',
      success: res => {
        if (res.confirm) {
          this.data.luesuotuimgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            luesuotuimgList: this.data.luesuotuimgList
          })
        }
      }
    })
  },
  
  ChooseImage() {
    wx.chooseImage({
      count: 6, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        console.log(res)
        wx.showLoading({
          title: '上传中',
        })
          const filesdata = new Array()
          const lsdata = new Array()
          for (let i = 0; i < res.tempFilePaths.length; ++i) {
            filesdata.push({
              filename: res.tempFilePaths[i].substring(res.tempFilePaths[i].length - 13),
              filetype: 'image',
              path: res.tempFilePaths[i],
            })
          }
          console.log('[文件上传] [filesdata 数据] =>', filesdata)
          // 并发上传文件
          const uploadTasks = filesdata.map(item => this.uploadFile(item.path, item.filename, item.filetype))
          Promise.all(uploadTasks).then(result => {
            console.log("[上传文件] [result的值] =>", result)
            for (let i = 0; i < result.length; ++i) {
              if (result[i].errMsg == 'cloud.uploadFile:ok') {
                lsdata.push(result[i].fileID)
              }
            }

            if(this.data.imgList.length !== 0){
              if(this.data.imgList[0].indexOf('cloud') >= 0){
                this.setData({
                  imgList:this.data.imgList.concat(lsdata)
                })
              }
            }else{
              this.setData({
                imgList:lsdata
              })
            }
            console.log(this.data.imgList)
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
    });
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  DelImg(e) {
    console.log(e)
    wx.showModal({
      title: '提示',
      content: '确定要删除？',
      cancelText: '否',
      confirmText: '是',
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

  ChoosexijieImage() {
    wx.chooseImage({
      count: 9, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        wx.showLoading({
          title: '上传中',
        })
        const filesdata = new Array()
        const lsdata = new Array()
        for (let i = 0; i < res.tempFilePaths.length; ++i) {
          filesdata.push({
            filename: res.tempFilePaths[i].substring(res.tempFilePaths[i].length - 13),
            filetype: 'image',
            path: res.tempFilePaths[i],
          })
        }
        console.log('[文件上传] [filesdata 数据] =>', filesdata)
        // 并发上传文件
        const uploadTasks = filesdata.map(item => this.uploadFile(item.path, item.filename, item.filetype))
        Promise.all(uploadTasks).then(result => {
          console.log("[上传文件] [result的值] =>", result)
          for (let i = 0; i < result.length; ++i) {
            if (result[i].errMsg == 'cloud.uploadFile:ok') {
              lsdata.push(result[i].fileID)
            }
          }
          if(this.data.xijieimgList.length !== 0){
            if(this.data.xijieimgList[0].indexOf('cloud') >= 0){
              this.setData({
                xijieimgList:this.data.xijieimgList.concat(lsdata)
              })
            }
          }else{
            this.setData({
              xijieimgList:lsdata
            })
          }
          
          console.log(this.data.xijieimgList)
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
    });
  },
  ViewxijieImage(e) {
    wx.previewImage({
      urls: this.data.xijieimgList,
      current: e.currentTarget.dataset.url
    });
  },
  DelxijieImg(e) {
    console.log(e)
    wx.showModal({
      title: '提示',
      content: '确定要删除？',
      cancelText: '否',
      confirmText: '是',
      success: res => {
        if (res.confirm) {
          this.data.xijieimgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            xijieimgList: this.data.xijieimgList
          })
        }
      }
    })
  },
  
})