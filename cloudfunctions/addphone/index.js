// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()//链接数据库
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  try{
    await db.collection('dongming_user').where({ _openid: event.openid }).update({
      data:{
        phone:event.phone,//点赞次数
      }
    })
    await db.collection('userlookcard').where({ _openid: event.openid }).update({
      data:{
        phone:event.phone
      }
    })
  }catch(e){
    console.error(e)
  }
}