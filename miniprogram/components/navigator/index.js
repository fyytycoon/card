const app = getApp();
Component({
  properties:{
    tList:{
      type: Array,
      value:[]
    }, //标题列表
    currentTab:{
      type:Number,
      value:0,
      observer: function (newVal, oldVal) { 
        this.setData({
          currentTab : newVal
        })
      } 
    },
    tname:{
      type:String, 
      value:''
    },
    ttype:{
      type:Number,
      value:''
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom
  },
  ready(){
    console.log(this.data.ttype);
  },
  methods:{
    _swichNav:function(e){
      this.triggerEvent('changeCurrent', {
        currentNum: e.currentTarget.dataset.current
      })
    },
    //search
    goSearch(e){
      wx.navigateTo({
        url: "/pages/search/search"
      })
  }
  }
})