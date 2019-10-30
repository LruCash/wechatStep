import WxCountUp from '../../plugins/wx-countup/WxCountUp.js'
var util = require('../../utils/util.js');
const app = getApp()
//爱计步插屏广告
let interstitialAd = null
//步步有宝插屏广告
let stepGoldInterstitialAd = null
let clickCoinIndex = -1
let totalGetCoin = 0
let version = 0
let hasClickSync = false

Page({

  data: {
    motto: '同步步数',
    step: 0,
    monthStep: '',
    hidden: true,
    toastText: '',
    firstCoin:10,
    secondCoin:20,
    animation:'',
    animationMiddleHeaderItem:'',
    firstCoinHide:true,
    secondCoinHide:true,
    bannerAdUnit:'adunit-4d1449f4192e7874',
  },

  onLoad: function (options) {
    //app版本号参数
    if (options.version){
      version = options.version;
    }
    this.classifyAdUnit();
  },

  //页面出现在前台时执行
  onShow:function(){
    totalGetCoin = 0;
  },

  onReady: function () {
    //获得popup组件
    this.popup = this.selectComponent("#popup");
    this.coinDialog = this.selectComponent("#coinDialog");
    this.dialog = this.selectComponent("#dialog");

    //this.createScaleAnim();
    if (version < 31500 && this.canAwardCoin()){
        this.showVersionDialog();
    }

    this.read_step();
  },

  classifyAdUnit(version){
    //version==31500创建步步有宝广告位，否则创建爱计步广告位
    if (version == 31500) {
      if (wx.createInterstitialAd) {
        stepGoldInterstitialAd = wx.createInterstitialAd({
          adUnitId: 'adunit-3b3709cfc8330e4e'
        })
      }
      //banner广告位
      this.setData({
        bannerAdUnit:'adunit-4d1449f4192e7874'
      })
    } else {
      if (wx.createInterstitialAd) {
        interstitialAd = wx.createInterstitialAd({
          adUnitId: 'adunit-d889b09e5355220d'
        })
      }
      //banner广告位
      this.setData({
        bannerAdUnit: 'adunit-c9c625105e59c370'
      })
    }
  },

  /**
   * 金币跳动动画
   */
  createAnim() {
    var animation = wx.createAnimation({
      duration: 2000,
      delay: 0,
      timingFunction: 'ease',
    })

    this.animation = animation;
    var next = true;
    setInterval(function () {
      if (next) {
        this.animation.translateY(15).step()
        next = !next;
      } else {
        this.animation.translateY(-15).step()
        next = !next;
      }

      this.setData({
        animation: animation.export()
      })
    }.bind(this), 2000)
  },

  /**
   * 读取微信步数呼吸动画
   */
  createScaleAnim(){

    var circleCount = 0;
    // 心跳的外框动画  
    this.animationMiddleHeaderItem = wx.createAnimation({
      duration: 1000,    // 以毫秒为单位  
      timingFunction: 'linear',
      delay: 100,
      transformOrigin: '50% 50%',
      success: function (res) {
      }
    });
    setInterval(function () {
      if(hasClickSync){
        return;
      }
      if (circleCount % 2 == 0) {
        this.animationMiddleHeaderItem.scale(1.15).step();
      } else {
        this.animationMiddleHeaderItem.scale(1.0).step();
      }

      this.setData({
        animationMiddleHeaderItem: this.animationMiddleHeaderItem.export()  //输出动画
      });

      circleCount++;
      if (circleCount == 1000) {
        circleCount = 0;
      }
    }.bind(this), 1000);
  },

  //版本号过低时提示升级
  showVersionDialog(){
    this.dialog.showDialog('爱计步app升级到最新版本可领取额外微信步数金币奖励');
  },

  read_step() {
    hasClickSync = true;
    this.setData({
      hidden: false,
    })
    this.login();
  },

  login: function(event) {
    var that = this;
    wx.login({
      success: function(res) {
        var appid = "wx69f02e4976e47287";
        var timestamp = Date.parse(new Date());
        if (res.code) {
          wx.request({
            url: 'https://api.earn.freeqingnovel.com/mini_program/api/v1/login?package_name=com.profit.walkfun.app',
            header: {
              'content-type': 'json'
            },
            data: {
              app_id: appid,
              code: res.code,
              timestamp: timestamp,
            },
            success: function(res) {
              let keyId = res.data.data.keyid;
              if (keyId) {
                that.getData(keyId);
              } else {
                that.hiddenLoading();
                wx.showToast({
                  title: '登陆失败',
                  icon: 'fail',
                  duration: 1000
                })
              }
            },
            fail: function(res) {
              that.hiddenLoading();
              wx.showToast({
                title: '登陆失败',
                icon: 'fail',
                duration: 1000
              })
            }
          })
        }
      }
    })
  },

  getData: function(keyId) {
    var that = this;
    wx.getSetting({
      success: function(res) {
        if (!res.authSetting['scope.werun']) {
          that.hiddenLoading();
          wx.authorize({
            scope: 'scope.werun',
            success() {
              that.getRunData(keyId)
            },
            fail() {
              that.getStepError();
            }
          })
        } else {
          that.getRunData(keyId)
        }
      }
    })
  },

  getRunData: function(keyId) {
    var that = this;
    wx.getWeRunData({
      success: function(res) {
        var encryptedData = res.encryptedData;
        var iv = res.iv;
        that.decodeRunData(res.encryptedData, res.iv, keyId);
      },
      fail: function(res) {
        that.hiddenLoading();
        wx.showModal({
          title: '提示',
          content: '开发者未开通微信运动，请关注“微信运动”公众号后重试',
          showCancel: false,
          confirmText: '知道了'
        });
      }
    })
  },

  //后端解密runData
  decodeRunData: function(encryptData, iv, keyId) {
    var timestamp = Date.parse(new Date());
    var that = this;
    wx.request({
      url: 'https://api.earn.freeqingnovel.com/mini_program/api/v1/decrypt?package_name=com.profit.walkfun.app',
      header: {
        'content-type': 'json'
      },
      data: {
        timestamp: timestamp,
        encrypted_data: encryptData,
        keyid: keyId,
        iv: iv,
      },
      success: function(res) {
        var stepArray = res.data.data.stepInfoList;
        var todayStep = stepArray[stepArray.length - 1].step;
        that.setData({
          step: todayStep,
          monthStep: JSON.stringify(res.data.data),
          hidden: true
        });
        that.start(todayStep);
      },
      fail: function(res) {
        that.hiddenLoading();
        that.getStepError();
      }
    })

  },

  launchAppError(e) {
    console.log(e.detail.errMsg);
    if(!hasClickSync){
      wx.showToast({
        title: '同步失败，请先读取微信步数',
        icon: 'none',
        duration: 1000
      })
    }else{
      wx.showToast({
        title: '同步失败，需要从爱计步打开小程序同步',
        icon: 'none',
        duration: 1000
      })
    }
    
  },

  //同步步数数字动画
  start(stepNum) {
    var options = {
      duration: 3
    };
    this.countUp = new WxCountUp('step', stepNum, options, this);
    this.createAnim();
    var that = this;
    this.countUp.start(function() {
      if (interstitialAd) {
        interstitialAd.show().catch((err) => {
          console.error(err)
        })
      }
      that.setRandomCoin();
    });
  },

  /**
   * 金币点击事件
   */
  firstCoin(){
    this.clickCoinIndex = 1;
    this.coinDialog.showDialog(this.data.firstCoin);
  },

  secondCoin(){
    this.clickCoinIndex = 2;
    this.coinDialog.showDialog(this.data.secondCoin);
  },


  //隐藏progress进度条
  hiddenLoading() {
    this.setData({
      hidden: true
    })
  },

  //失败toast
  getStepError() {
    wx.showToast({
      title: '获取微信步数失败',
      icon: 'fail',
      duration: 1000
    })
  },

  //点击出现同步方法dialog
  methodClick() {
    this.popup.showPopup();
  },

  _close() {
    this.popup.hidePopup();
  },

  /**
   * dialog点击翻倍
   */
  doubleCoin(){
    
  },

  /**
   * 金币dialog点击好的
   */
  clickOk(){
    if (this.clickCoinIndex == 1) {
      this.setData({
        firstCoinHide: true,
      })
      totalGetCoin += this.data.firstCoin;
    } else if (this.clickCoinIndex == 2) {
      this.setData({
        secondCoinHide: true,
      })
      totalGetCoin += this.data.secondCoin;
    }
    console.log("coinOk_", totalGetCoin);
    this.coinDoubleSucc('金币领取成功');
    //返回json更新
    var obj = JSON.parse(this.data.monthStep)
    if (totalGetCoin > 200) {
      totalGetCoin = 200;
    }
    obj['stepCoin'] = totalGetCoin;
    this.setData({
      monthStep : JSON.stringify(obj)
    });
    //点击好的弹插屏广告
    this.showInterstitialAd();
  },

  showInterstitialAd(){
    if(version == 31500){
      if (stepGoldInterstitialAd) {
        stepGoldInterstitialAd.show().catch((err) => {
          console.error(err)
        })
      }
    }else{
      if (interstitialAd) {
        interstitialAd.show().catch((err) => {
          console.error(err)
        })
      }
    }
    
  },

  /**
   * 同步成功后随机金币数
   */
  setRandomCoin(){
    if(this.canAwardCoin()){
      let coinFirst = Math.floor(Math.random() * 10 + 30);
      let coinSecond = Math.floor(Math.random() * 10 + 30)
      this.setData({
        firstCoinHide: false,
        secondCoinHide: false,
        firstCoin: coinFirst,
        secondCoin: coinSecond,
      })
    }
  },

  /**
   * 每天只有一次金币奖励
   */
  canAwardCoin(){
    var todayDate = util.formatTimeYMD(new Date());
    console.log(wx.getStorageSync('todayDate'));
    if (wx.getStorageSync('todayDate') != todayDate){
      wx.setStorageSync('todayDate', todayDate);
      return true;
    }else{
      return false;
    }
  },

  /**
   * 金币翻倍成功toast
   */
  coinDoubleSucc(msg){
    wx.showToast({
      title: msg,
      icon: 'succ',
      duration: 1000
    })
  },

  //底部广告位
  adLoad() {
  },
  adError(err) {
  },
  adClose() {
  }

})