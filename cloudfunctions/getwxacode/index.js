// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.wxacode.get({
      path: event.path,
      width: 430
    })
    console.log("result",result)
    const upload = await cloud.uploadFile({
      cloudPath: 'share/' + event.flag + '.jpeg',
      fileContent: result.buffer,
    })
    console.log("upload",upload)
    const zhengshiurl = await cloud.getTempFileURL({
      fileList: [upload.fileID ,event.imgid],
    })
    console.log('zhengshiurl',zhengshiurl)
    return zhengshiurl
  } catch (err) {
    console.log("err",err)
  }
}