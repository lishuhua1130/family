const config = require('../../modules/config')
var app = getApp();
Page({
  data: {
    tvphide: false,
    src:"",
    vid: 's084966d1nt',
    changingvid: '',
    controls: true,
    autoplay: true,
    playbtnposition:'center',
    playState: '',
    showProgress1: true,
    width: "100%",
    height: "auto",
    scrollHeight: "200", //滚动列表高度
    videoTitle: '',
    videoCreateTime: '',
    // -- 相关视频【12个】
    relateListData: [],
    // -- 箭头动画效果
    arrowAni: '',
    // -- 是否显示引导图
    isShowGuide:false,
    // -- 是否正在播放视频
    isPlaying:true,
    // -- 视频是否播放完毕
    isPlayEnd:false,
  },
  arrowAniID:'',
  // -- 视频详细信息
  videoInfo: {},
  // -- 相关视频列表数据
  relateAllData: [],
  // -- 相关视频列表数据总长度
  relateDataLen: 0,
  // -- 正在播放的tkey
  curtKey: "",
  // -- myVideo
  videoContext:'',
  
  onLoad: function(options) {
    console.log("显示single页面", options);
    this.videoContext = wx.createVideoContext('myVideo')
    this.curtKey = options.tkey;
    // this.videoContext = txvContext.getTxvContext('txv0');
    //-- 获取视频详细信息
    this.getSingleVideoInfo(options.tkey, options.cloumnid);
    //-- 获取视频相关列表
    this.getRelateListData(options.cloumnid, options.readpage);
  },
  /**
   * tkey：视频的标识符
   */
  getSingleVideoInfo(tkey, cloumnid) {
    let that = this;
    console.log("tkey", tkey);
    wx.request({
      url: 'https://read.beizengplus.cn/read/3/' + cloumnid + '/' + tkey + '.json?'+ Math.random(),
      success(res) {
        that.setVideoInfo(res.data);
        // -- 调整视频列表高度
        that.adjustScrollHeight();
      },
      fail(error) {
        console.log("发生错误了", res.error)
      }
    })
  },
  /**
   * 调整高度
   */
  adjustScrollHeight: function() {
    var that = this;
    var query = wx.createSelectorQuery();
    //选择id
    // -- 获取视频高度
    query.select('.video').boundingClientRect(function(rect) {
      that.getVideoInfoTopHeight(rect.height);
    }).exec();
  },
  /**
   * @videoHeigh tvideo控件的高度
   */
  getVideoInfoTopHeight(videoHeight) {
    // --获取视频详细信息高度
    var that = this;
    var query = wx.createSelectorQuery();
    var res = wx.getSystemInfoSync();
    query.select('.shareView').boundingClientRect(function(inforect) {
      console.log("videoHeight", videoHeight);
      console.log("inforect", inforect.height);
      let temp = res.windowHeight - 10 - videoHeight - inforect.height;
      console.log("调整高度", temp);
      that.setData({
        scrollHeight: temp
      })
    }).exec();
  },
  /**
   * 返回首页
   */
  returnIndex: function() {
    wx.switchTab({
      url: '../newest/newest',
    })
  },
  /**
   * 前往推荐页
   */
  returnRecommend:function(){
    wx.switchTab({
      url: '../recommend/recommend',
    })
  },
  /**
   * 播放相关列表视频
   */
  playVideo: function(event) {
    wx.redirectTo({
      url: "../single/single?tkey=" + event.currentTarget.dataset.tkey + "&cloumnid=" + event.currentTarget.dataset.cloumnid
    })
  },
  /**
   * 设置视频信息
   */
  setVideoInfo(data) {
    this.videoInfo = data;
    let app = getApp();
    var that = this;
    wx.request({
      url: 'https://vv.video.qq.com/getinfo?vids=' + data.readVideo+'&platform=101001&charge=0&otype=json',
      success(res) {
        var len = res.data.length;
        var data = res.data.substring(13, len-1);
        data = JSON.parse(data)
        var url = data.vl.vi[0].ul.ui[0].url + data.vl.vi[0].fn + '?vkey=' + data.vl.vi[0].fvkey;
        wx.setNavigationBarTitle({
          title: that.videoInfo.title
        })
        that.setData({
          src: url,
          videoTitle: that.videoInfo.title,
          videoCreateTime: app.translateTime(data.vl.vi[0].uptime*1000)
        })
      },
      fail(error) {
        console.log("发生错误了", res.error)
      }
    })


    // this.setData({
    //   vid: data.readVideo,
    //   videoTitle: data.title,
    //   videoCreateTime: app.translateTime(data.createTime)
    // })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.stopPullDownRefresh();
  },
  /**
   * 获取相关视频列表
   */
  getRelateListData: function(columnID, readyPage) {
    let url = url = 'https://read.beizengplus.cn/read/3/' + columnID + '/readList.json?0.891011677593415';
    let that = this;
    wx.request({
      url: url,
      success(res) {
        that.relateAllData = res.data;
        that.relateDataLen = res.data.length;
        console.log(that.relateAllData);
        if (readyPage) {
          that.filterRelateDataFromNew(readyPage);
        } else {
          that.getRandomRelateData();
        }
      },
      fail(error) {
        console.log(res.error)
      }
    })
  },
  /**
   * 挑选相关数据【从最新点击进来的操作】
   */
  filterRelateDataFromNew: function(readyPage) {
    console.log("从最新点击进来的操作", readyPage);
    let readEnd = readyPage * app.globalData.eachPageCount;
    let unReadCount = this.relateDataLen - readEnd;
    // -- 如果数据不够读取，重新开始挑选数据
    if (unReadCount < 12) {
      readEnd = 0;
      unReadCount = this.relateDataLen;
    }
    let tempArr = [];
    let recordIndex = [];
    while (tempArr.length < 12) {
      let index = Math.floor(Math.random() * unReadCount + readEnd);
      if (recordIndex.indexOf(index) == -1 && index < this.relateDataLen) {
        recordIndex.push(index);
        let tempItem = this.relateAllData[index];
        // -- 剔除掉正在播放的视频
        if (tempItem.tKey != this.curtKey) {
          tempArr.push(tempItem);
        }
      }
    }
    this.setData({
      relateListData: tempArr
    })
    console.log(tempArr);
  },
  /**
   * 随机获取相关视频列表
   */
  getRandomRelateData: function() {
    console.log("随机获取相关视频列表");
    let tempArr = [];
    let recordIndex = [];
    while (tempArr.length < 12) {
      let index = Math.floor(Math.random() * this.relateDataLen);
      if (recordIndex.indexOf(index) == -1) {
        recordIndex.push(index);
        let tempItem = this.relateAllData[index];
        // -- 剔除掉正在播放的视频
        if (tempItem.tKey != this.curtKey) {
          tempArr.push(tempItem);
        }
      }
    }
    this.setData({
      relateListData: tempArr
    })
    console.log(tempArr);
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: this.videoInfo.title,
      path: '/pages/single/single?tkey=' + this.videoInfo.tKey + "&cloumnid=" + this.videoInfo.cloumnId,
      imageUrl: this.videoInfo.shareImg
    }
  },
  /**
   * 显示引导图
   */
  openGuide:function(){
    this.setData({
      isShowGuide: true
    })
  },
  /**
   * 点击引导图：关闭引导显示
   */
  clickGuide:function(){
    this.setData({
      isShowGuide:false
    })
  },
  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    var attentionAnim = wx.createAnimation({
      duration: 300,
      timingFunction: 'linear',
      delay: 0,
    })
    //设置循环动画
    var next = true;
    this.arrowAniID = setInterval(() => {
      if (next) {
        //根据需求实现相应的动画
        attentionAnim.scale(1.5, 1.5).step()
        next = !next;
      } else {
        attentionAnim.scale(1, 1).step()
        next = !next;
      }
      this.setData({
        //导出动画到指定控件animation属性
        arrowAni: attentionAnim.export()
      })
    }, 300);
    console.log("this.arrowAniID",this.arrowAniID);
  },

  /**
   * 页面隐藏/切入后台时触发。 如 navigateTo 或底部 tab 切换到其他页面，小程序切入后台等。
   */
  onHide: function () {
    clearInterval(this.arrowAniID);
  },
  /**
   * 页面卸载时触发。如redirectTo或navigateBack到其他页面时。
   */
  onUnload:function(){
    clearInterval(this.arrowAniID);
  },
  /**
   * 视频暂停了
   */
  videoPause:function(){
    this.setData({
      isPlaying:false
    })
  },
  /**
   * 播放视频
   */
  videoPlay:function(){
    this.setData({
      isPlaying: true,
      isPlayEnd: false
    })
  },
  /**
   * 视频播放完毕
   */
  videoEnd:function(){
    this.setData({
      isPlayEnd: true
    })
  },
  /**
   * 播放当前视频
   */
  playCurVideo:function(){
    this.videoContext.play();
  },
  /**
   * 点击滚动面板
   */
  testScroll:function(e){
    console.log("点击滚动面板");
    console.log(e);
  }
});