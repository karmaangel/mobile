<template>
    <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" :title="propData.htmlTitle">
        <ICommonListContainer
            :moduleObject="moduleObject"
            :ref="'listContainerRef-' + moduleObject.id"
            :propData="propData"
            :pageData="pageData"
            :isFirst="isFirst"
            :isLoading="isLoading"
            @handleClickMore="handleClickMore"
        >
            <!-- 列表内容 -->
            <template #list>
                <div
                    v-for="(item, index) in pageData.value"
                    :key="index"
                    class="box-line"
                    :class="[getReadStatus(item) ? 'has-read-text' : 'no-read-text']"
                    @click="handleItemClick(item)"
                >
                    <div class="text-o-e-2">
                        <span
                            class="module-name"
                            v-if="getDataField(propData.moduleField, item)"
                            :style="getModuleStyle(item)"
                            >[{{ getDataField(propData.moduleField, item) }}]</span
                        >{{ getDataField(propData.titleField, item) }}
                    </div>
                </div>
            </template>
        </ICommonListContainer>
    </div>
</template>
<script>
import ICommonListContainer from '../commonComponents/ICommonListContainer'
import commonListMixin from '../mixins/commonList'
import adaptationScreenMixin from '../mixins/adaptationScreen'
import { todoData } from '../mock/mockData'
export default {
    name: 'ITodoList',
    components: {
        ICommonListContainer
    },
    mixins: [adaptationScreenMixin, commonListMixin],
    data() {
        return {
            moduleObject: {},
            propData: this.$root.propData.compositeAttr || {},
            pageData: { value: [], count: 0, moreUrl: '' }
        }
    },
    created() {
        this.moduleObject = this.$root.moduleObject
        this.convertAttrToStyleObject()
        this.convertThemeListAttrToStyleObject()
    },
    methods: {
        getReadStatus(item) {
            let result = false
            switch (this.propData.hasReadJudge) {
                case 'express':
                    result = IDM.express.replace(`@[${this.propData.hasReadExpress}]`, item)
                    break
                case 'customFunction':
                    if (this.propData.readFunction && this.propData.readFunction.length > 0) {
                        var params = this.commonParam()
                        try {
                            result =
                                window[this.propData.readFunction[0].name] &&
                                window[this.propData.readFunction[0].name].call(this, {
                                    ...params,
                                    ...this.propData.customFunction[0].param,
                                    ...this,
                                    ...item
                                })
                        } catch (error) {}
                    }
            }
            return result
        },
        //
        getModuleStyle(item) {
            if (Array.isArray(this.propData.moduleStyleList) && this.propData.moduleStyleList.length > 0) {
                const currentMoudle = this.propData.moduleStyleList.find((el) => el.moduleName === item.moduleName),
                    styleObj = {}
                if (currentMoudle && currentMoudle.moduleFont) {
                    IDM.style.setFontStyle(styleObj, currentMoudle.moduleFont)
                    return styleObj
                }
            }
            return {}
        },
        propDataWatchHandle(propData) {
            this.propData = propData.compositeAttr || {}
            this.convertAttrToStyleObject()
            this.convertThemeListAttrToStyleObject()
        },

        convertAttrToStyleObject() {
            var boxLineStyleObj = {},
                clampObj = {},
                hasReadFontStyleObj = {},
                noReadFontStyleObj = {}
            for (const key in this.propData) {
                if (this.propData.hasOwnProperty.call(this.propData, key)) {
                    const element = this.propData[key]
                    if (!element && element !== false && element != 0) {
                        continue
                    }
                    switch (key) {
                        // 字体设置
                        case 'messageFontStyle':
                            IDM.style.setFontStyle(noReadFontStyleObj, element)
                            this.adaptiveFontSize(noReadFontStyleObj, element)
                            break
                        case 'hasReadFontStyle':
                            IDM.style.setFontStyle(hasReadFontStyleObj, element)
                            this.adaptiveFontSize(hasReadFontStyleObj, element)
                            break
                        case 'lineBox':
                            IDM.style.setBoxStyle(boxLineStyleObj, element)
                            break
                        case 'lineBorder':
                            IDM.style.setBorderStyle(boxLineStyleObj, element)
                            break
                        case 'lineTitleClamp':
                            clampObj['-webkit-line-clamp'] = element
                            clampObj['line-clamp'] = element
                            break
                    }
                }
            }
            window.IDM.setStyleToPageHead(this.moduleObject.id + ' .box-line', boxLineStyleObj)
            window.IDM.setStyleToPageHead(this.moduleObject.id + ' .has-read-text', hasReadFontStyleObj)
            window.IDM.setStyleToPageHead(this.moduleObject.id + ' .no-read-text', noReadFontStyleObj)
            window.IDM.setStyleToPageHead(this.moduleObject.id + ' .text-o-e-2', clampObj)
            this.$nextTick(() => {
                this.$refs['listContainerRef-' + this.moduleObject.id].convertAttrToStyleObject()
            })
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
            // const themeNamePrefix =
            //     IDM.setting && IDM.setting.applications && IDM.setting.applications.themeNamePrefix
            //         ? IDM.setting.applications.themeNamePrefix
            //         : 'idm-theme-'
            // for (var i = 0; i < themeList.length; i++) {
            //     var item = themeList[i]
            //     let moduleColorObj = {
            //         'font-size': item.mainColor ? IDM.hex8ToRgbaString(item.mainColor.hex8) : ''
            //     }
            //     IDM.setStyleToPageHead(
            //         '.' +
            //             themeNamePrefix +
            //             item.key +
            //             (` #${this.moduleObject.id}-common-list` || 'module_demo') +
            //             ' .module-name',
            //         moduleColorObj
            //     )
            // }
            // 通用样式
            this.$nextTick(() => {
                this.$refs['listContainerRef-' + this.moduleObject.id].convertThemeListAttrToStyleObject()
            })
        },
        reload() {
            //请求数据源
            this.initData()
        },

        initData() {
            if (this.moduleObject.env === 'develop') {
                this.pageData = todoData
                return
            }
            this.isFirst = false
            this.isLoading = true
            this.getDataSourceData()
        },
        setContextValue(object) {
            console.log('统一接口设置的值', object)
            if (object.type != 'pageCommonInterface') {
                return
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.box-line:last-child {
    border-bottom: 0 !important;
}
.module-name{
    margin: 0 5px 0 0;
}
</style>
