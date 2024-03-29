<template>
  <!--
    根目录规范(必须不能为空)：
    idm-ctrl：控件类型 drag_container：容器，drag_container_inlieblock：行内容器，idm_module：非容器的组件
    id：使用moduleObject.id，如果id不使用这个将会被idm-ctrl-id属性替换
    idm-ctrl-id：组件的id，这个必须不能为空
  -->
  <div
    class="i-all-comment-outer"
    idm-ctrl="idm_module"
    :id="moduleObject.id"
    :idm-ctrl-id="moduleObject.id"
    v-show="propData.defaultStatus != 'hidden'"
  >
    <!--
      组件内部容器
      增加class="drag_container" 必选
      idm-ctrl-id：组件的id，这个必须不能为空
      idm-container-index  组件的内部容器索引，不重复唯一且不变，必选
    -->
    <div class="i-all-comment-header">
      <div class="i-all-comment-header-left">
        <span class="header-left-title">{{ propData.title }}</span>
        <span v-if="curStatus" class="header-left-number">({{ total }})</span>
      </div>
      <div v-if="curStatus" class="i-all-comment-header-right">
        <div
          class="header-right-btn"
          :class="{ active: curMode === 'new' }"
          @click="modeToggle('new')"
        >
          最新
        </div>
        <div
          class="header-right-btn"
          :class="{ active: curMode === 'hot' }"
          @click="modeToggle('hot')"
        >
          最热
        </div>
      </div>
    </div>

    <div class="i-all-comment-content">
      <van-list
        v-model="loading"
        :finished="finished"
        :finished-text="finishedText"
        @load="initData"
      >
        <div
          class="i-all-comment-content-item"
          v-for="(item, i) in infoList"
          :key="i"
          :class="{ 'border-none': infoList.length - 1 === i }"
        >
          <div class="i-all-comment-content-left">
            <img v-if="item[propData.imgInterface]" :src="IDM.url.getWebPath(item[propData.imgInterface])" class="content-left-avatar">
            <img v-else src="../assets/default_avatar.png" class="content-left-avatar" />
          </div>
          <div class="i-all-comment-content-right">
            <div class="content-right-top">
              <span class="comment-name">{{ item[propData.avatarInterface] }}</span>
              <span class="comment-time">{{ item[propData.timeInterface] }}</span>
              <span
                class="comment-star"
                :class="{ active: item[propData.starInterface] }"
                @click="starClick(item)"
                ><svg-icon icon-class="commentStar" />{{ item[propData.starNumInterface] }}</span
              >
            </div>
            <p class="content-right-center">{{ item[propData.btInterface] }}</p>
            <div class="content-right-bottom">
              <span class="comment-from">{{ item[propData.fromInterface] }}</span>
              <span class="comment-total" @click="replyClick(item)"
                >共{{ item[propData.totalInterface] }}条回复<van-icon name="play"
              /></span>
              <span class="comment-del" @click="delClick(item)">删除</span>
            </div>
          </div>
        </div>
      </van-list>
      <div
        v-if="!curStatus && total > 3"
        class="i-all-comment-content-more"
        @click="statusToggle"
      >
        更多评论
      </div>
    </div>
    <div class="i-all-comment-mask" v-if="moduleObject.env !== 'production' && !propData.dataSource">
      <span>！未绑定数据源</span>
    </div>
  </div>
</template>

