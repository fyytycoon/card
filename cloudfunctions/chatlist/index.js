// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const pro = await db.collection('chatlist').where({ cardid: event.cardid,userid: event.userid }).get();
    if(pro.data.length>0){ //说明数据已存在
      console.log("chatlist [update]")
      return db.collection('chatlist').where({ cardid: event.cardid,userid: event.userid }).update({
        data: {
          photo:event.photo,
          nickname:event.nickname,
          nums:event.nums,
          time:event.time,
          message:event.message,
          userid:event.userid
        }
      })
    }else{
      console.log("chatlist [add] =>")
      return db.collection('chatlist').add({
        // data 字段表示需新增的 JSON 数据
        data: {
          photo:event.photo,
          nickname:event.nickname,
          nums:event.nums,
          time:event.time,
          message:event.message,
          userid:event.userid,
          cardid:event.cardid
        }
      })
    }
  } catch (e) {
    console.error(e)
  }
}