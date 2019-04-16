//app.js
App({
  onLaunch: function () {
    
    // if (!wx.cloud) {
    //   console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    // } else {
    //   wx.cloud.init({
    //     traceUser: true,
    //   })
    // }

    this.globalData = {
      eachPageCount:12,
      versionUrl:'https://cdn.zdge.top/video/version.json?v='+Math.random(),//自己的api,
      curVersion:1,
      videoName:"家园影片"
    }
  },
  /**
   * 转化时间
   */
  translateTime(time){
    let createTime = new Date(time);
    return createTime.getFullYear() + "-" + (createTime.getMonth() + 1) + "-" + createTime.getDate();
  },


  /**
 * 获取当前分类页第一个视频的分享图
 */
  getShareUrl: function (cloumnId, tKey) {
    let that = this;
    wx.request({
      url: 'https://read.beizengplus.cn/read/3/' + cloumnId + '/' + tKey + '.json?' + Math.random(),
      success(res) {
        that.shareImgUrl = res.data.shareImg;
        console.log(that.shareImgUrl);
        return res.data.shareImg;
      },
      fail(error) {
        console.log("发生错误了", res.error)
      }
    })
  }

})
