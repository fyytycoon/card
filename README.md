# tydmqb 企业名片在线聊天商城小程序（云开发） 

### 功能：

- 企业员工名片
- 在线商城
- 在线咨询(小程序即时聊天)
- 多企业注册
- 多员工绑定
- 产品、员工、企业后端管理(小程序端)
- 广告位

### 已上线

![](img/gh_f343d9c08e63_258.jpg)





### 更换环境ID:

![image-20220227220841755](img/1645970947.jpg)

app.js

```
wx.cloud.init({
    env: 'dongmingqibao-xxoo',
    traceUser: true,
})
```

### 云函数

部署`cloudfunctions`中的云函数

### 云数据库

数据库文件下`.json`文件，文件名为数据库名称，`.json`文件目的为提供字段信息，数据不完善，可能导致显示问题。

如需帮助，请添加wx:`wind-rain-sun`。

