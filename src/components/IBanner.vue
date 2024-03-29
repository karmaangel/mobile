<template>
    <!--
    根目录规范(必须不能为空)：
    idm-ctrl：控件类型 drag_container：容器，drag_container_inlieblock：行内容器，idm_module：非容器的组件
    id：使用moduleObject.id，如果id不使用这个将会被idm-ctrl-id属性替换
    idm-ctrl-id：组件的id，这个必须不能为空
  -->
    <div
        idm-ctrl="idm_module"
        :id="moduleObject.id"
        :idm-ctrl-id="moduleObject.id"
        :title="propData.title"
        class="idm-banner-box"
    >
        <div class="idm-banner-box-swiper">
            <swiper ref="swiper" class="swiper" :options="swiperOption">
                <swiper-slide
                    class="swiper-slide idm-banner-box-swiper-item-container banner-item-container"
                    v-for="(item, index) in bannerData.value"
                    :key="index"
                    @click.native="handleClick(item, index)"
                >
                    <img
                        v-if="isSmallScreen || !item.imagexl"
                        :src="item.image && getImageUrl(item.image)"
                        class="slider-img"
                        alt=""
                    />
                    <img v-else :src="getImageUrl(item.imagexl) || getImageUrl(item.image)" class="slider-img" alt="" />
                    <span class="idm-banner-box-swiper-text" v-if="item.title">{{ item.title }}</span>
                </swiper-slide>
                <div v-show="propData.showBullet" class="idm-banner-swiper-pagination" slot="pagination"></div>
            </swiper>
            <div class="idm-banner-box-swiper-container">
                <ul class="swiper-wrapper">
                    <li
                        class="swiper-slide idm-banner-box-swiper-item-container banner-item-container"
                        v-for="(item, index) in bannerData.value"
                        :key="index"
                        @click="handleClick(item, index)"
                    >
                        <img
                            v-if="isSmallScreen || !item.imagexl"
                            :src="item.image && getImageUrl(item.image)"
                            class="slider-img"
                            alt=""
                        />
                        <img
                            v-else
                            :src="getImageUrl(item.imagexl) || getImageUrl(item.image)"
                            class="slider-img"
                            alt=""
                        />
                        <span class="idm-banner-box-swiper-text" v-if="item.title">{{ item.title }}</span>
                    </li>
                </ul>
                <div class="idm-banner-swiper-pagination" v-show="propData.showBullet"></div>
            </div>
        </div>
        <div
            class="idm-banner-box-mask"
            v-if="moduleObject.env === 'develop' && propData.dataType === 'dataSource' && !propData.dataSource"
        >
            <span>！未绑定数据源</span>
        </div>
    </div>
</template>

