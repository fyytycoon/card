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
    await db.collection('organizationstaff').where({ _openid: event.openid }).get().then(res =>{
      if(!res.data.length == 0 ){
        db.collection('organizationstaff').where({ _openid: event.openid }).update({
          data:{img:event,title:event.title,cardname:event.name}
        })
      }
    })
    await db.collection('carduser_list').where({ _openid: event.openid }).get().then(res =>{
      if(res.data.length == 0){
        console.log('[carduser_list] [add] =>')
        db.collection('carduser_list').where({ _openid: event.openid }).update({
          data:{iscarduser:true}
        })
        return db.collection('carduser_list').add({
          data:{
            _openid:event.openid,
            name:event.name,
            mobile:event.mobile,
            weChat:event.weChat,
            email:event.email,
            img:event.img,
            textarea:event.textarea,
            organization:event.organization,
            organizationid:event.organizationid,
            title:event.title,
            logoimg:event.logoimg,
            address:event.address,
            zuoji:event.zuoji,
            imgsList:event.imgsList,
            videourl:event.videourl,
            tongshilist:event.tongshilist,
            tongshivalue:event.tongshivalue,
            tongshititle:event.tongshititle,
            productvalue:event.productvalue,
            producttitle:event.producttitle,
            productlist:event.productlist,
            qiye:event.qiye,
            fenxiaoshang:event.fenxiaoshang,//分销商标志
            about:event.about,
            video:event.video,
            photo:event.photo,
            tongshi:event.tongshi,
            product:event.product,
            likeAvatarUrl:[],//浏览记录
            lookcount:0,//浏览次数
            dianzancount:0,//点赞次数
            dianzanUrl:[],
            cardfenxiangcount:'',
            latitude:event.latitude,
            longitude:event.longitude,
          }
        })
      }else{
        console.log('[carduser_list] [update] =>')
        return db.collection('carduser_list').where({ _openid: event.openid }).update({
          data:{
            name:event.name,
            mobile:event.mobile,
            weChat:event.weChat,
            email:event.email,
            img:event.img,
            textarea:event.textarea,
            organization:event.organization,
            organizationid:event.organizationid,
            title:event.title,
            logoimg:event.logoimg,
            address:event.address,
            zuoji:event.zuoji,
            imgsList:event.imgsList,
            videourl:event.videourl,
            tongshilist:event.tongshilist,
            tongshivalue:event.tongshivalue,
            tongshititle:event.tongshititle,
            productvalue:event.productvalue,
            producttitle:event.producttitle,
            productlist:event.productlist,
            qiye:event.qiye,
            fenxiaoshang:event.fenxiaoshang,//分销商标志
            about:event.about,
            video:event.video,
            photo:event.photo,
            tongshi:event.tongshi,
            product:event.product,
            latitude:event.latitude,
            longitude:event.longitude,
          }
        })
      }
    })
    await db.collection('dongming_user').where({ _openid: event.openid }).update({
      data:{
        iscarduser: true
      }
    })
  }catch(e){
    console.error(e)
  }
}