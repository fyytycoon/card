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
    console.log(event.lookcount)
    console.log(event.likeAvatarUrl)
    await db.collection('carduser_list').where({ _openid: event.nowopenid }).update({
      data:{
        lookcount:event.lookcount,//浏览次数
        likeAvatarUrl:event.likeAvatarUrl
      }
    })
  }catch(e){
    console.error(e)
  }
}