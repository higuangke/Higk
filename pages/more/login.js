//login.js
//获取应用实例
var app = getApp();
Page({
  data: {
    remind: '加载中',
    help_status: false,
    userid_focus: false,
    passwd_focus: false,
    userid: '',
    passwd: '',
    angle: 0
  },
  /* onLoad: function(){
    
  },*/
  onReady: function(){
    var _this = this;
    setTimeout(function(){
      _this.setData({
        remind: ''
      });
    }, 1000);
    wx.onAccelerometerChange(function(res) {
      var angle = -(res.x*30).toFixed(1);
      if(angle>14){ angle=14; }
      else if(angle<-14){ angle=-14; }
      if(_this.data.angle !== angle){
        _this.setData({
          angle: angle
        });
      }
    });
  },
  bind: function() {
    var _this = this;
    if(app.g_status){
      app.showErrorModal(app.g_status, '绑定失败');
      return;
    }
    if(!_this.data.userid || !_this.data.passwd){
      app.showErrorModal('账号及密码不能为空', '提醒');
      return false;
    }
    /*
    if(!app._user.openid){
      app.showErrorModal('未能成功登录', '错误');
      return false;
    }
    */
    app.showLoadToast('绑定中');
    wx.request({
      method: 'POST',
      url: app._server + '/BindServlet',// 请求绑定api
      // 无法解决加密问题，不进行加密
      data: {
        openid: app._user.openid,
        yktid: _this.data.userid,
        passwd: _this.data.passwd
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res){
        if(res.data && res.data.status >= 200 && res.data.status < 400){
          app.showLoadToast('请稍候');
          //清除缓存
          app.cache = {};
          wx.clearStorage();// 清理本地数据缓存。
          app.getUser(function(){
            wx.showToast({
              title: '绑定成功',
              icon: 'success',
              duration: 1500
            });
            // 添加信息的，暂时不需要
           /*
            if(!app._user.teacher){
              setTimeout(function(){
                wx.showModal({
                  title: '提示',
                  content: '部分功能需要完善信息才能正常使用，是否前往完善信息？',
                  cancelText: '以后再说',
                  confirmText: '完善信息',
                  success: function(res) {
                    if (res.confirm) {
                      wx.redirectTo({
                        url: 'append'
                      });
                    } else {
                      wx.navigateBack();
                    }
                  }
                });
              }, 1500);
            }else{
              wx.navigateBack();
            }
            */
            wx.navigateBack();
          });
        }else{
          wx.hideToast();
          // app.showErrorModal(res.data.message, '绑定失败');
          app.showErrorModal('您输入的账号或密码错误，请重新输入','绑定失败');
        }
      },
      fail: function(res){
        wx.hideToast();
        app.showErrorModal(res.errMsg, '绑定失败');
      }
    });
  },
  useridInput: function(e) {
    this.setData({
      userid: e.detail.value
    });
    if(e.detail.value.length >= 10){
      wx.hideKeyboard();
    }
  },
  passwdInput: function(e) {
    this.setData({
      passwd: e.detail.value
    });
  },
  inputFocus: function(e){
    if(e.target.id == 'userid'){
      this.setData({
        'userid_focus': true
      });
    }else if(e.target.id == 'passwd'){
      this.setData({
        'passwd_focus': true
      });
    }
  },
  inputBlur: function(e){
    if(e.target.id == 'userid'){
      this.setData({
        'userid_focus': false
      });
    }else if(e.target.id == 'passwd'){
      this.setData({
        'passwd_focus': false
      });
    }
  },
  tapHelp: function(e){
    if(e.target.id == 'help'){
      this.hideHelp();
    }
  },
  showHelp: function(e){
    this.setData({
      'help_status': true
    });
  },
  hideHelp: function(e){
    this.setData({
      'help_status': false
    });
  }
});