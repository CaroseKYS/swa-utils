const path   = require('path');
const mkdirp = require('mkdirp');
const fs     = require('fs');
const util   = require('util');
const url    = require('url');
const qs     = require('querystring');
const os     = require('os'); 

exports.getJsonProp      = _getJsonProp;
exports.createDir        = _createDir;
exports.resolveUrl       = _resolveUrl;
exports.getLocalIpV4     = _getLocalIpV4;
exports.getLocalIpV6     = _getLocalIpV6;
exports.getTheOtherEndIp = _getTheOtherEndIp;
exports.getClientIp      = _getClientIp;

/**
 * 从JSON文件中获取出行
 * @param  {[type]} file          JSON文件的路径，文件路径从根目录开始。
 * @param  {[type]} propertiesStr 以.分割的属性列表
 * @return {[type]}               返回获取的属性
 */
function _getJsonProp(file, propertiesStr){
  var jsonData = file;

  if (!file || !propertiesStr) {
    throw new 'swa-utils.getJsonProp 方法需要两个参数。' ;
  }

  if (util.isString(file)) {
    jsonData = require(file);
  }

  /*结果*/
  var result;

  if(util.isObject(jsonData)){
    result = _getPropertyTool(jsonData, propertiesStr);
  }else{
    result = undefined;
  }

  return result;
}

function _getPropertyTool(json, propertiesStr){
  propertiesStr = propertiesStr || '';
  propertiesStr = propertiesStr.trim();

  if(!propertiesStr || !json){
    return undefined;
  }

  var properties = propertiesStr.split('.');
  var length = properties.length;
  var result = undefined;
  var currentDomain = json;

  for (var i = 0; i < length; i++) {
    currentDomain = result = currentDomain[properties[i]];
    if(!result)break;
  }

  return result;
}

function _createDir(path){
  var result = true;

  /*如果创建不成功则将 result 置为 false*/
  if(!mkdirp.sync(path)){
    result = false;
  }

  /*如果 result 为 false, 则判断文件夹是否已经存在*/
  if (!result) {
    try{
      result = fs.existsSync(path);
    }catch(e){
      throw new Error('文件系统错误, fs.existsSync 调用失败:' + e);
    }
  }

  return result;
}

/**
 * 将url path query 解析为一个合法url
 * @author 康永胜
 * @date   2017-09-30 07:31:28
 * @param  {String}      sUrl     [url]
 * @param  {String}      sPath    [路径]
 * @param  {Object}      oQuery   [查询字符串对应的键值对]
 * @return {String}               [解析后的url]
 */
function _resolveUrl(sUrl, sPath, oQuery){
  sUrl = sUrl || '';
  sPath = sPath || '';

  var oUrl = url.parse(sUrl);
  var oPath = url.parse(sPath);

  var oQueryOfUrl = qs.parse(oUrl.query) || {};
  var oQueryOfPath = qs.parse(oPath.query) || {};

  oQueryOfUrl = _extend(oQueryOfUrl, oQueryOfPath, oQuery);

  oUrl.pathname = url.resolve(oUrl.pathname || '', oPath.pathname || '');

  oUrl.query = qs.stringify(oQueryOfUrl);
  oUrl.query && (oUrl.search = '?' + oUrl.query);

  return url.format(oUrl);
}

/**
 * 扩展对象的方法
 * @author 康永胜
 * @date   2017-09-30 07:33:46
 * @param  {Object}       oTarget  [待扩展对象]
 * @return {Object}                [扩展后的对象]
 */ 
function _extend(oTarget /*oSources*/){
  oTarget = oTarget || {};
  if (!util.isObject(oTarget)) {
    oTarget = {};
  }

  for (var i = 1; i < arguments.length; i++) {
    if (!arguments[i] || !util.isObject(arguments[i])) {
      continue;
    }

    for (var key in arguments[i]) {
      oTarget[key] = arguments[i][key];
    }
  }

  return oTarget;
}


function _getLocalIpV4(sName){
  var netCards = _getNetCards(sName);

  if (!netCards) {
    return '127.0.0.1';
  }

  return _getIp(netCards, 'IPv4');
}

function _getLocalIpV6(sName){
  var netCards = _getNetCards(sName);

  if (!netCards) {
    return '::1';
  }

  return _getIp(netCards, 'IPv6');
}

function _getNetCards(sName){
  var interfaces = os.networkInterfaces();
  var netCards = interfaces[sName] || 
                 interfaces['eth0'] || 
                 interfaces['无线网络连接'] ||
                 interfaces['本地连接'];

  return netCards;
}

function _getIp(aNetCards, sIpFamily){
  for(var i=0;i< aNetCards.length;i++){  
    if(aNetCards[i].family == sIpFamily){  
      return aNetCards[i].address;  
    }  
  } 
}

function _getClientIp(req){
  return req.headers['x-forwarded-for'] || _getTheOtherEndIp(req);
}

function _getTheOtherEndIp(req) {
  return req.ip || req._remoteAddress || (req.connection && req.connection.remoteAddress) || undefined;
}