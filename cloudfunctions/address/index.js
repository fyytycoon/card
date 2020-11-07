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
    await db.collection('address').add({
      data:{
        openid:event.openid,
        region:event.region,
        linkMan:event.linkMan,
        address:event.address,
        mobile:event.mobile,
        code:event.code
      }
    })
  }catch(e){
    console.error(e)
  }
}