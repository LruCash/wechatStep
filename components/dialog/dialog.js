Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: {

  },

  data: {
    flag: true,
    msg:"消息提醒"
  },

  methods: {
    clickSure() {
      this.setData({
        flag: !this.data.flag
      })
      this.triggerEvent("clickSure");
    },

    //显示弹窗
    showDialog(showMsg) {
      this.setData({
        flag: !this.data.flag,
        msg: showMsg
      })
    },

    //消失弹窗
    hideDialog() {
      this.setData({
        flag: !this.data.flag
      })
    },
  }

})