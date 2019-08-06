//获取应用实例
const app = getApp()

Page({
  data: {
    motto: '同步步数',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  onLoad: function() {

  },

  onReady: function() {
    //获得popup组件
    this.popup = this.selectComponent("#popup");
  },

  login: function(event) {
    var that = this;
    wx.login({
      success: function(res) {
        var appid = "wx69f02e4976e47287";
        var secret = "aad583e095dec4eee781426dc7a2a0e2";
        if (res.code) {
          wx.request({
            url: 'https://api.weixin.qq.com/sns/jscode2session',
            header: {
              'content-type': 'json'
            },
            data: {
              appid: appid,
              secret: secret,
              js_code: res.code,
              grant_type: 'authorization_code'
            },
            success: function(res) {
              console.log(res);
              var session_key = res.data.session_key;
              that.getData(appid, session_key);
            }
          })
        }
      }
    })
  },

  getData: function(appid, session_key) {
    var that = this;
    wx.getSetting({
      success: function(res) {
        console.log(res);
        if (!res.authSetting['scope.werun']) {
          wx.authorize({
            scope: 'scope.werun',
            success() {
              that.getRunData(appid, session_key)
            }
          })
          // wx.showModal({
          //   title: '提示',
          //   content: '获取微信运动步数，需要开启计步权限',
          //   success: function (res) {
          //     if (res.confirm) {
          //       //跳转去设置
          //       wx.openSetting({
          //         success: function (res) {

          //         }
          //       })
          //     } else {
          //       //不设置
          //     }
          //   }
          // })
        } else {
          that.getRunData(appid, session_key)
        }
      }
    })
  },

  getRunData: function(appid, session_key) {
    var that = this;
    wx.getWeRunData({
      success: function(res) {
        console.log(res);
        var encryptedData = res.encryptedData;
        var iv = res.iv;
        that.decodeRunData(res.encryptedData, session_key, res.iv)
      },
      fail: function(res) {
        wx.showModal({
          title: '提示',
          content: '开发者未开通微信运动，请关注“微信运动”公众号后重试',
          showCancel: false,
          confirmText: '知道了'
        })
      }
    })
  },

  //后端解密runData
  decodeRunData: function(encryptData, session, iv) {
    wx.request({
      url: 'http://localhost:8080/decode',
      header: {
        'content-type': 'json'
      },
      data: {
        encryptData: encryptData,
        session: session,
        iv: iv,
      },
      success: function(res) {
        console.log(res)
      }
    })

  },


  //点击出现同步方法dialog
  method_click() {
    this.popup.showPopup();
  },


  //关闭对话框
  _close() {
    console.log("点击关闭");
    this.popup.hidePopup();
  }

})