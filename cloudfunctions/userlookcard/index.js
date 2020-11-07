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
    await db.collection('userlookcard').add({
      data:{
        nick_name: event.nick_name,
        gender: event.gender,
        language: event.language,
        city: event.city,
        province: event.province,
        avatar_url: event.avatar_url,
        country: event.country,
        createTime: event.createTime,
        _openid: event.openid,
        cardopenid: event.cardopenid,
        cardname:event.cardname,
        cardorganization:event.cardorganization,
        cardtitle:event.cardtitle,
        cardimg:event.cardimg,
        like:event.like,
        phone:event.phone
      }
    })
    await db.collection('carduser_list').where({ _openid: event.cardopenid }).update({
      data:{
        lookcount:event.lookcount,//浏览次数
        likeAvatarUrl:event.likeAvatarUrl
      }
    })
  }catch(e){
    console.error(e)
  }
}