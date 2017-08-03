//index.js
//获取应用实例
var app = getApp();
Page({
  data: {
    offline: false,
    remind: '加载中',
    core: [
      { id: 'tb', name: '贴吧', disabled: false, teacher_disabled: false, offline_disabled: false },
      { id: 'tsg', name: '图书馆', disabled: false, teacher_disabled: false, offline_disabled: true },
      { id: 'kb', name: '课表查询', disabled: false, teacher_disabled: false, offline_disabled: false },
      { id: 'xyk', name: '校园卡', disabled: false, teacher_disabled: false, offline_disabled: true },
      // { id: 'ks', name: '考试安排', disabled: false, teacher_disabled: false, offline_disabled: true },
      { id: 'ts', name:'图书查询', disabled: false, teacher_disabled: false, offline_disabled: false },
      { id: 'cj', name: '成绩查询', disabled: false, teacher_disabled: true, offline_disabled: true },
      { id: 'kjs', name: '空教室', disabled: false, teacher_disabled: false, offline_disabled: false },
      { id: 'bbq', name: '表白墙', disabled: false, teacher_disabled: false, offline_disabled: false },
      // { id: 'xs', name: '学生查询', disabled: false, teacher_disabled: false, offline_disabled: true },
      // { id: 'ykt', name: '一卡通', disabled: false, teacher_disabled: false, offline_disabled: false },
      // { id: 'tsg', name: '图书馆信息', disabled: false, teacher_disabled: false, offline_disabled: false },
      // { id: 'xf', name: '学费信息', disabled: false, teacher_disabled: true, offline_disabled: false },
      // { id: 'sdf', name: '电费查询', disabled: false, teacher_disabled: true, offline_disabled: false },
      // { id: 'bx', name: '物业报修', disabled: false, teacher_disabled: false, offline_disabled: true }
    ],
    card: {
      'kb': {
        show: false,
        time_list: [
          { begin: '8:00', end: '8:45' },
          { begin: '8:55', end: '9:40' },
          { begin: '10:05', end: '10:50' },
          { begin: '11:00', end: '11:45' },
          { begin: '14:00', end: '14:45' },
          { begin: '14:55', end: '15:40' },
          { begin: '16:05', end: '16:50' },
          { begin: '17:00', end: '17:45' },
          { begin: '19:00', end: '19:45' },
          { begin: '19:55', end: '20:40' },
          { begin: '20:50', end: '21:35' },
          { begin: '21:45', end: '22:30' }
        ],
        data: {}
      },
      'xyk': {
        show: false,
        data: {
          /*
          'last_time': '',
          'balance': 0,
          'cost_status': false,
          'today_cost': {
            value: [],
            total: 0
          }
          */
          'status':'',
          'balance':'',
          'yesterdayconsume':'',
          'weekconsume':'',
          'lasttime':''
        }
      },
      'tsg': {
        show: false,
        data: {}
      },
      'sdf': {
        show: false,
        data: {
          'room': '',
          'record_time': '',
          'cost': 0,
          'spend': 0
        }
      }
    },
    user: {},
    disabledItemTap: false //点击了不可用的页面
  },
  //分享
  onShareAppMessage: function(){
    return {
      title: 'Hi广科',
      desc: '碎片化、一站式、一体化校园移动门户，你的贴心小助手。',
      path: '/pages/index/index'
    };
  },
  //下拉更新
  onPullDownRefresh: function(){
    if(app._user.is_bind){
      this.getCardData();
    }else{
      wx.stopPullDownRefresh();
    }
  },
  onShow: function(){
    var _this = this;
    //离线模式重新登录
    if(_this.data.offline){
      _this.login();
      return false;
    }
    function isEmptyObject(obj){ for(var key in obj){return false;} return true; }
    function isEqualObject(obj1, obj2){ if(JSON.stringify(obj1) != JSON.stringify(obj2)){return false;} return true; }
    var l_user = _this.data.user,  //本页用户数据
        g_user = app._user; //全局用户数据
    //排除第一次加载页面的情况（全局用户数据未加载完整 或 本页用户数据与全局用户数据相等）
    if(isEmptyObject(l_user) || !g_user.openid || isEqualObject(l_user.we, g_user.we)){
      return false;
    }
    //全局用户数据和本页用户数据不一致时，重新获取卡片数据
    if(!isEqualObject(l_user.we, g_user.we)){
      //判断绑定状态
      if(!g_user.is_bind){
        _this.setData({
          'remind': '未绑定'
        });
      }else{
        _this.setData({
          'remind': '加载中'
        });
        //清空数据
        _this.setData({
          user: app._user,
          'card.kb.show': false,
          'card.xyk.show': false,
          'card.tsg.show': false,
          'card.sdf.show': false
        });
        _this.getCardData();
      }
    }
  },
  onLoad: function(){
    this.login();
  },
  login: function(){
    var _this = this;
    //如果有缓存，则提前加载缓存
    if(app.cache.version === app.version){
      try{
        _this.response();
      }catch(e){
        //报错则清除缓存
        app.cache = {};
        wx.clearStorage();
      }
    }
    //然后再尝试登录用户, 如果缓存更新将执行该回调函数
    app.getUser(function(status){
      _this.response.call(_this, status);
    });
  },
  response: function(status){
    var _this = this;
    if(status){
      if(status != '离线缓存模式'){
        //错误
        _this.setData({
          'remind': status
        });
        return;
      }else{
        //离线缓存模式
        _this.setData({
          offline: true
        });
      }
    }
    _this.setData({
      user: app._user
    });
    //判断绑定状态
    if(!app._user.is_bind){
      _this.setData({
        'remind': '未绑定'
      });
    }else{
      _this.setData({
        'remind': '加载中'
      });
      _this.getCardData();
    }
  },
  disabled_item: function(){
    var _this = this;
    if(!_this.data.disabledItemTap){
      _this.setData({
        disabledItemTap: true
      });
      setTimeout(function(){
        _this.setData({
          disabledItemTap: false
        });
      }, 2000);
    }
  },
  // 渲染卡片
  getCardData: function(){
    var _this = this;
    //判断并读取缓存
    if(app.cache.kb){ kbRender(app.cache.kb); }
    if(app.cache.xyk){ xykRender(app.cache.xyk); }
    if(app.cache.sdf){ sdfRender(app.cache.sdf); }
    if(app.cache.tsg){ tsgRender(app.cache.tsg); }
    if(_this.data.offline){ return; }
    wx.showNavigationBarLoading();

    //课表渲染
    function kbRender(info){
      var today = parseInt(info.day),
          lessons = info.lessons[today===0 ? 6 : today-1], //day为0表示周日(6)，day为1表示周一(0)..
          list = [],
          time_list = _this.data.card.kb.time_list;
      // for(var i = 0; i < 6; i++){
        for(var i = 0; i < 6; i++){
        for(var j = 0; j < lessons[i].length; j++){
          var lesson = lessons[i][j];// 当天课程
          //   && lesson.weeks.indexOf(parseInt(info.week)) != -1
          if(lesson.weeks && lesson.weeks.indexOf(parseInt(info.week)) != -1){
            var begin_lesson = 2*i+1, end_lesson = 2*i+lesson.number;
            list.push({
              when: begin_lesson+' - '+end_lesson+'节'
                    +'（'+time_list[begin_lesson-1].begin+'~'+time_list[end_lesson-1].end+'）',
              what: lesson.name,
              where: lesson.place.trim()
            });
          }
        }
      }
      _this.setData({
        'card.kb.data': list,
        'card.kb.show': true,
        'card.kb.nothing': !list.length,
        'remind': ''
      });
    }
    //获取课表数据
    var kb_data = {
      id: app._user.we.ykth,
    };
    if(app._user.teacher){ kb_data.type = 'teacher'; }
    var loadsum = 0; //正在请求连接数
    loadsum++; //新增正在请求连接
    wx.request({
      url: app._server + '/QueryLessonsServlet',
      method: 'POST',
      data:{
        openid: app._user.openid
      },header: {
           'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        if(res.data && res.data.status >= 200 && res.data.status < 400){
          var info = res.data.data;
          if(info){
            //保存课表缓存
            app.saveCache('kb', info);
            kbRender(info);
          }
        }else{ app.removeCache('kb'); }
      },
      complete: function() {
        loadsum--; //减少正在请求连接
        if(!loadsum){
          if(_this.data.remind == '加载中'){
            _this.setData({
              remind: '首页暂无展示'
            });
          }
          wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh();
        }
      }
    });

    //校园卡渲染
    function xykRender(list){
      /*
      if(list.length > 0){
        var last = list[0],
            last_time = last.time.split(' ')[0],
            now_time = app.util.formatTime(new Date()).split(' ')[0];
        //筛选并计算当日消费（校园卡数据有一定延迟，无法成功获取到今日数据，主页卡片通常不能展示）
        for(var i = 0, today_cost = [], cost_total = 0; i < list.length; i++){
          if(list[i].time.split(' ')[0] == now_time && list[i].cost.indexOf('-') == 0){
            var cost_value = Math.abs(parseInt(list[i].cost));
            today_cost.push(cost_value);
            cost_total += cost_value;
          }
        }
        if(today_cost.length){
          _this.setData({
            'card.xyk.data.today_cost.value': today_cost,
            'card.xyk.data.today_cost.total': cost_total,
            'card.xyk.data.cost_status': true
          });
        }
        _this.setData({
          'card.xyk.data.last_time': last_time,
          'card.xyk.data.balance': parseFloat(last.balance),
          'card.xyk.show': true,
          'remind': ''
        });
      }
      */
      _this.setData({
          'card.xyk.data.status': list.status,
          'card.xyk.data.balance': list.balance,
          'card.xyk.data.yesterdayconsume': list.yesterdayconsume,
          'card.xyk.data.weekconsume': list.weekconsume,
          'card.xyk.data.lasttime': list.lasttime,
          'card.xyk.show': true,
          'remind': ''
      });

    }
    //获取校园卡数据
    loadsum++; //新增正在请求连接
    wx.request({
      url: app._server + '/MealCardServlet',
      method: 'POST',
      data:{
        openid: app._user.openid
      },header: {
           'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        if(res.data && res.data.status === 200){
          var list = res.data.data;
          if(list){
            //保存校园卡缓存
            app.saveCache('xyk', list);
            xykRender(list);
          }
        }else{ app.removeCache('xyk'); }
      },
      complete: function() {
        loadsum--; //减少正在请求连接
        if(!loadsum){
          if(_this.data.remind){
            _this.setData({
              remind: '首页暂无展示'
            });
          }
          wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh();
        }
      }
    });

    //水电费渲染
    /*
    function sdfRender(info){
      _this.setData({
        'card.sdf.data.room': info.room.split('-').join('栋'),
        'card.sdf.data.record_time': info.record_time.split(' ')[0].split('/').join('-'),
        'card.sdf.data.cost': info.elec_cost,
        'card.sdf.data.spend': info.elec_spend,
        'card.sdf.show': true,
        'remind': ''
      });
    }
    if(!!app._user.we.room && !!app._user.we.build){
      //获取水电费数据
      loadsum++; //新增正在请求连接
      wx.request({
        url: app._server + '/api/get_elec.php',
        method: 'POST',
        data: app.key({
          buildingNo: app._user.we.build,
          floor: app._user.we.room.slice(0,1),
          room: parseInt(app._user.we.room.slice(1))
        }),
        success: function(res) {
          if(res.data && res.data.status === 200){
            var info = res.data.data;
            if(info){
              //保存水电费缓存
              app.saveCache('sdf', info);
              sdfRender(info);
            }
          }else{ app.removeCache('sdf'); }
        },
        complete: function() {
          loadsum--; //减少正在请求连接
          if(!loadsum){
            if(_this.data.remind){
              _this.setData({
                remind: '首页暂无展示'
              });
            }
            wx.hideNavigationBarLoading();
            wx.stopPullDownRefresh();
          }
        }
      });
    }
    */

    //图书馆信息渲染
    function tsgRender(info){
      if(parseInt(info.books_num) && info.book_list && info.book_list.length){
        var nowTime = new Date().getTime();
        info.book_list.map(function(e){
          var oDate = e.yhrq.split('-'),
              oTime = new Date(oDate[0], oDate[1]-1, oDate[2]).getTime();
          e.timing = parseInt((oTime - nowTime) / 1000 / 60 / 60 / 24);
          return e;
        });
        _this.setData({
          'card.tsg.data': info,
          'card.tsg.show': true,
          'remind': ''
        });
      }
    }
    //获取图书馆信息
    loadsum++; //新增正在请求连接
    wx.request({
     url: app._server + "/QueryBookServlet",
      method: 'POST',
      data:{
        openid: app._user.openid
      },header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        if(res.data && res.data.status === 200){
          var info = res.data.data;
          if(info){
            //保存图书馆缓存
            app.saveCache('tsg', info);
            tsgRender(info);
          }
        }else{ app.removeCache('tsg'); }
      },
      complete: function() {
        loadsum--; //减少正在请求连接
        if(!loadsum){
          if(_this.data.remind){
            _this.setData({
              remind: '首页暂无展示'
            });
          }
          wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh();
        }
      }
    });
  }
});