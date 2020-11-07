// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()//链接数据库
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    if(!event.isUse){
      return db.collection('productfenlei').where({_id:event._id}).remove().then(res=>{
        console.log(res)
      })
    }
    console.log('id值=>',event._id)
    const pro = await db.collection('productfenlei').where({_id: event._id}).get();
    if(pro.data.length>0){ //说明数据已存在
      console.log("productfenlei [update]")
      return db.collection('productfenlei').where({ _id: event._id }).update({
        data: {
          createTime: event.createTime,
          organizationid: event.organizationid,
          icon: event.icon,
          name: event.name,
          level: event.level,
          pid: event.pid,
          isUse: event.isUse,
          careateOpenid: event.careateOpenid,
        }
      })
    }else{
      console.log("productfenlei [add] =>")
      return db.collection('productfenlei').add({
        // data 字段表示需新增的 JSON 数据
        data: {
          createTime: event.createTime,
          organizationid: event.organizationid,
          icon: event.icon,
          name: event.name,
          level: event.level,
          pid: event.pid,
          isUse: event.isUse,
          careateOpenid: event.careateOpenid,
        }
      })
    }
  } catch (e) {
    console.error(e)
  }
}