//chat.js
//获取应用实例
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const util = require("../../utils/util.js");

Page({
  data: {
    friends: [],
    page:1,//当前tab页的页码数
  },
  onShow(){
    this.gofriends();
  },

  //获取类别
  gofriends(){
    var that = this
    var _page = that.data.page;
    db.collection('chatlist').where({ cardid: wx.getStorageSync('openid') }).skip((_page - 1) * 15).limit(15).get().then(res=>{
      if(res.data.length == 0){
        that.setData({
          jiazai:true
        })
        return false
      }
      if(_page == 1){
        that.setData({
          friends:res.data,
          page: _page + 1
        })
      }else{
        that.setData({
          friends:that.data.friends.concat(res.data),
          page: _page + 1
        })
      }
      that.setData({
        jiazai:true
      })
      console.log(that.data.friends)
    })
  },

  //该方法绑定了页面滑动到底部的事件
  onReachBottom: function () {
    this.gofriends();
  },

  gotoChat(event) {
    console.log(event)
    const userid = event.currentTarget.dataset.data.userid;
    const nickname = event.currentTarget.dataset.data.nickname;
    wx.navigateTo({
      url: '/pages/chat/chat?cardid='+wx.getStorageSync('openid')+'&userid='+userid+'&nickname='+nickname+'&dis=1'
    })
  }
})
