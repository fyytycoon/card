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
    if(event.yichu){
      await db.collection('organizationstaff').where({ _id: event._id }).update({
        data:{dz: false}
      })
    }else{
      await db.collection('organizationstaff').where({ _id: event._id }).update({
        data:{dz: true}
      })
      await db.collection('dongming_user').where({ _openid: event._openid }).update({
        data:{
          organization: event.organization,
          organizationid: event.organizationid
        }
      })
    }
    
  }catch(e){
    console.error(e)
  }
}