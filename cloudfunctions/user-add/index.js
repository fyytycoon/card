// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const pro = await db.collection('dongming_user').where({_openid: event.openid}).get();
    if(pro.data.length>0){ //说明数据已存在
      console.log("user [update]")
      return db.collection('dongming_user').where({ _openid: event.openid }).update({
        data: {
          nick_name: event.nick_name,
          gender: event.gender,
          language: event.language,
          city: event.city,
          province: event.province,
          avatar_url: event.avatar_url,
          country: event.country,
          createTime: event.createTime,
          lookcardlist: event.lookcardlist,//名片夹
          lookcardlast: event.lookcardlast,
          localStorageTime:event.localStorageTime,
          phone:event.phone
        }
      })
    }else{
      console.log("user [add] =>")
      return db.collection('dongming_user').add({
        // data 字段表示需新增的 JSON 数据
        data: {
          _openid: event.openid,
          nick_name: event.nick_name,
          gender: event.gender,
          language: event.language,
          city: event.city,
          province: event.province,
          avatar_url: event.avatar_url,
          country: event.country,
          dz: event.dz,
          createTime: event.createTime,
          brand: event.brand,//设备品牌
          model: event.model,//设备型号
          version: event.version,//微信版本号
          system: event.system,//操作系统及版本
          relationId: event.relationId,//关联文件id
          sessionkey: event.sessionkey,
          lookcardlist: event.lookcardlist,//名片夹
          lookcardlast: event.lookcardlast,
          organization:event.organization,
          organizationid:event.organizationid,
          iscarduser:event.iscarduser,
          mobile:'',
          weChat:'',
          phone:event.phone
        }
      })
    }
  } catch (e) {
    console.error(e)
  }
}