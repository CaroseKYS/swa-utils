'use strict';
var assert = require('assert');
var should = require('should');
var rewire = require('rewire');
var swaUtil = rewire('../index.js');
var fs = require('fs');
var path = require('path');
var muk = require('muk');

describe('swa-utils 测试', function(){

  describe('getJsonProp 方法测试', function(){
    it('参数不全，抛出异常', function(){
      assert.throws(function(){
        swaUtil.getJsonProp();
      }, 'swa-utils.getJsonProp 方法需要两个参数。');
    });

    it('文件不存在, 返回 undefined', () => {
      should.equal(swaUtil.getJsonProp('test-1.json', '000'), undefined);
    });

    it('两个正确参数，但是不存在相应属性, 应当返回 undefined.', function(){
      should.equal(swaUtil.getJsonProp({}, 'user.name'), undefined);
    });

    it('两个正确参数, 应当返回 istanbul.', function(){
      assert.equal(swaUtil.getJsonProp(path.join(__dirname, 'config.js'), 'user.name'), 'istanbul');
    });

    it('两个正确参数, 应当返回 istanbul2.', function(){
      assert.equal(swaUtil.getJsonProp({name: 'istanbul2'}, 'name'), 'istanbul2');
    });

    it('第一个参数格式错误, 应当返回 undefined.', function(){
      assert.equal(swaUtil.getJsonProp(function(){}, 'name'), undefined);
    });
  });

  describe('createDir 方法测试', function(){
    var sDitrPath;
    before(function(){
      sDitrPath = path.join(__dirname, 'create-dir-test-' + Date.now());
    });

    after(function(){
      if (fs.existsSync(sDitrPath)) {
        fs.rmdirSync(sDitrPath);
      }
    });

    it('如果文件夹不存在, 返回true.', function(){
      if (fs.existsSync(sDitrPath)) {
        fs.rmdirSync(sDitrPath);
      }
      assert.equal(swaUtil.createDir(sDitrPath), true);
    });

    it('如果文件夹存在, 返回true.', function(){
      if (!fs.existsSync(sDitrPath)) {
        fs.mkdirSync(sDitrPath);
      }
      assert.equal(swaUtil.createDir(sDitrPath), true);
    });

    it('fs 模块的 existsSync 抛出异常, 则模块抛出异.', function(){
      muk(fs, 'existsSync', function(){
        throw '文件系统异常(模拟);';
      });

      assert.throws(function(){
        swaUtil.createDir(sDitrPath);
      }, Error);

      muk.restore();
    });
  });

  describe('resolveUrl 方法测试', function(){
    it('无任何参数，返回空字符串', function(){
      swaUtil.resolveUrl().should.equal('');
    });

    it('只有url参数，返回url本身', function(){
      swaUtil.resolveUrl('http://127.0.0.1:8080/test').should.equal('http://127.0.0.1:8080/test');
    });

    it('url 和 path参数，url不带查询字符串', function(){
      swaUtil.resolveUrl('http://www.intermen.cn', '/test').should.equal('http://www.intermen.cn/test');
    });

    it('url 和 path参数，url带查询字符串', function(){
      swaUtil.resolveUrl('http://www.intermen.cn?a=aa', '/test').should.equal('http://www.intermen.cn/test?a=aa');
    });

    it('url 、 path、query参数，url不带查询字符串', function(){
      swaUtil.resolveUrl('http://www.intermen.cn', '/test', {
        a: 'aa',
        b: 'bb'
      }).should.equal('http://www.intermen.cn/test?a=aa&b=bb');
    });

    it('url 、 path、query参数，url带查询字符串', function(){
      swaUtil.resolveUrl('http://www.intermen.cn/?a=aa', '/test', {
        b: 'bb'
      }).should.equal('http://www.intermen.cn/test?a=aa&b=bb');
    });

    it('url 、 query参数，url不带查询字符串', function(){
      swaUtil.resolveUrl('http://www.intermen.cn', '', {
        b: 'bb'
      }).should.equal('http://www.intermen.cn/?b=bb');
    });

    it('url 、 query参数，url带查询字符串', function(){
      swaUtil.resolveUrl('http://www.intermen.cn/?a=aa', '', {
        b: 'bb'
      }).should.equal('http://www.intermen.cn/?a=aa&b=bb');
    });

    it('url 、 path、 query参数，path带查询字符串', function(){
      swaUtil.resolveUrl('http://www.intermen.cn/?a=aa', '/test/?b=bb', {
        c: 'cc'
      }).should.equal('http://www.intermen.cn/test/?a=aa&b=bb&c=cc');
    });

    it('模拟 qs 返回空值', function(){
      muk(swaUtil.__get__('qs'), 'parse', function(){
        return false;
      });
      swaUtil.resolveUrl('http://www.intermen.cn/?a=aa', '/test/?b=bb', {
        c: 'cc'
      }).should.equal('http://www.intermen.cn/test/?c=cc');
      muk.restore();
    });

  });

  describe('getLocalIpV4 方法测试', function(){
    // let localIp = '192.168.1.3';
    // let localIp = '10.1.7.193';
    let localIp = '192.168.100.107';
    it('无参数', function(){
      swaUtil.getLocalIpV4().should.equal(localIp);/*测试时配置*/
    });

    it('正确参数', function(){
      swaUtil.getLocalIpV4('本地连接').should.equal(localIp);
    });

    it('未找到网卡', function(){
      var _getNetCards = swaUtil.__get__('_getNetCards');
      swaUtil.__set__('_getNetCards', function(){
        return undefined;
      });
      swaUtil.getLocalIpV4('本地连接 test').should.equal('127.0.0.1');
      swaUtil.__set__('_getNetCards', _getNetCards);
    });
  });

  describe('getLocalIpV6 方法测试', function(){
    // let localIp = 'fe80::884b:163c:faa4:f4f3';
    // let localIp = 'fe80::4013:e0a1:8621:f913';
    let localIp = 'fe80::f089:f90c:966b:a54f';

    it('无参数', function(){
      swaUtil.getLocalIpV6().should.equal(localIp);/*测试时配置*/
    });

    it('正确参数', function(){
      swaUtil.getLocalIpV6('本地连接').should.deepEqual(localIp);
    });

    it('未找到网卡', function(){
      var _getNetCards = swaUtil.__get__('_getNetCards');
      swaUtil.__set__('_getNetCards', function(){
        return undefined;
      });
      swaUtil.getLocalIpV6('本地连接 test').should.equal('::1');
      swaUtil.__set__('_getNetCards', _getNetCards);
    });
  });

  describe('getTheOtherEndIp 方法测试', function(){
    var req, res;

    beforeEach(() => {
      req = {};
    });

    it('请求对象没有 ip 及 connection 属性', function(){
      should.equal(swaUtil.getTheOtherEndIp(req), undefined);
    });

    it('请求对象没有 ip 属性，但是有 connection 属性', function(){
      req.connection = {};
      should.equal(swaUtil.getTheOtherEndIp(req), undefined);
    });

    it('请求对象有 ip 属性', function(){
      req.ip = '10.1.1.1';
      swaUtil.getTheOtherEndIp(req).should.equal(req.ip);
    });
  });

  describe('getClientIp 方法测试', function(){
    var req, res;

    beforeEach(() => {
      req = {};
      req.headers = {};
    });

    it('请求对象没有 x-forwarded-for 头部，有_remoteAddress属性', function(){
      var remoteAddress = '127.0.0.1';
      req._remoteAddress = remoteAddress;
      swaUtil.getClientIp(req).should.equal(remoteAddress);
    });

    it('求对象有 x-forwarded-for 头部，有 ip 属性', function(){
      var ip = '127.0.0.1';
      var realIp = '127.0.0.2';

      req.headers['x-forwarded-for'] = realIp;
      req.ip = ip;

      swaUtil.getClientIp(req).should.equal(realIp);
    });
  });

  describe('_getPropertyTool 方法测试', function () {
    var _getPropertyTool = swaUtil.__get__('_getPropertyTool');
    it('json对象和属性字符串为空', function () {
      should.equal(_getPropertyTool(), undefined);
    });
  });

  describe('_extend 方法测试', function () {
    var _extend = swaUtil.__get__('_extend');
    it('无参数', function () {
      should.deepEqual(_extend(), {});
    });

    it('第一个参数不是Object', function () {
      should.deepEqual(_extend(1), {});
      should.deepEqual(_extend(''), {});
      should.deepEqual(_extend(function () {}), {});
    });
  });

});