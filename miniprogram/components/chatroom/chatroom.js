const FATAL_REBUILD_TOLERANCE = 10
const SETDATA_SCROLL_TO_BOTTOM = {
  scrollTop: 100000,
  scrollWithAnimation: true,
}
const app = getApp();
const db = wx.cloud.database()
const _ = db.command
const util = require("../../utils/util.js");

Component({
  properties: {
    collection: String,
    groupId: String,
    groupName: String,
    userInfo: Object,
    cardInfo: Object,
    lookopenId:String,
    dis:String
  },

  data: {
    chats: [],
    textInputValue: '',
    openId: '',
    scrollTop: 0,
    scrollToMessage: '',
    hasKeyboard: false,
    nums:0,
    header:true,
    focus: false
  },

  methods: {    
    mergeCommonCriteria(criteria) {
      console.log({
        groupId: this.data.groupId,
        ...criteria,
      })
      return {
        groupId: this.data.groupId,
        ...criteria,
      }
    },

    async initRoom() {
      var that = this
      this.try(async () => {
        const { data: initList } = await db.collection('chatroom').where(this.mergeCommonCriteria()).orderBy('sendTimeTS', 'desc').get()
        console.log('init query chats', initList)
        if(initList.length == 0){
          wx.cloud.callFunction({
            // 云函数名称
            name: 'chatroom1',
            // 传给云函数的参数
            data: {
              _id: `${Math.random()}_${Date.now()}`,
              groupId: that.data.groupId,
              avatar: that.data.cardInfo.img[0],
              nickName: that.data.cardInfo.name,
              msgType: 'text',
              textContent: '您好!欢迎进入我的名片.有什么可以帮到您的.',
              sendTime: new Date(),
              sendTimeTS: Date.now(), // fallback
              _openid: that.data.cardInfo._openid
            },
            complete: res => {
              console.log(res)
            }
          })
        }
        this.setData({
          chats: initList.reverse(),
          scrollTop: 10000,
        })
        this.initWatch(initList.length ? {
          sendTimeTS: _.gt(initList[initList.length - 1].sendTimeTS),
        } : {})
      }, '初始化失败')
    },

    async initWatch(criteria) {
      this.try(() => {
        const FATAL_REBUILD_TOLERANCE = 10
        console.log(`开始监听`, criteria)
        this.messageListener = db.collection('chatroom').where(this.mergeCommonCriteria(criteria)).watch({
          onChange:this.onRealtimeMessageSnapshot.bind(this), 
          onError: e => {
            if (!this.inited || this.data.fatalRebuildCount >= FATAL_REBUILD_TOLERANCE) {
              this.showError(this.inited ? '监听错误，已断开' : '初始化监听失败', e, '重连', () => {
                this.initWatch(this.data.chats.length ? {
                  sendTimeTS: _.gt(this.data.chats[this.data.chats.length - 1].sendTimeTS),
                } : {})
              })
            } else {
              this.initWatch(this.data.chats.length ? {
                sendTimeTS: _.gt(this.data.chats[this.data.chats.length - 1].sendTimeTS),
              } : {})
            }
          },
        })
      }, '初始化监听失败')
    },

    onRealtimeMessageSnapshot(snapshot) {
      console.log(`收到消息`, snapshot)
  
      if (snapshot.type === 'init') {
        this.setData({
          chats: [
            ...this.data.chats,
            ...[...snapshot.docs].sort((x, y) => x.sendTimeTS - y.sendTimeTS),
          ],
        })
        console.log(this.data.chats)
        this.scrollToBottom()
        this.inited = true
      } else {
        let hasNewMessage = false
        let hasOthersMessage = false
        const chats = [...this.data.chats]
        for (const docChange of snapshot.docChanges) {
          switch (docChange.queueType) {
            case 'enqueue': {
              hasOthersMessage = docChange.doc._openid !== this.data.openId
              const ind = chats.findIndex(chat => chat._id === docChange.doc._id)
              if (ind > -1) {
                if (chats[ind].msgType === 'image' && chats[ind].tempFilePath) {
                  chats.splice(ind, 1, {
                    ...docChange.doc,
                    tempFilePath: chats[ind].tempFilePath,
                  })
                } else chats.splice(ind, 1, docChange.doc)
              } else {
                hasNewMessage = true
                chats.push(docChange.doc)
              }
              break
            }
          }
        }
        this.setData({
          chats: chats.sort((x, y) => x.sendTimeTS - y.sendTimeTS),
        })
        if (hasOthersMessage || hasNewMessage) {
          this.scrollToBottom()
        }
      }
    },

    async onConfirmSendText(e) {
      console.log('发送消息',e)
      this.try(async () => {
        if (!e.detail.value) {
          return
        }
        const doc = {
          _id: `${Math.random()}_${Date.now()}`,
          groupId: this.data.groupId,
          avatar: this.data.userInfo.avatarUrl,
          nickName: this.data.userInfo.nickName,
          msgType: 'text',
          textContent: e.detail.value,
          sendTime: new Date(),
          sendTimeTS: Date.now(), // fallback
        }

        this.setData({
          textInputValue: '',
          chats: [
            ...this.data.chats,
            {
              ...doc,
              _openid: this.data.openId,
              writeStatus: 'pending',
            },
          ],
        })
        this.scrollToBottom(true)

        await db.collection('chatroom').add({
          data: doc,
        })

        this.setData({
          chats: this.data.chats.map(chat => {
            if (chat._id === doc._id) {
              return {
                ...chat,
                writeStatus: 'written',
              }
            } else return chat
          }),
        })
      }, '发送文字失败')
      if(wx.getStorageSync('openid') !== this.data.lookopenId){
        console.log('回消息')
        var nums = 1
        const res = await db.collection('chatlist').where({ cardid: this.data.lookopenId,userid: wx.getStorageSync('openid') }).get();
          console.log(res,this.data.lookopenId)
          if(res.data.length !== 0){
            nums = res.data[0].nums + 1
          }
          wx.cloud.callFunction({
            // 云函数名称
            name: 'chatlist',
            // 传给云函数的参数
            data: {
              photo:this.data.userInfo.avatarUrl,
              nickname: this.data.userInfo.nickName,
              nums:nums,
              time:util.formatTime(new Date()),
              message: e.detail.value,
              userid: wx.getStorageSync('openid'),
              cardid: this.data.lookopenId
            },
            complete: res => {
              console.log('[app.js][chatlist][over] =>', res)
            }
          })
      }
    },
    async formConfirmSendText(e) {
      console.log('发送消息',e)
      this.try(async () => {
        if (!e.detail.value.textInputValue) {
          return
        }
        const doc = {
          _id: `${Math.random()}_${Date.now()}`,
          groupId: this.data.groupId,
          avatar: this.data.userInfo.avatarUrl,
          nickName: this.data.userInfo.nickName,
          msgType: 'text',
          textContent: e.detail.value.textInputValue,
          sendTime: new Date(),
          sendTimeTS: Date.now(), // fallback
        }

        this.setData({
          textInputValue: '',
          chats: [
            ...this.data.chats,
            {
              ...doc,
              _openid: this.data.openId,
              writeStatus: 'pending',
            },
          ],
        })
        this.scrollToBottom(true)

        await db.collection('chatroom').add({
          data: doc,
        })

        this.setData({
          chats: this.data.chats.map(chat => {
            if (chat._id === doc._id) {
              return {
                ...chat,
                writeStatus: 'written',
              }
            } else return chat
          }),
        })
      }, '发送文字失败')
      if(wx.getStorageSync('openid') !== this.data.lookopenId){
        console.log('回消息')
        var nums = 1
        const res = await db.collection('chatlist').where({ cardid: this.data.lookopenId,userid: wx.getStorageSync('openid') }).get();
          console.log(res,this.data.lookopenId)
          if(res.data.length !== 0){
            nums = res.data[0].nums + 1
          }
          wx.cloud.callFunction({
            // 云函数名称
            name: 'chatlist',
            // 传给云函数的参数
            data: {
              photo:this.data.userInfo.avatarUrl,
              nickname: this.data.userInfo.nickName,
              nums:nums,
              time:util.formatTime(new Date()),
              message: e.detail.value,
              userid: wx.getStorageSync('openid'),
              cardid: this.data.lookopenId
            },
            complete: res => {
              console.log('[app.js][chatlist][over] =>', res)
            }
          })
      }
    },

    async onChooseImage(e) {
      wx.chooseImage({
        count: 1,
        sourceType: ['album', 'camera'],
        success: async res => {
          const doc = {
            _id: `${Math.random()}_${Date.now()}`,
            groupId: this.data.groupId,
            avatar: this.data.userInfo.avatarUrl,
            nickName: this.data.userInfo.nickName,
            msgType: 'image',
            sendTime: new Date(),
            sendTimeTS: Date.now(), // fallback
          }

          this.setData({
            chats: [
              ...this.data.chats,
              {
                ...doc,
                _openid: this.data.openId,
                tempFilePath: res.tempFilePaths[0],
                writeStatus: 0,
              },
            ]
          })
          this.scrollToBottom(true)

          const uploadTask = wx.cloud.uploadFile({
            cloudPath: `${this.data.openId}/${Math.random()}_${Date.now()}.${res.tempFilePaths[0].match(/\.(\w+)$/)[1]}`,
            filePath: res.tempFilePaths[0],
            
            success: res => {
              this.try(async () => {
                await db.collection('chatroom').add({
                  data: {
                    ...doc,
                    imgFileID: res.fileID,
                  },
                })
              }, '发送图片失败')
            },
            fail: e => {
              this.showError('发送图片失败', e)
            },
          })

          uploadTask.onProgressUpdate(({ progress }) => {
            this.setData({
              chats: this.data.chats.map(chat => {
                if (chat._id === doc._id) {
                  return {
                    ...chat,
                    writeStatus: progress,
                  }
                } else return chat
              })
            })
          })
        },
      })
      if(wx.getStorageSync('openid') !== this.data.lookopenId){
        console.log('回消息')
        var nums = 1
        const res = await db.collection('chatlist').where({ cardid: this.data.lookopenId,userid: wx.getStorageSync('openid') }).get();
          console.log(res,this.data.lookopenId)
          if(res.data.length !== 0){
            nums = res.data[0].nums + 1
          }
          wx.cloud.callFunction({
            // 云函数名称
            name: 'chatlist',
            // 传给云函数的参数
            data: {
              photo:this.data.userInfo.avatarUrl,
              nickname: this.data.userInfo.nickName,
              nums:nums,
              time:util.formatTime(new Date()),
              message: '[图片 ]',
              userid: wx.getStorageSync('openid'),
              cardid: this.data.lookopenId
            },
            complete: res => {
              console.log('[app.js][chatlist][over] =>', res)
            }
          })
      }
    },

    onMessageImageTap(e) {
      wx.previewImage({
        urls: [e.target.dataset.fileid],
      })
    },

    scrollToBottom(force) {
      console.log(force)
      if (force) {
        console.log('force scroll to bottom')
        this.setData(SETDATA_SCROLL_TO_BOTTOM)
        console.log(SETDATA_SCROLL_TO_BOTTOM)
        return
      }

      this.createSelectorQuery().select('.body').boundingClientRect(bodyRect => {
        console.log(bodyRect)
        this.createSelectorQuery().select(`.body`).scrollOffset(scroll => {
        console.log(scroll)
          if (scroll.scrollTop + bodyRect.height * 3 > scroll.scrollHeight) {
            console.log('should scroll to bottom')
            this.setData(SETDATA_SCROLL_TO_BOTTOM)
          }
        }).exec()
      }).exec()
    },

    async onScrollToUpper() {
      console.log('onScrollToUpper()')
      if (this.data.chats.length) {
        
        const { data } = await db.collection('chatroom').where(this.mergeCommonCriteria({
          sendTimeTS: _.lt(this.data.chats[0].sendTimeTS),
        })).orderBy('sendTimeTS', 'desc').get()
        this.data.chats.unshift(...data.reverse())
        console.log(this.data.chats)
        this.setData({
          chats: this.data.chats,
          scrollToMessage: `item-${data.length}`,
          scrollWithAnimation: false,
        })
        console.log(this.data.scrollToMessage)
      }
    },

    //拨打电话
  callPhone(){
    wx.makePhoneCall({
      phoneNumber: this.data.phoneNumber
    })
  },

  //复制
  copyData(){
    wx.setClipboardData({
      data: this.data.weChat,
      success: (res) => {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        })
      }
    })
  },

  //请联系我
  goOrder(){
    var that = this
      console.log('发送消息')
      that.try(async () => {
        const doc = {
          _id: `${Math.random()}_${Date.now()}`,
          groupId: that.data.groupId,
          avatar: that.data.userInfo.avatarUrl,
          nickName: that.data.userInfo.nickName,
          msgType: 'tishi',
          textContent: '',
          sendTime: new Date(),
          sendTimeTS: Date.now(), // fallback
        }
        that.setData({
          textInputValue: '',
          chats: [
            ...that.data.chats,
            {
              ...doc,
              _openid: that.data.openId,
            },
          ],
        })
        that.scrollToBottom(true)

        db.collection('chatroom').add({
          data: doc,
        })

        that.setData({
          chats: that.data.chats.map(chat => {
            if (chat._id === doc._id) {
              return {
                ...chat,
                writeStatus: 'written',
              }
            } else return chat
          }),
        })
      }, '发送文字失败')
      if(wx.getStorageSync('openid') !== that.data.lookopenId){
        console.log('回消息')
        var nums = 1
        db.collection('chatlist').where({ cardid: that.data.lookopenId,userid: wx.getStorageSync('openid') }).get().then(res=>{
          if(res.data.length !== 0){
            nums = res.data[0].nums + 1
          }
          wx.cloud.callFunction({
            // 云函数名称
            name: 'chatlist', 
            // 传给云函数的参数
            data: {
              photo:that.data.userInfo.avatarUrl,
              nickname: that.data.userInfo.nickName,
              nums:nums,
              time:util.formatTime(new Date()),
              message: '请电话联系我！',
              userid: wx.getStorageSync('openid'),
              cardid: that.data.lookopenId
            },
            success: res => {
              console.log('[app.js][chatlist][over] =>', res)
              wx.showToast({
                title: '请保持电话畅通，稍后与您联系',
                icon: 'none',
                duration: 2000
              })
            },
            fail: res=>{
              console.log('[app.js][chatlist][over] =>', res)
            }
          })
        })
      }
  },

  bindfocus(e){
    console.log(e)
  },

    async try(fn, title) {
      try {
        await fn()
      } catch (e) {
        this.showError(title, e)
      }
    },

    showError(title, content, confirmText, confirmCallback) {
      console.error(title, content)
      wx.showModal({
        title,
        content: content.toString(),
        showCancel: confirmText ? true : false,
        confirmText,
        success: res => {
          res.confirm && confirmCallback()
        },
      })
    },
  },

  ready() {
    global.chatroom = this
    this.initRoom()
    this.fatalRebuildCount = 0
    this.setData({
      openId:wx.getStorageSync('openid'),
    })
    console.log(this.data.dis,this.data.cardInfo)
    if(this.data.dis == '0'){
      this.setData({
        phoneNumber:this.data.cardInfo.mobile,
        weChat:this.data.cardInfo.weChat,
      })
    }else{
      this.setData({
        header:false,
      })
    }
  },
})
