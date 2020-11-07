// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    if(!event.flag){
      return db.collection('productdata').where({_id:event._id}).remove().then(res=>{
        console.log(res)
      })
    }
    const pro = await db.collection('productdata').where({ _id: event._id }).get();
    if(pro.data.length>0){ //说明数据已存在
      console.log("productdata [update]")
      return db.collection('productdata').where({ _id: event._id }).update({
        data: {
          dateUpdate:event.createTime,
          name:event.name,
          oneindex:event.oneindex,
          erjiindex:event.seterjiindex,
          categoryId:event.categoryId,
          categoryoneId:event.categoryoneId,
          pic:event.pic,
          pics:event.pics,
          numberlook:event.numberlook,
          xijieimgList:event.xijieimgList,
          organizationid:event.organizationid,
          flag: event.flag
        }
      })
    }else{
      console.log("productdata [add] =>")
      return db.collection('productdata').add({
        // data 字段表示需新增的 JSON 数据
        data: {
          dateUpdate:'',
          dateAdd:event.createTime,
          name:event.name,
          oneindex:event.oneindex,
          erjiindex:event.seterjiindex,
          categoryId:event.categoryId,
          categoryoneId:event.categoryoneId,
          pic:event.pic,
          pics:event.pics,
          numberlook:event.numberlook,
          xijieimgList:event.xijieimgList,
          minPrice:'价格面议',
          organizationid:event.organizationid,
          flag: event.flag
        }
      })
    }
  } catch (e) {
    console.error(e)
  }
}