<script>
import { List, Icon } from "vant";
export default {
  name: "IAllComment",
  components: {
    [List.name]: List,
    [Icon.name]: Icon,
  },
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {
        title: "全部评论",
        emptyDescription: "暂无评论",
        finishedTip: "数据已加载全部",
        imgInterface:'img',
        idInterface:'id',
        avatarInterface:'avatar',
        timeInterface:'time',
        starInterface:'star',
        starNumInterface:'starNum',
        btInterface:'bt',
        fromInterface:'from',
        totalInterface:'total'
      },
      loading: false,
      finished: false,
      curMode: "new",
      infoList: [],
      curStatus: false,
      total: 0,
      pageSize: 5,
      start: 0,
    };
  },
  props: {},
  computed: {
    finishedText() {
      let text = "";
      if (!this.loading && this.infoList.length === 0) {
        text = this.propData.emptyDescription;
      } else {
        if (this.total <= 3) {
          text = this.propData.finishedTip;
        } else {
          text = this.curStatus ? this.propData.finishedTip : "";
        }
      }
      return text;
    },
  },
  created() {
    this.moduleObject = this.$root.moduleObject;
    this.convertAttrToStyleObject();
    this.convertThemeListAttrToStyleObject();
  },
  mounted() {},
  destroyed() {},
  methods: {
    /**
     * 删除
     */
    delClick(item){
      console.log(item,"删除")
    },
    /**
     * 回复跳转
     */
    replyClick(item) {
      if (this.propData.replyJump && this.propData.replyJump.id)
        IDM.router.push(
          this.moduleObject.routerId,
          this.propData.replyJump.id,
          {
            keep: true,
            params: { id: item.id },
            enterAnim: "",
            quitAnim: "",
          }
        );
    },
    /**
     * 点赞
     */
    starClick(item) {
      item.star = true;
    },
    /**
     * 重载组件
     */
    reload(whole) {
      if (whole) {
        this.curMode = "new";
        this.curStatus = false;
      }
      this.loading = true;
      this.finished = false;
      this.infoList = [];
      this.initData();
    },
    /**
     * 筛选条件切换
     */
    modeToggle(mode) {
      this.curMode = mode;
      this.reload();
    },
    /**
     * 组件状态切换
     */
    statusToggle() {
      this.curStatus = !this.curStatus;
      this.finished = false;
    },
    /**
     * 适配页面
     */
    getScale(pageWidth) {
      const base = this.propData.baseValue || 414;
      const ratio = this.propData.adaptationRatio || 1.2;
      const width =
        this.moduleObject.env === "production"
          ? window.innerWidth
          : pageWidth || 414;
      return (width / base - 1) * (ratio - 1) + 1;
    },
    /**
     * 提供父级组件调用的刷新prop数据组件
     */
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.convertAttrToStyleObject();
      this.convertThemeListAttrToStyleObject();
    },
    /**
     * 把属性转换成样式对象
     */
    convertAttrToStyleObject(pageSize = {}) {
      var styleObject = {},
        innerStyleObject = {},
        titleStyleObject = {};

      const scale = this.getScale(pageSize.width);
      styleObject["--i-all-comment-scale"] = scale;

      if (this.propData.bgSize && this.propData.bgSize == "custom") {
        styleObject["background-size"] =
          (this.propData.bgSizeWidth
            ? this.propData.bgSizeWidth.inputVal +
              this.propData.bgSizeWidth.selectVal
            : "auto") +
          " " +
          (this.propData.bgSizeHeight
            ? this.propData.bgSizeHeight.inputVal +
              this.propData.bgSizeHeight.selectVal
            : "auto");
      } else if (this.propData.bgSize) {
        styleObject["background-size"] = this.propData.bgSize;
      }
      if (this.propData.positionX && this.propData.positionX.inputVal) {
        styleObject["background-position-x"] =
          this.propData.positionX.inputVal + this.propData.positionX.selectVal;
      }
      if (this.propData.positionY && this.propData.positionY.inputVal) {
        styleObject["background-position-y"] =
          this.propData.positionY.inputVal + this.propData.positionY.selectVal;
      }

      if (this.propData.innerBgSize && this.propData.innerBgSize == "custom") {
        innerStyleObject["background-size"] =
          (this.propData.innerBgSizeWidth
            ? this.propData.innerBgSizeWidth.inputVal +
              this.propData.innerBgSizeWidth.selectVal
            : "auto") +
          " " +
          (this.propData.innerBgSizeHeight
            ? this.propData.innerBgSizeHeight.inputVal +
              this.propData.innerBgSizeHeight.selectVal
            : "auto");
      } else if (this.propData.innerBgSize) {
        innerStyleObject["background-size"] = this.propData.innerBgSize;
      }
      if (
        this.propData.innerPositionX &&
        this.propData.innerPositionX.inputVal
      ) {
        innerStyleObject["background-position-x"] =
          this.propData.innerPositionX.inputVal +
          this.propData.innerPositionX.selectVal;
      }
      if (
        this.propData.innerPositionY &&
        this.propData.innerPositionY.inputVal
      ) {
        innerStyleObject["background-position-y"] =
          this.propData.innerPositionY.inputVal +
          this.propData.innerPositionY.selectVal;
      }
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "width":
            case "height":
              styleObject[key] = element;
              break;
            case "innerWidth":
              innerStyleObject["width"] = element;
              break;
            case "innerHeight":
              innerStyleObject["height"] = element;
              break;
            case "bgColor":
              if (element && element.hex8) {
                styleObject["background-color"] = IDM.hex8ToRgbaString(
                  element.hex8
                );
              }
              break;
            case "innerBgColor":
              if (element && element.hex8) {
                innerStyleObject["background-color"] = IDM.hex8ToRgbaString(
                  element.hex8
                );
              }
              break;
            case "box":
              if (element.marginTopVal) {
                styleObject["margin-top"] = `${element.marginTopVal}`;
              }
              if (element.marginRightVal) {
                styleObject["margin-right"] = `${element.marginRightVal}`;
              }
              if (element.marginBottomVal) {
                styleObject["margin-bottom"] = `${element.marginBottomVal}`;
              }
              if (element.marginLeftVal) {
                styleObject["margin-left"] = `${element.marginLeftVal}`;
              }
              if (element.paddingTopVal) {
                styleObject["padding-top"] = `${element.paddingTopVal}`;
              }
              if (element.paddingRightVal) {
                styleObject["padding-right"] = `${element.paddingRightVal}`;
              }
              if (element.paddingBottomVal) {
                styleObject["padding-bottom"] = `${element.paddingBottomVal}`;
              }
              if (element.paddingLeftVal) {
                styleObject["padding-left"] = `${element.paddingLeftVal}`;
              }
              break;
            case "innerBox":
              if (element.marginTopVal) {
                innerStyleObject["margin-top"] = `${element.marginTopVal}`;
              }
              if (element.marginRightVal) {
                innerStyleObject["margin-right"] = `${element.marginRightVal}`;
              }
              if (element.marginBottomVal) {
                innerStyleObject[
                  "margin-bottom"
                ] = `${element.marginBottomVal}`;
              }
              if (element.marginLeftVal) {
                innerStyleObject["margin-left"] = `${element.marginLeftVal}`;
              }
              if (element.paddingTopVal) {
                innerStyleObject["padding-top"] = `${element.paddingTopVal}`;
              }
              if (element.paddingRightVal) {
                innerStyleObject[
                  "padding-right"
                ] = `${element.paddingRightVal}`;
              }
              if (element.paddingBottomVal) {
                innerStyleObject[
                  "padding-bottom"
                ] = `${element.paddingBottomVal}`;
              }
              if (element.paddingLeftVal) {
                innerStyleObject["padding-left"] = `${element.paddingLeftVal}`;
              }
              break;
            case "bgImgUrl":
              styleObject[
                "background-image"
              ] = `url(${window.IDM.url.getWebPath(element)})`;
              break;
            case "innerBgImgUrl":
              innerStyleObject[
                "background-image"
              ] = `url(${window.IDM.url.getWebPath(element)})`;
              break;
            case "positionX":
              //背景横向偏移

              break;
            case "positionY":
              //背景纵向偏移

              break;
            case "bgRepeat":
              //平铺模式
              styleObject["background-repeat"] = element;
              break;
            case "innerBgRepeat":
              //平铺模式
              innerStyleObject["background-repeat"] = element;
              break;
            case "bgAttachment":
              //背景模式
              styleObject["background-attachment"] = element;
              break;
            case "innerBgAttachment":
              //背景模式
              innerStyleObject["background-attachment"] = element;
              break;
            case "border":
              if (element.border.top.width > 0) {
                styleObject["border-top-width"] =
                  element.border.top.width + element.border.top.widthUnit;
                styleObject["border-top-style"] = element.border.top.style;
                if (element.border.top.colors.hex8) {
                  styleObject["border-top-color"] = IDM.hex8ToRgbaString(
                    element.border.top.colors.hex8
                  );
                }
              }
              if (element.border.right.width > 0) {
                styleObject["border-right-width"] =
                  element.border.right.width + element.border.right.widthUnit;
                styleObject["border-right-style"] = element.border.right.style;
                if (element.border.right.colors.hex8) {
                  styleObject["border-right-color"] = IDM.hex8ToRgbaString(
                    element.border.right.colors.hex8
                  );
                }
              }
              if (element.border.bottom.width > 0) {
                styleObject["border-bottom-width"] =
                  element.border.bottom.width + element.border.bottom.widthUnit;
                styleObject["border-bottom-style"] =
                  element.border.bottom.style;
                if (element.border.bottom.colors.hex8) {
                  styleObject["border-bottom-color"] = IDM.hex8ToRgbaString(
                    element.border.bottom.colors.hex8
                  );
                }
              }
              if (element.border.left.width > 0) {
                styleObject["border-left-width"] =
                  element.border.left.width + element.border.left.widthUnit;
                styleObject["border-left-style"] = element.border.left.style;
                if (element.border.left.colors.hex8) {
                  styleObject["border-left-color"] = IDM.hex8ToRgbaString(
                    element.border.left.colors.hex8
                  );
                }
              }

              styleObject["border-top-left-radius"] =
                element.radius.leftTop.radius +
                element.radius.leftTop.radiusUnit;
              styleObject["border-top-right-radius"] =
                element.radius.rightTop.radius +
                element.radius.rightTop.radiusUnit;
              styleObject["border-bottom-left-radius"] =
                element.radius.leftBottom.radius +
                element.radius.leftBottom.radiusUnit;
              styleObject["border-bottom-right-radius"] =
                element.radius.rightBottom.radius +
                element.radius.rightBottom.radiusUnit;
              break;
            case "innerBorder":
              if (element.border.top.width > 0) {
                innerStyleObject["border-top-width"] =
                  element.border.top.width + element.border.top.widthUnit;
                innerStyleObject["border-top-style"] = element.border.top.style;
                if (element.border.top.colors.hex8) {
                  innerStyleObject["border-top-color"] = IDM.hex8ToRgbaString(
                    element.border.top.colors.hex8
                  );
                }
              }
              if (element.border.right.width > 0) {
                innerStyleObject["border-right-width"] =
                  element.border.right.width + element.border.right.widthUnit;
                innerStyleObject["border-right-style"] =
                  element.border.right.style;
                if (element.border.right.colors.hex8) {
                  innerStyleObject["border-right-color"] = IDM.hex8ToRgbaString(
                    element.border.right.colors.hex8
                  );
                }
              }
              if (element.border.bottom.width > 0) {
                innerStyleObject["border-bottom-width"] =
                  element.border.bottom.width + element.border.bottom.widthUnit;
                innerStyleObject["border-bottom-style"] =
                  element.border.bottom.style;
                if (element.border.bottom.colors.hex8) {
                  innerStyleObject["border-bottom-color"] =
                    IDM.hex8ToRgbaString(element.border.bottom.colors.hex8);
                }
              }
              if (element.border.left.width > 0) {
                innerStyleObject["border-left-width"] =
                  element.border.left.width + element.border.left.widthUnit;
                innerStyleObject["border-left-style"] =
                  element.border.left.style;
                if (element.border.left.colors.hex8) {
                  innerStyleObject["border-left-color"] = IDM.hex8ToRgbaString(
                    element.border.left.colors.hex8
                  );
                }
              }

              innerStyleObject["border-top-left-radius"] =
                element.radius.leftTop.radius +
                element.radius.leftTop.radiusUnit;
              innerStyleObject["border-top-right-radius"] =
                element.radius.rightTop.radius +
                element.radius.rightTop.radiusUnit;
              innerStyleObject["border-bottom-left-radius"] =
                element.radius.leftBottom.radius +
                element.radius.leftBottom.radiusUnit;
              innerStyleObject["border-bottom-right-radius"] =
                element.radius.rightBottom.radius +
                element.radius.rightBottom.radiusUnit;
              break;
            case "font":
              titleStyleObject["font-family"] = element.fontFamily;
              if (element.fontColors.hex8) {
                titleStyleObject["color"] = IDM.hex8ToRgbaString(
                  element.fontColors.hex8
                );
              }
              titleStyleObject["font-weight"] =
                element.fontWeight && element.fontWeight.split(" ")[0];
              titleStyleObject["font-style"] = element.fontStyle;
              titleStyleObject["font-size"] =
                element.fontSize + element.fontSizeUnit;
              titleStyleObject["line-height"] =
                element.fontLineHeight +
                (element.fontLineHeightUnit == "-"
                  ? ""
                  : element.fontLineHeightUnit);
              titleStyleObject["text-align"] = element.fontTextAlign;
              titleStyleObject["text-decoration"] = element.fontDecoration;
              break;
            case "innerFont":
              innerStyleObject["font-family"] = element.fontFamily;
              if (element.fontColors.hex8) {
                innerStyleObject["color"] = IDM.hex8ToRgbaString(
                  element.fontColors.hex8
                );
              }
              innerStyleObject["font-weight"] =
                element.fontWeight && element.fontWeight.split(" ")[0];
              innerStyleObject["font-style"] = element.fontStyle;
              innerStyleObject["font-size"] =
                element.fontSize + element.fontSizeUnit;
              innerStyleObject["line-height"] =
                element.fontLineHeight +
                (element.fontLineHeightUnit == "-"
                  ? ""
                  : element.fontLineHeightUnit);
              innerStyleObject["text-align"] = element.fontTextAlign;
              innerStyleObject["text-decoration"] = element.fontDecoration;
              break;
            case "boxShadow":
              styleObject["box-shadow"] = element;
              break;
            case "innerBoxShadow":
              innerStyleObject["box-shadow"] = element;
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id, styleObject);
      window.IDM.setStyleToPageHead(
        this.moduleObject.id +
          ` .i-all-comment-header .i-all-comment-header-left`,
        titleStyleObject
      );
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + ` .i-all-comment-content`,
        innerStyleObject
      );
    },
    /**
     * 主题颜色
     */
    convertThemeListAttrToStyleObject() {
      const themeList = this.propData.themeList;
      if (!themeList) {
        return;
      }
      const themeNamePrefix =
        IDM.setting &&
        IDM.setting.applications &&
        IDM.setting.applications.themeNamePrefix
          ? IDM.setting.applications.themeNamePrefix
          : "idm-theme-";
      for (var i = 0; i < themeList.length; i++) {
        var item = themeList[i];

        IDM.setStyleToPageHead(
          "." +
            themeNamePrefix +
            item.key +
            " #" +
            (this.moduleObject.packageid || "module_demo") +
            " .i-all-comment-header .i-all-comment-header-right",
          {
            "border-color": item.mainColor
              ? IDM.hex8ToRgbaString(item.mainColor.hex8)
              : "",
          }
        );

        IDM.setStyleToPageHead(
          "." +
            themeNamePrefix +
            item.key +
            " #" +
            (this.moduleObject.packageid || "module_demo") +
            " .i-all-comment-header .header-right-btn",
          {
            color: item.mainColor
              ? IDM.hex8ToRgbaString(item.mainColor.hex8)
              : "",
          }
        );
        IDM.setStyleToPageHead(
          "." +
            themeNamePrefix +
            item.key +
            " #" +
            (this.moduleObject.packageid || "module_demo") +
            " .i-all-comment-header .header-right-btn.active",
          {
            "background-color": item.mainColor
              ? IDM.hex8ToRgbaString(item.mainColor.hex8)
              : "",
            color: "#fff",
          }
        );

        IDM.setStyleToPageHead(
          "." +
            themeNamePrefix +
            item.key +
            " #" +
            (this.moduleObject.packageid || "module_demo") +
            " .i-all-comment-content .i-all-comment-content-item .comment-star.active",
          {
            color: item.mainColor
              ? IDM.hex8ToRgbaString(item.mainColor.hex8)
              : "",
          }
        );

        IDM.setStyleToPageHead(
          "." +
            themeNamePrefix +
            item.key +
            " #" +
            (this.moduleObject.packageid || "module_demo") +
            " .i-all-comment-content-item .i-all-comment-content-right .content-right-bottom",
          {
            color: item.mainColor
              ? IDM.hex8ToRgbaString(item.mainColor.hex8)
              : "",
          }
        );
      }
    },
    /**
     * 通用的url参数对象
     * 所有地址的url参数转换
     */
    commonParam() {
      let urlObject = IDM.url.queryObject();
      var params = {
        pageId:
          window.IDM.broadcast && window.IDM.broadcast.pageModule
            ? window.IDM.broadcast.pageModule.id
            : "",
        urlData: JSON.stringify(urlObject),
      };
      return params;
    },
    /**
     * 加载动态数据
     */
    initData() {
      if (!this.moduleObject.env || this.moduleObject.env == "develop") {
        // mock数据
        setTimeout(() => {
          const res = {
            total: 10,
            list: [
              {
                img: "",
                id: "",
                avatar: "Wunder",
                time: "6分钟前",
                star: true,
                starNum: 100,
                bt: "我认为二级市场真正的问题在于拍卖行。在艺术家的推广上，拍卖行真的和画廊格格不入。",
                from: "来自广东深圳",
                total: 100,
              },
              {
                img: "",
                id: "",
                avatar: "The Shy",
                time: "6分钟前",
                star: false,
                starNum: 100,
                bt: "我认为二级市场真正的问题在于拍卖行。在艺术家的推广上，拍卖行真的和画廊格格不入。",
                from: "来自广东深圳",
                total: 100,
              },
              {
                img: "",
                id: "",
                avatar: "Wunder",
                time: "6分钟前",
                star: false,
                starNum: 100,
                bt: "我认为二级市场真正的问题在于拍卖行。在艺术家的推广上，拍卖行真的和画廊格格不入。",
                from: "来自广东深圳",
                total: 100,
              },
              {
                img: "",
                id: "",
                avatar: "The Shy",
                time: "6分钟前",
                star: true,
                starNum: 100,
                bt: "我认为二级市场真正的问题在于拍卖行。在艺术家的推广上，拍卖行真的和画廊格格不入。",
                from: "来自广东深圳",
                total: 100,
              },
              {
                img: "",
                id: "",
                avatar: "Wunder",
                time: "6分钟前",
                star: false,
                starNum: 100,
                bt: "我认为二级市场真正的问题在于拍卖行。在艺术家的推广上，拍卖行真的和画廊格格不入。",
                from: "来自广东深圳",
                total: 100,
              },
            ],
          };
          // 简单模式下只展示三条
          if (!this.curStatus) {
            this.finished = true;
            this.infoList = res.list.slice(0, 3);
          } else {
            if (this.infoList.length >= res.total) {
              this.finished = true;
            }
            this.infoList = [...this.infoList, ...res.list];
          }
          this.total = res.total;
          this.loading = false;
        }, 500);

        return;
      }
      let dataSource = this.propData.dataSource;
      if (!dataSource) {
        this.loading = false;
        return;
      }
      let url = `ctrl/dataSource/getDatas`;
      IDM.http
        .post(
          url,
          {
            id: dataSource.value,
            pageSize: this.pageSize,
            start: this.start,
          },
          {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
          }
        )
        .done((res) => {
          console.log(res, "接口数据");
          if (res.code === "200") {
            this.infoList = this.propData.dataFiled
              ? this.getExpressData("dataName", this.propData.dataFiled, res)
              : res;
          } else {
            console.log(url + "请求失败");
          }
        })
        .error((response) => {
          console.log(url + "请求失败");
        })
        .always((res) => {
          this.loading = false;
        });
    },
    /**
     * 通用的获取表达式匹配后的结果
     */
    getExpressData(dataName, dataFiled, resultData) {
      //给defaultValue设置dataFiled的值
      var _defaultVal = undefined;
      if (dataFiled) {
        var filedExp = dataFiled;
        filedExp = dataName + (filedExp.startsWiths("[") ? "" : ".") + filedExp;
        var dataObject = { IDM: window.IDM };
        dataObject[dataName] = resultData;
        _defaultVal = window.IDM.express.replace.call(
          this,
          "@[" + filedExp + "]",
          dataObject
        );
      }
      //对结果进行再次函数自定义
      if (
        this.propData.customFunction &&
        this.propData.customFunction.length > 0
      ) {
        var params = this.commonParam();
        var resValue = "";
        try {
          resValue =
            window[this.propData.customFunction[0].name] &&
            window[this.propData.customFunction[0].name].call(this, {
              ...params,
              ...this.propData.customFunction[0].param,
              moduleObject: this.moduleObject,
              expressData: _defaultVal,
              interfaceData: resultData,
            });
        } catch (error) {}
        _defaultVal = resValue;
      }

      return _defaultVal;
    },
    showThisModuleHandle() {
      this.propData.defaultStatus = "default";
    },
    hideThisModuleHandle() {
      this.propData.defaultStatus = "hidden";
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
      console.log("组件收到消息", messageObject);
      switch (messageObject.type) {
        case "websocket":
          if (this.propData.messageRefreshKey && messageObject.message) {
            const messageData =
              (typeof messageObject.message === "string" &&
                JSON.parse(messageObject.message)) ||
              messageObject.message;
            const arr = Array.isArray(this.propData.messageRefreshKey)
              ? this.propData.messageRefreshKey
              : [this.propData.messageRefreshKey];
            if (messageData.badgeType && arr.includes(messageData.badgeType)) {
              this.reload();
            }
          }
          break;
        case "linkageReload":
          this.reload(true);
          break;
        case "pageResize":
          this.convertAttrToStyleObject(messageObject.message);
          break;
      }
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
      window.IDM.broadcast && window.IDM.broadcast.send(object);
    },
  },
};
</script>