<script>
import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
import 'swiper/css/swiper.min.css'
import { getDatasInterfaceUrl } from '@/api/config'
import { getBannerData } from '../mock/mockData'
import adaptationScreen from '../mixins/adaptationScreen'
export default {
    name: 'IBanner',
    components: {
        Swiper,
        SwiperSlide
    },
    mixins: [adaptationScreen],
    data() {
        const _this = this
        return {
            moduleObject: {},
            propData: this.$root.propData.compositeAttr || {
                title: '轮播图',
                width: '100%',
                height: {
                    inputVal: 180,
                    selectVal: 'px'
                },
                limit: 3,
                showBullet: true,
                imgBorderRadius: {
                    inputVal: 8,
                    selectVal: 'px'
                },
                dataType: 'dataSource',
                dividingPoint: 600,
                bigScreenStretch: '-5.5%',
                smallScreenStretch: '-7%'
            },
            bannerData: { value: [] }
        }
    },
    computed: {
        swiperOption() {
            return {
                autoplay: {
                    //自动播放
                    delay: this.propData.delay || 3000,
                    disableOnInteraction: false
                },
                speed: 500, //播放速度
                loop: true, //循环播放
                effect: 'coverflow',
                centeredSlides: true,
                slidesPerView: 'auto',
                slideDuplicateClass: 'idm-banner-slide-duplicate',
                observeParents: true,
                observer: true,
                coverflowEffect: {
                    rotate: 0, //旋转度数
                    // stretch: this.isSmallScreen ? this.propData.smallScreenStretch : this.propData.bigScreenStretch,
                    stretch: '-7%',
                    depth: 100, //位置深度，越大越小
                    modifier: 1, //depth和rotate和stretch的倍率
                    slideShadows: false //阴影
                },
                pagination: {
                    //指示器
                    el: '.idm-banner-swiper-pagination', //指示器元素
                    bulletClass: 'idm-banner-my-bullet', //指示器单个元素类名
                    bulletActiveClass: 'idm-banner-my-bullet-active' //指示器单个元素当前激活类名
                }
            }
        },
        isSmallScreen() {
            let width = null
            if (this.moduleObject.env === 'develop') {
                width = this.pageWidth || 414
            } else {
                width = this.pageWidth || window.innerWidth
            }
            return this.propData.dividingPoint > width
        }
    },
    created() {
        this.moduleObject = this.$root.moduleObject
        this.convertAttrToStyleObject()
        this.convertThemeListAttrToStyleObject()
    },
    mounted() {},
    methods: {
        getImageUrl(url) {
            if (url && url.indexOf('/DreamWeb') == -1) {
                return IDM.url.getWebPath(url)
            }
            return url
        },
        initSwiper() {
            this.$nextTick(() => {
                // console.log(this.swiperOption, this.$refs.swiper, '<----------------')
                // this.$refs.swiper.updateSwiper()
                if (this.propData.autoplay) {
                    this.$refs.swiper.$swiper.autoplay.start()
                } else {
                    this.$refs.swiper.$swiper.autoplay.stop()
                }
                this.$refs.swiper.$swiper.slideToLoop(0, 0, false)
            })
        },
        /**
         * 提供父级组件调用的刷新prop数据组件
         */
        propDataWatchHandle(propData) {
            this.propData = propData.compositeAttr || {}
            this.convertAttrToStyleObject()
            this.convertThemeListAttrToStyleObject()
        },
        /**
         * 把属性转换成样式对象
         */
        convertAttrToStyleObject() {
            var styleObject = {}
            let bannerItemStyleObj = {}
            let bannerFontStyleObj = {}
            if (this.propData.bgSize && this.propData.bgSize == 'custom') {
                styleObject['background-size'] =
                    (this.propData.bgSizeWidth
                        ? this.propData.bgSizeWidth.inputVal + this.propData.bgSizeWidth.selectVal
                        : 'auto') +
                    ' ' +
                    (this.propData.bgSizeHeight
                        ? this.propData.bgSizeHeight.inputVal + this.propData.bgSizeHeight.selectVal
                        : 'auto')
            } else if (this.propData.bgSize) {
                styleObject['background-size'] = this.propData.bgSize
            }
            if (this.propData.positionX && this.propData.positionX.inputVal) {
                styleObject['background-position-x'] =
                    this.propData.positionX.inputVal + this.propData.positionX.selectVal
            }
            if (this.propData.positionY && this.propData.positionY.inputVal) {
                styleObject['background-position-y'] =
                    this.propData.positionY.inputVal + this.propData.positionY.selectVal
            }
            for (const key in this.propData) {
                if (this.propData.hasOwnProperty.call(this.propData, key)) {
                    const element = this.propData[key]
                    if (!element && element !== false && element != 0) {
                        continue
                    }
                    switch (key) {
                        case 'width':
                            styleObject[key] = element
                            break
                        case 'height':
                            if (this.isSmallScreen) {
                                if (this.moduleObject.env === 'develop' && element.selectVal === 'vw') {
                                    styleObject[key] = (element.inputVal / 100) * (this.pageWidth || 414) + 'px'
                                    bannerItemStyleObj[key] = (element.inputVal / 100) * (this.pageWidth || 414) + 'px'
                                } else {
                                    styleObject[key] = element.inputVal + element.selectVal
                                    bannerItemStyleObj[key] = element.inputVal + element.selectVal
                                }
                            }
                            break
                        case 'maxHeight':
                            if (!this.isSmallScreen) {
                                if (this.moduleObject.env === 'develop' && element.selectVal === 'vw') {
                                    styleObject['height'] = (element.inputVal / 100) * (this.pageWidth || 414) + 'px'
                                    bannerItemStyleObj['height'] =
                                        (element.inputVal / 100) * (this.pageWidth || 414) + 'px'
                                } else {
                                    styleObject['height'] = element.inputVal + element.selectVal
                                    bannerItemStyleObj['height'] = element.inputVal + element.selectVal
                                }
                            }
                            break
                        case 'box':
                            if (element.marginTopVal) {
                                styleObject['margin-top'] = `${element.marginTopVal}`
                            }
                            if (element.marginRightVal) {
                                styleObject['margin-right'] = `${element.marginRightVal}`
                            }
                            if (element.marginBottomVal) {
                                styleObject['margin-bottom'] = `${element.marginBottomVal}`
                            }
                            if (element.marginLeftVal) {
                                styleObject['margin-left'] = `${element.marginLeftVal}`
                            }
                            if (element.paddingTopVal) {
                                styleObject['padding-top'] = `${element.paddingTopVal}`
                            }
                            if (element.paddingRightVal) {
                                styleObject['padding-right'] = `${element.paddingRightVal}`
                            }
                            if (element.paddingBottomVal) {
                                styleObject['padding-bottom'] = `${element.paddingBottomVal}`
                            }
                            if (element.paddingLeftVal) {
                                styleObject['padding-left'] = `${element.paddingLeftVal}`
                            }
                            break
                        case 'bgImgUrl':
                            styleObject['background-image'] = `url(${window.IDM.url.getWebPath(element)})`
                            break
                        case 'positionX':
                            //背景横向偏移

                            break
                        case 'positionY':
                            //背景纵向偏移

                            break
                        case 'bgRepeat':
                            //平铺模式
                            styleObject['background-repeat'] = element
                            break
                        case 'bgAttachment':
                            //背景模式
                            styleObject['background-attachment'] = element
                            break
                        case 'border':
                            if (element.border.top.width > 0) {
                                styleObject['border-top-width'] =
                                    element.border.top.width + element.border.top.widthUnit
                                styleObject['border-top-style'] = element.border.top.style
                                if (element.border.top.colors.hex8) {
                                    styleObject['border-top-color'] = IDM.hex8ToRgbaString(
                                        element.border.top.colors.hex8
                                    )
                                }
                            }
                            if (element.border.right.width > 0) {
                                styleObject['border-right-width'] =
                                    element.border.right.width + element.border.right.widthUnit
                                styleObject['border-right-style'] = element.border.right.style
                                if (element.border.right.colors.hex8) {
                                    styleObject['border-right-color'] = IDM.hex8ToRgbaString(
                                        element.border.right.colors.hex8
                                    )
                                }
                            }
                            if (element.border.bottom.width > 0) {
                                styleObject['border-bottom-width'] =
                                    element.border.bottom.width + element.border.bottom.widthUnit
                                styleObject['border-bottom-style'] = element.border.bottom.style
                                if (element.border.bottom.colors.hex8) {
                                    styleObject['border-bottom-color'] = IDM.hex8ToRgbaString(
                                        element.border.bottom.colors.hex8
                                    )
                                }
                            }
                            if (element.border.left.width > 0) {
                                styleObject['border-left-width'] =
                                    element.border.left.width + element.border.left.widthUnit
                                styleObject['border-left-style'] = element.border.left.style
                                if (element.border.left.colors.hex8) {
                                    styleObject['border-left-color'] = IDM.hex8ToRgbaString(
                                        element.border.left.colors.hex8
                                    )
                                }
                            }

                            styleObject['border-top-left-radius'] =
                                element.radius.leftTop.radius + element.radius.leftTop.radiusUnit
                            styleObject['border-top-right-radius'] =
                                element.radius.rightTop.radius + element.radius.rightTop.radiusUnit
                            styleObject['border-bottom-left-radius'] =
                                element.radius.leftBottom.radius + element.radius.leftBottom.radiusUnit
                            styleObject['border-bottom-right-radius'] =
                                element.radius.rightBottom.radius + element.radius.rightBottom.radiusUnit
                            break
                        case 'titleFontStyle':
                            bannerFontStyleObj['font-family'] = element.fontFamily
                            if (element.fontColors.hex8) {
                                bannerFontStyleObj['color'] = IDM.hex8ToRgbaString(element.fontColors.hex8)
                            }
                            bannerFontStyleObj['font-weight'] = element.fontWeight && element.fontWeight.split(' ')[0]
                            bannerFontStyleObj['font-style'] = element.fontStyle
                            bannerFontStyleObj['font-size'] =
                                this.getAdaptiveSize(element.fontSize) + element.fontSizeUnit
                            bannerFontStyleObj['line-height'] =
                                element.fontLineHeight +
                                (element.fontLineHeightUnit == '-' ? '' : element.fontLineHeightUnit)
                            bannerFontStyleObj['text-align'] = element.fontTextAlign
                            bannerFontStyleObj['text-decoration'] = element.fontDecoration
                            break
                        case 'imgBorderRadius':
                            bannerItemStyleObj['border-radius'] = element.inputVal + element.selectVal
                            break
                        case 'marginTop':
                            styleObject['margin-top'] = element.inputVal + element.selectVal
                            break
                        case 'marginBottom':
                            styleObject['margin-bottom'] = element.inputVal + element.selectVal
                            break
                    }
                }
            }
            window.IDM.setStyleToPageHead(this.moduleObject.id, styleObject)
            window.IDM.setStyleToPageHead(
                this.moduleObject.id + ' .idm-banner-box-swiper-item-container',
                bannerItemStyleObj
            )
            window.IDM.setStyleToPageHead(this.moduleObject.id + ' .idm-banner-box-swiper-text', bannerFontStyleObj)
            this.initData()
        },
        /**
         * 主题颜色
         */
        convertThemeListAttrToStyleObject() {
            var themeList = this.propData.themeList
            if (!themeList) {
                return
            }
            const themeNamePrefix =
                IDM.setting && IDM.setting.applications && IDM.setting.applications.themeNamePrefix
                    ? IDM.setting.applications.themeNamePrefix
                    : 'idm-theme-'
            for (var i = 0; i < themeList.length; i++) {
                var item = themeList[i]
                let bulletBgColorObj = {
                    'background-color': item.mainColor ? IDM.hex8ToRgbaString(item.mainColor.hex8) : ''
                }
                IDM.setStyleToPageHead(
                    '.' +
                        themeNamePrefix +
                        item.key +
                        ' #' +
                        (this.moduleObject.packageid || 'module_demo') +
                        ' .idm-banner-my-bullet',
                    bulletBgColorObj
                )
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
         * 重新加载
         */
        reload() {
            //请求数据源
            this.initData()
        },
        /**
         * 加载动态数据
         */
        initData() {
            if (this.propData.dataType === 'custom') {
                this.propData.bannerTable &&
                    this.propData.bannerTable.forEach((el) => {
                        if (el.image === 'defaultImage') {
                            el.image = IDM.url.getModuleAssetsWebPath(
                                require('../assets/banner1.jpg'),
                                this.moduleObject
                            )
                        }
                    })
                // 自定义数据直接使用
                this.$set(this.bannerData, 'value', _.cloneDeep(this.propData.bannerTable))
                this.initSwiper()
                return
            } else {
                // 开发环境使用假数据，深拷贝方式数据fix不更新
                if (this.moduleObject.env === 'develop') {
                    const data = getBannerData.call(this)
                    this.bannerData = _.cloneDeep(data)
                    this.initSwiper()
                    return
                }
            }
            window.IDM.http
                .post(
                    getDatasInterfaceUrl,
                    {
                        type: 'picture',
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
                        this.bannerData = res.data.data
                        this.initSwiper()
                    } else {
                        IDM.message.error(res.data.message)
                    }
                })
                .catch((error) => {})
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
            //对结果进行再次函数自定义
            if (this.propData.customFunction && this.propData.customFunction.length > 0) {
                var params = this.commonParam()
                var resValue = ''
                try {
                    resValue =
                        window[this.propData.customFunction[0].name] &&
                        window[this.propData.customFunction[0].name].call(this, {
                            ...params,
                            ...this.propData.customFunction[0].param,
                            moduleObject: this.moduleObject,
                            expressData: _defaultVal,
                            interfaceData: resultData
                        })
                } catch (error) {}
                _defaultVal = resValue
            }

            return _defaultVal
        },
        /**
         * 轮播点击事件
         */
        handleClick(item, index) {
            if (this.moduleObject.env === 'develop') {
                return
            }
            switch (this.propData.jumpStyle) {
                case '_link':
                    if (item.jumpUrl) {
                        const url = IDM.url.getWebPath(item.jumpUrl)
                        window.open(url)
                    }
                    break
                case '_child':
                    if (this.propData.pageList && this.propData.pageList.length > 0) {
                        IDM.router.push(this.moduleObject.pageid, this.propData.pageList[0].id, true, item, '', '')
                    } else {
                        IDM.message.warning('请选择要跳转的子页面')
                    }
                    break
            }
        },
        /**
         * 组件通信：接收消息的方法
         * @param {
         *  type:"发送消息的时候定义的类型，这里可以自己用来要具体做什么，统一规定的type：linkageResult（组件联动传结果值）、linkageDemand（组件联动传需求值）、linkageReload（联动组件重新加载）
         * 、linkageOpenDialog（打开弹窗）、linkageCloseDialog（关闭弹窗）、linkageShowModule（显示组件）、linkageHideModule（隐藏组件）、linkageResetDefaultValue（重置默认值）"
         *  message:{发送的时候传输的消息对象数据}
         *  messageKey:"消息数据的key值，代表数据类型是什么，常用于表单交互上，比如通过这个key判断是什么数据"
         *  isAcross:如果为true则代表发送来源是其他页面的组件，默认为false
         * } object
         */
        receiveBroadcastMessage(messageObject) {
            switch (messageObject.type) {
                case 'pageResize':
                    this.pageWidth = messageObject.message.width
                    this.convertAttrToStyleObject()
                    break
                case 'linkageReload':
                    this.initData()
                    break
            }
            console.log('组件收到消息', messageObject)
        },
        /**
         * 组件通信：发送消息的方法
         * @param {
         *  type:"自己定义的，统一规定的type：linkageResult（组件联动传结果值）、linkageDemand（组件联动传需求值）、linkageReload（联动组件重新加载）
         * 、linkageOpenDialog（打开弹窗）、linkageCloseDialog（关闭弹窗）、linkageShowModule（显示组件）、linkageHideModule（隐藏组件）、linkageResetDefaultValue（重置默认值）",
         *  message:{实际的消息对象},
         *  rangeModule:"为空发送给全部，根据配置的属性中设定的值（值的内容是组件的packageid数组），不取子表的，比如直接 this.$root.propData.compositeAttr["attrKey"]（注意attrKey是属性中定义的bindKey）,这里的格式为：['1','2']"",
         *  className:"指定的组件类型，比如只给待办组件发送，然后再去过滤上面的值"
         *  globalSend:如果为true则全站发送消息，注意全站rangeModule是无效的，只有className才有效，默认为false
         * } object
         */
        sendBroadcastMessage(object) {
            window.IDM.broadcast && window.IDM.broadcast.send(object)
        },
        /**
         * 交互功能：设置组件的上下文内容值
         * @param {
         *  type:"定义的类型，已知类型：pageCommonInterface（页面统一接口返回值）、"
         *  key:"数据key标识，页面每个接口设置的数据集名称，方便识别获取自己需要的数据"
         *  data:"数据集，内容为：字符串 or 数组 or 对象"
         * }
         */
        setContextValue(object) {
            console.log('统一接口设置的值', object)
            if (object.type != 'pageCommonInterface') {
                return
            }
            //这里使用的是子表，所以要循环匹配所有子表的属性然后再去设置修改默认值
            if (object.key == this.propData.dataName) {
                // this.propData.fontContent = this.getExpressData(this.propData.dataName,this.propData.dataFiled,object.data);
                this.$set(
                    this.propData,
                    'bannerData',
                    this.getExpressData(this.propData.dataName, this.propData.dataFiled, object.data)
                )
            }
        }
    }
}
</script>

<style lang="scss">
.idm-banner-box {
    padding: 0;
    overflow: hidden;
    position: relative;
    &-swiper-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
    & &-swiper-item-container {
        width: 86%;
        height: 100%;
        margin: 0 auto;
        position: relative;
        top: 0;
        left: 0;
        overflow: hidden;
    }
    &-swiper-text {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        color: #fff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 4px 100px 4px 8px;
        background-color: rgba(0, 0, 0, 0.3);
        font-size: 14px;
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
        text-align: left;
    }
    &-mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        justify-content: center;
        align-items: center;
        span {
            padding: 6px 20px;
            color: #e6a23c;
            background: #fdf6ec;
            border: 1px solid #f5dab1;
            border-radius: 4px;
        }
    }
}

