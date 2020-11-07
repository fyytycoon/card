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
    await db.collection('carduser_list').where({ _openid: event.nowopenid }).update({
      data:{
        dianzancount:event.dianzancount,//点赞次数
      }
    })
    await db.collection('userlookcard').where({ _openid: event.openid,cardopenid:event.nowopenid  }).update({
      data:{
        like:event.like
      }
    })
  }catch(e){
    console.error(e)
  }
}