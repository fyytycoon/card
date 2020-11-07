// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
      return db.collection('chatroom').add({
        // data 字段表示需新增的 JSON 数据
        data: {
          _id: event._id,
          groupId: event.groupId,
          avatar: event.avatar,
          nickName:event.nickName,
          msgType: event.msgType,
          textContent: event.textContent,
          sendTime: event.sendTime,
          sendTimeTS: event.sendTimeTS, // fallback
          _openid: event._openid
        }
      })
  } catch (e) {
    console.error(e)
  }
}