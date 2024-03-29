import { getDatasInterfaceUrl } from '@/api/config'
export default {
    data() {
        return {
            isLoading: false, // page is loading
            isFirst: true // page is first load
        }
    },
    methods: {
        textFilter(text, dataObj) {
            if (!text) return ''
            text = text.replace(/\r/gi, '').replace(/\n/gi, '<br/>')
            text = text.replace(/@\[.*\]/gi, (str) => {
                if (str.length < 4) return str
                return IDM.express.replace(str, dataObj, true)
            })
            return text
        },
        /**
         * 获取自定义字段值
         * @param {*} field 自定义字段
         * @param {*} dataObject 数据对象
         * @returns 对应字段的值
         */
        getDataField(field, dataObject) {
            if (!dataObject || !field) return ''
            return IDM.express.replace(`@[${field}]`, dataObject, true)
        },
        /**
         * 点击，列表单项事件
         * @param {*} item 列表单项数据
         * @returns
         */
        handleItemClick(item) {
            if (this.moduleObject.env === 'develop') {
                return
            }
            let url = null
            const pageId = this.getDataField(this.propData.subPageField, item)
            switch (this.propData.itemJumpStyle) {
                case '_link':
                    url = this.getDataField(this.propData.jumpUrlField, item)
                    if (!url) return
                    window.open(IDM.url.getWebPath(url))
                    break
                case '_child':
                    if (this.propData.itemPageList && this.propData.itemPageList.length > 0) {
                        IDM.router.push(
                            this.moduleObject.pageid,
                            this.propData.itemPageList[0].id,
                            this.propData.isItemKeep,
                            item,
                            '',
                            ''
                        )
                    } else {
                        IDM.message.warning('请选择要跳转的子页面')
                    }
                    break
                case '_interface_child':
                    if (pageId) {
                        IDM.router.push(
                            this.moduleObject.pageid,
                            pageId,
                            this.propData.isItemKeep,
                            item,
                            '',
                            ''
                        )
                    } else {
                        IDM.message.warning('接口没有返回子页面id')
                    }
                    break
                case '_custom_link':
                    url = this.textFilter(this.propData.customItemLink, item)
                    if (!url) return
                    window.open(IDM.url.getWebPath(url))
                    break
                case '_custom_func':
                    if (this.propData.jumpItemCustomFunc && this.propData.jumpItemCustomFunc.length > 0) {
                        const funcName = this.propData.jumpItemCustomFunc[0].name
                        window[funcName] && window[funcName].call(this)
                    }
            }
        },
        /**
         * 点击更多事件
         */
        handleClickMore() {
            if (this.moduleObject.env === 'develop') {
                return
            }
            let url = null
            switch (this.propData.jumpStyle) {
                case '_link':
                    url = this.getDataField(this.propData.moreUrlField, this.pageData)
                    if (!url) return
                    url = IDM.url.getWebPath(url)
                    window.open(url)
                    break
                case '_child':
                    if (this.propData.morePageList && this.propData.morePageList.length > 0) {
                        IDM.router.push(
                            this.moduleObject.pageid,
                            this.propData.morePageList[0].id,
                            this.propData.isItemKeep,
                            this,
                            '',
                            ''
                        )
                    } else {
                        IDM.message.warning('请选择要跳转的子页面')
                    }
                    break
                case '_custom_link':
                    url = this.textFilter(this.propData.customMoreLink, this.pageData)
                    if (!url) return
                    window.open(IDM.url.getWebPath(url))
                    break
                case '_custom_func':
                    if (this.propData.jumpMoreCustomFunc && this.propData.jumpMoreCustomFunc.length > 0) {
                        const funcName = this.propData.jumpCustomFunc[0].name
                        window[funcName] && window[funcName].call(this)
                    }
            }
        },
        /**
         * 通用的url参数对象
         * 所有地址的url参数转换
         */
        commonParam() {
            let urlObject = IDM.url.queryObject()
            var params = {
                pageId:
                    window.IDM.broadcast && window.IDM.broadcast.pageModule ? window.IDM.broadcast.pageModule.id : '',
                urlData: JSON.stringify(urlObject)
            }
            return params
        },
        /**
         * 获取数据源数据
         */
        getDataSourceData() {
            window.IDM.http
                .post(
                    getDatasInterfaceUrl,
                    {
                        id: this.propData.dataSource && this.propData.dataSource.value,
                        limit: this.propData.limit,
                        start: 0
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json;charset=UTF-8'
                        }
                    }
                )
                .then((res) => {
                    //res.data
                    if (res.status == 200 && res.data.code == 200) {
                        this.pageData = res.data.data
                    } else {
                        IDM.message.error(res.data.message)
                    }
                })
                .finally(() => {
                    this.isLoading = false
                })
        },
        /**
         * 通用的获取表达式匹配后的结果
         */
        getExpressData(dataName, dataFiled, resultData) {
            //给defaultValue设置dataFiled的值
            var _defaultVal = undefined
            if (dataFiled) {
                var filedExp = dataFiled
                filedExp = dataName + (filedExp.startsWiths('[') ? '' : '.') + filedExp
                var dataObject = { IDM: window.IDM }
                dataObject[dataName] = resultData
                _defaultVal = window.IDM.express.replace.call(this, '@[' + filedExp + ']', dataObject)
            }

            return _defaultVal
        },
        // 发送消息
        sendBroadcastMessage(object) {
            window.IDM.broadcast && window.IDM.broadcast.send(object)
        },
        // 列表组件统一接受消息
        receiveBroadcastMessage(messageObject) {
            switch (messageObject.type) {
                case 'websocket':
                    if (this.propData.messageRefreshKey && messageObject.message) {
                        const messageData =
                            (typeof messageObject.message === 'string' && JSON.parse(messageObject.message)) ||
                            messageObject.message
                        const arr = Array.isArray(this.propData.messageRefreshKey)
                            ? this.propData.messageRefreshKey
                            : [this.propData.messageRefreshKey]
                        if (messageData.badgeType && arr.includes(messageData.badgeType)) {
                            this.initData()
                        }
                    }
                    break
                case 'linkageReload':
                    this.initData()
                    break
                case 'pageResize':
                    this.pageWidth = messageObject.message.width
                    this.convertAttrToStyleObject()
                    break
            }
            console.log('组件收到消息', messageObject)
        }
    }
}
