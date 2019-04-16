// miniprogram/pages/newest/newest.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    newestTopTabs: [],
    allVideoTabConfig: [{
      cloumnName: "全部",
      createTime: 0,
      id: 0,
      isShow: 1,
      sort: 1
    }],
    curTabId: 0, //当做头部tab的索引值
    videoList: [],
    isFlagShow:true,
    videoListHeight: "" //视频列表高度，动态计算
  },
  // -- 当前所在tab的所有视频列表数据
  curTabVideoAllList: [],
  // -- 页数
  curPage: 0,
  // -- 每页的数量
  perPageCount: 0,
  //-- 滚动刷新距离
  scrollTop: 5,
  // --定时器
  timer: null,
  // -- 是否正在滚动刷新
  isScrollRefresh: false,
  // -- 确保滚动条下拉时不会触发刷新功能，记录上一次滚动距离顶部位置，只有距离位置从大变小才说明是下拉刷新功能
  lastScrollTop: -1,
  // -- 当前分类视频的第一个分享图地址
  shareImgUrl:'',
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.perPageCount = app.globalData.eachPageCount;
    var res = wx.getSystemInfoSync();
    this.setData({
      // -- 减掉Tab高度以及和tab的间隔
      videoListHeight: res.windowHeight - 36
    })
    this.getTopTabData();
    // --一开始默认显示【全部】视频列表
    this.getVideoListData(0);

    //是否是体验版
    // this.getVersion();
  },
  getVersion:function(){
    var that = this;
    wx.request({
      url: app.globalData.versionUrl,
      success(res) {
        var flag = res.data.version >= app.globalData.curVersion;
        console.log(res.data);
        console.log(app.globalData.curVersion);
        console.log(flag);
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
   * 获取顶部tab数据
   */
  getTopTabData: function() {
    var that = this;
    wx.request({
      url: 'https://read.beizengplus.cn/cloumn/cloumnList.json?' + Math.random(),
      success(res) {
        var tempArr = that.data.allVideoTabConfig.concat(res.data);
        that.setData({
          newestTopTabs: tempArr
        })
      },
      fail(error) {
        console.log(res.error)
      }
    })
  },
  /**
   * 获取首页/分类的列表数据
   * id:0【表示首页】1-5【分类页】
   */
  getVideoListData: function(id) {
    console.log('获取页面新数据');
    let url;
    let that = this;
    if (id > 0) {
      // -- 分类页
      url = 'https://read.beizengplus.cn/read/3/' + id + '/readList.json?'+ Math.random();
    } else {
      url = 'https://read.beizengplus.cn/read/3/readList.json?' + Math.random();
    }
    wx.request({
      url: url,
      success(res) {
        // -- 将this.curPage置空
        that.curPage = 0;
        that.curTabVideoAllList = res.data;
        let totalCount = that.getCurShowTotalCount();
        var tempArr = res.data.slice(0, totalCount);
        that.setData({
          videoList: tempArr
        })
        // -- 当videoList重置时，获取该列表第一个的分享图地址
        that.getShareUrl();
        // -- 关闭下拉操作
        wx.stopPullDownRefresh();
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
  },

/**
* 页面相关事件处理函数--监听用户下拉动作
*/
  onPullDownRefresh: function () {
    clearTimeout(this.timer);
    wx.showLoading({
      title: '正在刷新',
      mask: true
    })
    this.timer = setTimeout(() => {
      wx.hideLoading();
      this.getVideoListData(this.data.curTabId);
    }, 800)
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let total = this.getCurShowTotalCount();
    this.setData({
      videoList: this.curTabVideoAllList.slice(0, total)
    })
  },

  /**
   * scroll滚动到底部触发事件
   */
  scrollBottom: function() {
    let total = this.getCurShowTotalCount();
    console.log(total);
    this.setData({
      videoList: this.curTabVideoAllList.slice(0, total)
    })
  },
  /**
   * 刷新页面数量
   * 返回页面当前需要显示的视频数量
   */
  getCurShowTotalCount() {
    this.curPage++;
    return this.curPage * this.perPageCount;
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    // -- 获取列表显示的第一个数据
    let videoInfo = this.data.videoList[0];
    return {
      title: app.globalData.videoName,
      path: '/pages/single/single?tkey=' + videoInfo.tKey + "&cloumnid=" + videoInfo.cloumnId,
      imageUrl: this.shareImgUrl
    }
  },
  /**
   * 顶部tab选择函数
   */
  selectTopTab: function(event) {
    this.setData({
      curTabId: event.currentTarget.dataset.index
    });
    this.getVideoListData(this.data.curTabId);
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
  },
  /**
   * 刷新对应tab的veidoList数据
   */
  refreshTabVideo: function() {
    console.log("刷新veidoList数据", this.data.curTabId);

  },
  /**
   * 显示单个视频
   */
  gotoVideoShow: function(event) {
    wx.navigateTo({
      url: "../single/single?tkey=" + event.currentTarget.dataset.tkey + "&cloumnid=" + event.currentTarget.dataset.cloumnid + "&readpage=" + this.curPage
    })
  },
  /**
   * 禁止手动滑动swiper
   */
  stopTouchMove: function() {
    return false;
  },
  /**
   * 获取当前分类页第一个视频的分享图
   */
  getShareUrl: function() {
    let that = this;
    wx.request({
      url: 'https://read.beizengplus.cn/read/3/' + that.data.videoList[0].cloumnId + '/' + that.data.videoList[0].tKey + '.json?' + Math.random(),
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