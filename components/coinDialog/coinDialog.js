Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: {

  },

  data: {
    flag:true,
    coinNum:0
  },
  methods: {
    doubleCoin(){
      this.setData({
        flag: !this.data.flag
      })
      this.triggerEvent("doubleCoin");
    },

    clickOk(){
      this.setData({
        flag: !this.data.flag
      })
      this.triggerEvent("clickOk");
    },
    
    //显示弹窗
    showDialog(coin){
      this.setData({
        flag:!this.data.flag,
        coinNum:coin
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