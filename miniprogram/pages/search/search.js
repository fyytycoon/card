var util = require('../../utils/util.js');
const app = getApp();
const db = wx.cloud.database()
const _ = db.command
Page({
    data: {
        keywrod: '',
        searchStatus: false,
        goodsList: [],
        helpKeyword: [],
        historyKeyword: [],
        categoryFilter: false,
        currentSortType: 'default',
        filterCategory: [],
        defaultKeyword: {},
        hotKeyword: [],
        currentSortOrder: 'desc',
        salesSortOrder:'desc',
        categoryId: 0,
    },
    //事件处理函数
    closeSearch: function () {
        wx.navigateBack()
    },
    clearKeyword: function () {
        this.setData({
            keyword: '',
            searchStatus: false
        });
    },
    onLoad: function () {
    },

    inputChange: function (e) {
        this.setData({
            keyword: e.detail.value,
            searchStatus: false
        });
    },
    
    inputFocus: function () {
        this.setData({
            searchStatus: false,
            goodsList: []
        });
    },
    clearHistory: function () {
        this.setData({
            historyKeyword: []
        })

        util.request(api.SearchClearHistory, {}, 'POST')
            .then(function (res) {
            });
    },
    getGoodsList: function () {
        let that = this;
        db.collection('productdata').where({
            //使用正则查询，实现对搜索的模糊查询
            name: db.RegExp({
            regexp: that.data.keyword,
            //从搜索栏中获取的value作为规则进行匹配。
            options: 'i',
            //大小写不区分
            }),
            organizationid: app.globalData.userProfile.organizationid
        }).get({
            success: res=>{
                console.log(res)
                that.setData({
                    searchStatus: true,
                    goodsList: res.data,
                });
            }
        })
    },
    onKeywordTap: function (event) {
        this.getSearchResult(event.target.dataset.keyword);
    },
    getSearchResult(keyword) {
        this.setData({
            keyword: keyword,
            page: 1,
            categoryId: 0,
            goodsList: []
        });

        this.getGoodsList();
    },
    onKeywordConfirm(event) {
        this.getSearchResult(event.detail.value);
    }
})