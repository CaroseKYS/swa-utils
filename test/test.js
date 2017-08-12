'use strict';
var assert = require('assert');
var should = require('should');
var rewire = require('rewire');
var fdpUtil = rewire('../index.js');
var fs = require('fs');
var path = require('path');
var muk = require('muk');

describe('fdp-utils 测试', function(){

  /*1.*/
  describe('typeof 方法测试', function(){
    it('null的类型为null', function(){
      assert.equal(fdpUtil.typeof(null), 'null');
    });

    it('undefined的类型为undefined', function(){
      assert.equal(fdpUtil.typeof(undefined), 'undefined');
      assert.equal(fdpUtil.typeof(), 'undefined');
    });

    it('数值类型为number', function(){
      assert.equal(fdpUtil.typeof(1.1), 'number');
    });

    it('字符串类型为string', function(){
      assert.equal(fdpUtil.typeof('1.1'), 'string');
    });

    it('布尔值类型为boolean', function(){
      assert.equal(fdpUtil.typeof(false), 'boolean');
    });

    it('对象类型为object', function(){
      assert.equal(fdpUtil.typeof({}), 'object');
    });

    it('数组类型为array', function(){
      assert.equal(fdpUtil.typeof([]), 'array');
    });

    it('函数类型为 function', function(){
      assert.equal(fdpUtil.typeof(function(){}), 'function');
    });
  });

  /*2.*/
  describe('getJsonProp 方法测试', function(){
    describe('有 NODE_FDP_ROOT 环境变量', function(){
      before(function(){
        process.env.NODE_FDP_ROOT = __dirname;
      });

      after(function(){
        delete process.env.NODE_FDP_ROOT;
      });

      it('不传递任何参数时返回undefined', function(){
        assert.equal(fdpUtil.getJsonProp(), undefined);
      });

      it('传递一个不存在的文件路径, 应当返回undefined.', function(){
        assert.equal(fdpUtil.getJsonProp('aa.js'), undefined);
      });

      it('传递一个不存在的文件路径和任意参数, 应当返回undefined.', function(){
        assert.equal(fdpUtil.getJsonProp('aa.js', 'user.name'), undefined);
      });

      it('传递一个不内容错误的文件正确参数, 应当返回undefined.', function(){
        assert.equal(fdpUtil.getJsonProp('fdp-config.txt', 'user.name'), undefined);
      });

      it('两个正确参数, 应当返回istanbul.', function(){
        assert.equal(fdpUtil.getJsonProp('fdp-config.js', 'user.name'), 'istanbul');
      });
    });

    describe('没有设置 NODE_FDP_ROOT 环境变量', function(){
      it('两个正确参数, 应当返回undefined.', function(){
        assert.equal(fdpUtil.getJsonProp('fdp-config.js', 'user.name'), undefined);
      });
    });
  });

  /*3.*/
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
      assert.equal(fdpUtil.createDir(sDitrPath), true);
    });

    it('如果文件夹存在, 返回true.', function(){
      if (!fs.existsSync(sDitrPath)) {
        fs.mkdirSync(sDitrPath);
      }
      assert.equal(fdpUtil.createDir(sDitrPath), true);
    });

    it('fs 模块的 existsSync 抛出异常, 则模块抛出异.', function(){
      muk(fs, 'existsSync', function(){
        throw '文件系统异常(模拟);';
      });

      assert.throws(function(){
        fdpUtil.createDir(sDitrPath);
      }, Error);

      muk.restore();
    });
  });

  /*4.*/
  describe('resolveUrl 方法测试', function(){
    it('无任何参数，返回空字符串', function(){
      fdpUtil.resolveUrl().should.equal('');
    });

    it('只有url参数，返回url本身', function(){
      fdpUtil.resolveUrl('http://127.0.0.1:8080/adp').should.equal('http://127.0.0.1:8080/adp');
    });

    it('url 和 path参数，url不带查询字符串', function(){
      fdpUtil.resolveUrl('http://www.leshui365.com', '/adp').should.equal('http://www.leshui365.com/adp');
    });

    it('url 和 path参数，url带查询字符串', function(){
      fdpUtil.resolveUrl('http://www.leshui365.com?a=aa', '/adp').should.equal('http://www.leshui365.com/adp?a=aa');
    });

    it('url 、 path、query参数，url不带查询字符串', function(){
      fdpUtil.resolveUrl('http://www.leshui365.com', '/adp', {
        a: 'aa',
        b: 'bb'
      }).should.equal('http://www.leshui365.com/adp?a=aa&b=bb');
    });

    it('url 、 path、query参数，url带查询字符串', function(){
      fdpUtil.resolveUrl('http://www.leshui365.com/?a=aa', '/adp', {
        b: 'bb'
      }).should.equal('http://www.leshui365.com/adp?a=aa&b=bb');
    });

    it('url 、 query参数，url不带查询字符串', function(){
      fdpUtil.resolveUrl('http://www.leshui365.com', '', {
        b: 'bb'
      }).should.equal('http://www.leshui365.com/?b=bb');
    });

    it('url 、 query参数，url带查询字符串', function(){
      fdpUtil.resolveUrl('http://www.leshui365.com/?a=aa', '', {
        b: 'bb'
      }).should.equal('http://www.leshui365.com/?a=aa&b=bb');
    });

    it('url 、 path、 query参数，path带查询字符串', function(){
      fdpUtil.resolveUrl('http://www.leshui365.com/?a=aa', '/adp/?b=bb', {
        c: 'cc'
      }).should.equal('http://www.leshui365.com/adp/?a=aa&b=bb&c=cc');
    });

    it('模拟 qs 返回空值', function(){
      muk(fdpUtil.__get__('qs'), 'parse', function(){
        return false;
      });
      fdpUtil.resolveUrl('http://www.leshui365.com/?a=aa', '/adp/?b=bb', {
        c: 'cc'
      }).should.equal('http://www.leshui365.com/adp/?c=cc');
      muk.restore();
    });

  });

  describe('extend 方法测试', function(){
    it('无参数', function(){
      fdpUtil.extend().should.deepEqual({});
    });

    it('第一个参数不为Object', function(){
      fdpUtil.extend('dddd', {a: 'aa'}).should.deepEqual({a: 'aa'});
    });
  });

  describe('getLocalIpV4 方法测试', function(){
    let localIp = '10.1.7.193';
    it('无参数', function(){
      fdpUtil.getLocalIpV4().should.equal(localIp);/*测试时配置*/
    });

    it('正确参数', function(){
      fdpUtil.getLocalIpV4('本地连接').should.equal(localIp);
    });

    it('未找到网卡', function(){
      var _getNetCards = fdpUtil.__get__('_getNetCards');
      fdpUtil.__set__('_getNetCards', function(){
        return undefined;
      });
      fdpUtil.getLocalIpV4('本地连接 test').should.equal('127.0.0.1');
      fdpUtil.__set__('_getNetCards', _getNetCards);
    });
  });

  describe('getLocalIpV6 方法测试', function(){
    let localIp = 'fe80::4013:e0a1:8621:f913';

    it('无参数', function(){
      fdpUtil.getLocalIpV6().should.equal(localIp);/*测试时配置*/
    });

    it('正确参数', function(){
      fdpUtil.getLocalIpV6('本地连接').should.deepEqual(localIp);
    });

    it('未找到网卡', function(){
      var _getNetCards = fdpUtil.__get__('_getNetCards');
      fdpUtil.__set__('_getNetCards', function(){
        return undefined;
      });
      fdpUtil.getLocalIpV6('本地连接 test').should.equal('::1');
      fdpUtil.__set__('_getNetCards', _getNetCards);
    });
  });

  describe('getTheOtherEndIp 方法测试', function(){
    var req, res;

    beforeEach(() => {
      req = {};
    });

    it('请求对象没有 ip 及 connection 属性', function(){
      should.equal(fdpUtil.getTheOtherEndIp(req), undefined);
    });

    it('请求对象没有 ip 属性，但是有 connection 属性', function(){
      req.connection = {};
      should.equal(fdpUtil.getTheOtherEndIp(req), undefined);
    });

    it('请求对象有 ip 属性', function(){
      req.ip = '10.1.1.1';
      fdpUtil.getTheOtherEndIp(req).should.equal(req.ip);
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
      fdpUtil.getClientIp(req).should.equal(remoteAddress);
    });

    it('求对象有 x-forwarded-for 头部，有 ip 属性', function(){
      var ip = '127.0.0.1';
      var realIp = '127.0.0.2';

      req.headers['x-forwarded-for'] = realIp;
      req.ip = ip;

      fdpUtil.getClientIp(req).should.equal(realIp);
    });
  });

});