<style lang="scss" scoped>
$scale: var(--i-all-comment-scale);

.i-all-comment-outer {
  position: relative;
  padding: calc(10px * #{$scale});
  color: #000;
  font-size: calc(14px * #{$scale});

  .i-all-comment-header {
    display: flex;
    justify-content: space-between;
    padding: calc(10px * #{$scale}) 0;
    align-items: center;

    .i-all-comment-header-left {
      font-size: calc(16px * #{$scale});
      padding-left: calc(6px * #{$scale});

      .header-left-number {
        margin-left: calc(8px * #{$scale});
      }
    }

    .i-all-comment-header-right {
      display: flex;
      border: 1px solid rgb(193, 0, 0);
      font-size: calc(12px * #{$scale});
      border-radius: calc(2px * #{$scale});
      height: calc(20px * #{$scale});

      .header-right-btn {
        cursor: pointer;
        padding: calc(1px * #{$scale}) calc(10px * #{$scale});
        color: rgb(193, 0, 0);

        &.active {
          color: #fff;
          background-color: rgb(193, 0, 0);
        }
      }
    }
  }

  .i-all-comment-content {
    background-color: #fff;
    box-shadow: 0 calc(2px * #{$scale}) calc(12px * #{$scale}) 0
      rgba(0, 0, 0, 0.07);
    border-radius: calc(6px * #{$scale});

    .i-all-comment-content-item {
      display: flex;
      border-bottom: 1px solid rgb(222, 222, 222);
      padding: calc(16px * #{$scale});

      &.border-none {
        border-bottom: none;
      }

      .i-all-comment-content-left {
        width: calc(38px * #{$scale});
        min-width: calc(38px * #{$scale});
        .content-left-avatar {
          width: 100%;
          height: calc(38px * #{$scale});
          border-radius: 50%;
        }
      }

      .i-all-comment-content-right {
        padding: 0 calc(8px * #{$scale});
        flex: 1;

        .content-right-top {
          padding: calc(10px * #{$scale}) 0 calc(6px * #{$scale}) 0;
          display: flex;
          color: rgb(146, 146, 146);

          .comment-name {
            color: rgb(101, 101, 101);
          }

          .comment-time {
            flex: 1;
            padding-left: calc(8px * #{$scale});
          }

          .comment-star {
            cursor: pointer;
            &.active {
              color: rgb(193, 0, 0);
            }

            .svg-icon {
              margin-right: calc(4px * #{$scale});
            }
          }
        }

        .content-right-center {
          color: currentColor;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          margin: 0 0 calc(8px * #{$scale}) 0;
        }

        .content-right-bottom {
          display: flex;
          justify-content: space-between;
          color: rgb(193, 0, 0);

          .comment-from {
            color: rgb(146, 146, 146);
          }

          .comment-total {
            cursor: pointer;

            .van-icon {
              transform: rotate(90deg);
              margin-left: calc(4px * #{$scale});
            }
          }

          .comment-del {
            cursor: pointer;
          }
        }
      }
    }

    .i-all-comment-content-more {
      color: rgb(102, 102, 102);
      text-align: center;
      padding-bottom: calc(10px * #{$scale});
    }
  }

  .i-all-comment-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background: rgba(0,0,0,.3);
    display: flex;
    justify-content: center;
    align-items: center;
    span {
      padding: calc(6px * #{ $scale }) calc(20px * #{ $scale });;
      color: #e6a23c;
      background: #fdf6ec;
      border:calc(1px * #{ $scale }) solid #f5dab1;
      border-radius: calc(4px * #{ $scale });;
    }
  }
}
</style>
