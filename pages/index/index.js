//获取应用实例
const app = getApp()

Page({
  data: {
    motto: '同步步数',
    step: 0,
    monthStep:'',
    hidden: false,
    toastText: '',
  },

  onLoad: function() {},

  onReady: function() {
    //获得popup组件
    this.popup = this.selectComponent("#popup");
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
        this.hiddenLoading();
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
      },
      fail: function(res) {
        that.hiddenLoading();
        that.getStepError();
      }
    })

  },

  launchAppError(e) {
    console.log(e.detail.errMsg);
    wx.showToast({
      title: '同步失败',
      icon: 'fail',
      duration: 1000
    })
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
  method_click() {
    this.popup.showPopup();
  },

  setResult() {

  },

  //关闭对话框
  _close() {
    this.popup.hidePopup();
  }

})