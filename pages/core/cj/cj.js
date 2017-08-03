//cj.js
//获取应用实例
var app = getApp();
Page({
  data: {
    remind: '加载中',
    cjInfo : [
    ],
    year:'',
    term:'',
    currentDate:''
  },
  getcj:function(){
    var _this = this;
    if(!app._user.we.ykth){
      _this.setData({
        remind: '未绑定'
      });
      return false;
    }
    _this.setData({
      id: app._user.we.ykth,
      name: app._user.we.more.name
    });
    //判断并读取缓存
    if(app.cache.cj){ cjRender(app.cache.cj); }
    function cjRender(_data){
      var year = _data.year;     // 当前学年
      var term = _data.term;     // 当前学期   
      var currentDate = app.util.formatTime(new Date,'');
      _this.setData({
        cjInfo: _data,
        year: year,
        term: term,
        remind: '',
        currentDate:currentDate
      });
      // getdate();
    }
    wx.showNavigationBarLoading();
    wx.request({
      url: app._server + "/QueryGradeServlet",
      method: 'POST',
      data: {
        openid: app._user.openid,
        id: app._user.we.ykth
      },
      header: {
                  'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        if(res.data && res.data.status >= 200 && res.data.status < 400) {
          var _data = res.data.data;
          if(_data) {
            //保存成绩缓存
            app.saveCache('cj', _data);
            cjRender(_data);
          } else { _this.setData({ remind: '官网暂无成绩数据' }); }

        } else {
          app.removeCache('cj');
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

    function changeNum(num){  
      var china = ['零','一','二','三','四','五','六','七','八','九'];
      var arr = [];
      var n = ''.split.call(num,''); 
      for(var i = 0; i < n.length; i++){  
        arr[i] = china[n[i]];  
      }  
      return arr.join("")  
    }
  },
  //下拉更新
  /*
  onPullDownRefresh: function(){
    this.getcj();
  },
  */
  onLoad: function(){
      this.getcj();
  }
});