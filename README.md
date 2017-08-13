# swa-utils
swa平台的工具包

## 功能描述
该工具模块主要提供比较通用的，包括获取json文件(对象)中的信息、创建本地目录，移除本地目录等功能。

## 使用方式

### 加载模块
    var utils = require('swa-utils');

### 获取JSON对象属性
    utils.getJsonProp('./config.json', 'user.name');
    utils.getJsonProp({}, 'user.name');
    

### 创建文件夹
    utils.createDir('D:\test');

### 解析 url
    utils.resolveUrl('http://www.intermen.cn/?a=aa', '/adp/?b=bb', {
      c: 'cc'
    }); //http://www.intermen.cn/adp/?a=aa&b=bb&c=cc

### 获取本地IP地址
    //utils.getLocalIpV4([NetCardName]);
    //utils.getLocalIpV6([NetCardName]);
    utils.getLocalIpV4();
    utils.getLocalIpV4('本地连接');

### 获取客户端IP地址
    //获取通信中另一端的地址，通常为代理服务器的地址
    utils.getTheOtherEndIp(req); 

    //获取客户端的真实地址
    utils.getClientIp(req); 