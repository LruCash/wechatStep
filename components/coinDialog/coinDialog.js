Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: {

  },

  data: {
    flag:true
  },
  methods: {
    doubleCoin(){
      this.setData({
        flag: !this.data.flag
      })
      this.triggerEvent("doubleCoin");
    },
    
    //显示弹窗
    showDialog(){
      this.setData({
        flag:!this.data.flag
      })
    },

    //消失弹窗
    hideDialog(){
      this.setData({
        flag: !this.data.flag
      })
    },
  }

})