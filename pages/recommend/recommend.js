// miniprogram/pages/recommend/recommend.js
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: '../../images/user-unlogin.png',
    userInfo: {},
    logged: false,
    curTime: "",
    isFlagShow: true,
    //--当前显示的列表
    curListData: [],
  },
  perPageCount:0,
  //--首页全部数据
  allListData: [],
  //-- 首页全部数据总长度
  allListLen: 0,
  // -- 当前已经展现过的数据ID
  randomIndexList: [],
  weekday: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
  // -- 分享图地址
  shareImgUrl:'',
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.perPageCount = app.globalData.eachPageCount;
    this.getCurTime();
    this.refreshAllListData();
    //是否是体验版
    this.getVersion();
  },

  getVersion: function () {
    var that = this;
    wx.request({
      url: app.globalData.versionUrl,
      success(res) {
        var flag = res.data.version >= app.globalData.curVersion;
        that.setData({
          isFlagShow: flag
        })
      },
      fail(error) {
        console.log(res.error)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // -- 获取页面数据
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    console.log("重新刷新");
    this.refreshAllListData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    wx.showLoading({
      title: '正在加载',
      mask:true
    })
    this.refreshCurListData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    // -- 获取列表显示的第一个数据
    let videoInfo = this.data.curListData[0];
    return {
      title: app.globalData.videoName,
      path: '/pages/single/single?tkey=' + videoInfo.tKey + "&cloumnid=" + videoInfo.cloumnId,
      imageUrl: this.shareImgUrl
    }
  },
  /**
   * 获取当前时间日期
   */
  getCurTime() {
    let curTime = new Date();
    let tempStr = (curTime.getMonth()+1) + "月" + curTime.getDate() + " " + this.weekday[curTime.getDay()];
    this.setData({
      curTime: tempStr
    })
  },
  /**
   * 获取用户信息
   */
  onGetUserInfo: function(e) {
    if (this.data.logged) {
      return;
    }
    let that = this;
    if (!this.data.logged && e.detail.userInfo) {
      wx.showModal({
        title: app.globalData.videoName+'申请',
        content: '获取你的昵称、头像、地区以及性别',
        success(res) {
          if (res.confirm) {
            that.setData({
              logged: true,
              avatarUrl: e.detail.userInfo.avatarUrl,
              userInfo: e.detail.userInfo
            })

          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },
  /**
   * 刷新首页全部数据
   */
  refreshAllListData: function() {
    let url = 'https://read.beizengplus.cn/read/3/readList.json?'+ Math.random();
    let that = this;
    wx.request({
      url: url,
      success(res) {
        that.allListData = res.data;
        //-- 置空数据
        that.randomIndexList = [];
        that.setData({
          curListData:[]
        })
        // -- 获取当前页面第一个视频的分享图
        that.allListLen = that.allListData.length;
        // -- 关闭下拉操作
        wx.stopPullDownRefresh();
        that.refreshCurListData();
      },
      fail(error) {
        console.log(res.error)
      }
    })
  },
  /**
   * 刷新当前推荐页面显示列表，每一次刷新多显示12个，以此增加
   */
  refreshCurListData: function() {
    let tempArr = [];
    let curCount = 0;
    while (curCount < this.perPageCount) {
      let randomIndex = Math.floor(Math.random() * this.allListLen);
      // --表示已经存在
      if (this.randomIndexList.indexOf(randomIndex) == -1) {
        this.randomIndexList.push(randomIndex);
        tempArr.push(this.allListData[randomIndex]);
        curCount++;
      }
    }
    this.setData({
      curListData: this.data.curListData.concat(tempArr)
    });
    this.getShareUrl();
    tempArr = null;
    console.log(this.data.curListData);
    wx.hideLoading();
  },
  /**
   * 跳转到视频播放界面
   */
  gotoVideoShow:function(event){
    wx.navigateTo({
      url: "../single/single?tkey=" + event.currentTarget.dataset.tkey + "&cloumnid=" + event.currentTarget.dataset.cloumnid
    })
  },
  /**
 * 获取当前分类页第一个视频的分享图
 */
  getShareUrl: function () {
    let that = this;
    wx.request({
      url: 'https://read.beizengplus.cn/read/3/' + that.data.curListData[0].cloumnId + '/' + that.data.curListData[0].tKey + '.json?'+Math.random(),
      success(res) {
        that.shareImgUrl = res.data.shareImg;
        console.log(that.shareImgUrl);
      },
      fail(error) {
        console.log("发生错误了", res.error)
      }
    })
  }
})