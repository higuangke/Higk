//tsg.js
//获取应用实例
var app = getApp();
Page({
  data: {
    remind: '加载中',
    tsgData: {
      book_list: [],  //当前借阅列表
      books_num: 0,   //当前借阅量
      books_sum: 0,     //历史借阅量
      dbet: 0,        //欠费
      nothing: true   //当前是否有借阅
    },
    tsgHistoryTap: false //点击历史借阅
  },
  onLoad: function() {
    this.getData();
  },
  onPullDownRefresh: function(){
    this.getData();
  },
  getData: function() {
    var _this = this;
    if(!app._user.we.ykth){
      _this.setData({
        remind: '未绑定'
      });
      return false;
    }
    //判断并读取缓存
    if(app.cache.tsg){ tsgRender(app.cache.tsg); }
    function tsgRender(info){
      info.nothing = !parseInt(info.books_num) || !info.book_list || !info.book_list.length;
      var colors = ['green','yellow','red','purple'],
          nowTime = new Date().getTime();
      if(!info.nothing){
        info.book_list.map(function(e){
          var jDate = e.jsrq.split('-'), hDate = e.yhrq.split('-'),
              jTime = new Date(jDate[0], jDate[1]-1, jDate[2]).getTime(),
              hTime = new Date(hDate[0], hDate[1]-1, hDate[2]).getTime();
          var sum = parseInt((hTime - jTime) / 1000 / 60 / 60 / 24),
              timing = parseInt((hTime - nowTime) / 1000 / 60 / 60 / 24),
              k = 1 - timing/sum, n = 0;
          if(k < 0.3) { n = 0; }
          else if(k < 0.7) { n = 1; }
          else if(k <= 1) { n = 2; }
          else if(k > 1) { n = 3; }
          e.color = colors[n];
          return e;
        });
      }
      _this.setData({
        tsgData: info,
        remind: ''
      });
    }
    wx.showNavigationBarLoading();
    wx.request({
      url: app._server + "/QueryBookServlet",
      method: 'POST',
      data:{
        openid: app._user.openid
      },header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        if(res.data && res.data.status >= 200 && res.data.status < 400) {
          var info = res.data.data;
          if(info) {
            //保存借阅缓存
            app.saveCache('tsg', info);
            tsgRender(info);
          }else{ _this.setData({ remind: '暂无数据' }); }

        }else{
          app.removeCache('tsg');
          _this.setData({
            remind: res.data.message || '未知错误'
          });
        }
      },
      fail: function(res) {
        if(_this.data.remind == '加载中'){
          _this.setData({
            remind: '网络错误'
          });
        }
        console.warn('网络错误');
      },
      complete: function() {
        wx.hideNavigationBarLoading();
      }
    });
  },
  tsgHistory: function(){
    var _this = this;
    if(!_this.data.tsgHistoryTap){
      _this.setData({
        tsgHistoryTap: true
      });
      setTimeout(function(){
        _this.setData({
          tsgHistoryTap: false
        });
      }, 2000);
    }
  }
 
});