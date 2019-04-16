// pages/info/info.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    version: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '生活小知识'
    })
    this.getVersion();
  },

  getVersion: function() {
    var that = this;
    wx.showToast({
      title: '加载中...',
      icon: 'loading'
    })
    wx.request({
      url: app.globalData.versionUrl,
      success(res) {
        if (res.data.version < app.globalData.curVersion) {
          wx.switchTab({
            url: '../newest/newest'
          })

        } else {
          that.setData({
            version: 1
          })
        }
      },
      fail(error) {
        console.log(res.error)
      },
      complete() {
        wx.hideToast();
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
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})