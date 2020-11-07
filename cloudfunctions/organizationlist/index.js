// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const pro = await db.collection('organizationlist').where({_id: event._id}).get();
    if(pro.data.length>0){ //说明数据已存在
      console.log("organizationlist [update]")
      return db.collection('organizationlist').where({ _id: event._id }).update({
        data: {
          _openid: event._openid,
          name: event.name,
          zuoji: event.zuoji,
          address: event.address,
          linkmanphone: event.linkmanphone,
          latitude : event.latitude,
          longitude : event.longitude,
          setimgList: event.setimgList,
          setlogoimgList: event.setlogoimgList,
          dz: event.dz
        }
      })
    }else{
      console.log("organizationlist [add] =>")
      return db.collection('organizationlist').add({
        // data 字段表示需新增的 JSON 数据
        data: {
          _openid: event._openid,
          name: event.name,
          zuoji: event.zuoji,
          address: event.address,
          linkmanphone: event.linkmanphone,
          latitude : event.latitude,
          longitude : event.longitude,
          setimgList: event.setimgList,
          setlogoimgList: event.setlogoimgList,
          dz: event.dz
        }
      })
    }
  } catch (e) {
    console.error(e)
  }
}