.swiper-slide {
    -webkit-transition: transform 0.5s;
    -moz-transition: transform 0.5s;
    -ms-transition: transform 0.5s;
    -o-transition: transform 0.5s;
    -webkit-transform: scale(1);
    transform: scale(0.9);
    position: relative;
}
.swiper-slide-active,
.swiper-slide-duplicate-active {
    -webkit-transform: scale(1);
    transform: scale(1);
}
.slider-img {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
}
.idm-banner-swiper-pagination {
    position: absolute;
    width: 100%;
    z-index: 9;
    display: flex;
    justify-content: center;
}
.idm-banner-my-bullet {
    width: 8px;
    height: 8px;
    display: inline-block;
    border-radius: 50%;
    background-color: #1d335e;
    margin: 0 5px;
}
.idm-banner-my-bullet-active {
    background-color: #fff !important;
}
</style>
<style lang="scss" scoped>
li {
    display: inline-block;
    float: left;
    img {
        width: 100%;
        height: 100%;
    }
}

.example-3d {
    width: 100%;
    height: 400px;
    padding-top: 50px;
    padding-bottom: 50px;
}

.swiper {
    height: 100%;
    width: 100%;

    .swiper-slide {
        width: 86%;
    }

    .swiper-pagination {
        ::v-deep(.swiper-pagination-bullet.swiper-pagination-bullet-active) {
            background-color: #fff;
        }
    }
}
</style>
