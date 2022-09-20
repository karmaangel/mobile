<template>
  <!--
    根目录规范(必须不能为空)：
    idm-ctrl：控件类型 drag_container：容器，drag_container_inlieblock：行内容器，idm_module：非容器的组件
    id：使用moduleObject.id，如果id不使用这个将会被idm-ctrl-id属性替换
    idm-ctrl-id：组件的id，这个必须不能为空
  -->
  <div idm-ctrl="idm_module"
       :id="moduleObject.id"
       :idm-ctrl-id="moduleObject.id"
  >


    <div class="i-comment-publish-content">
      <van-field v-model="value" placeholder="写评论" left-icon="edit">
        <template #button>
          <van-button>发表</van-button>
        </template>
      </van-field>
    </div>

  </div>
</template>

<script>
export default {
  name: "ICommentPublish",
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {}
    }
  },
  created() {
    this.moduleObject = this.$root.moduleObject
  },
  mounted() {
  },
  destroyed() {
  },
  methods: {
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
    }
  }
}
</script>

<style lang="scss" scoped>


.i-comment-publish-content {
  height: 80px;
  background: #ffffff;
  box-shadow: 0px -2px 3px 0px rgba(204, 204, 204, 0.5);
  display: flex;

  ::v-deep .van-cell {
    height: 60px;
    background-color: transparent;

    .van-field__left-icon {
      background: #f2f2f2;
      margin-right: 0;
      display: flex;
      align-items: center;
      padding: 0 10px;
      color: rgb(51, 51, 51);
      border-radius: 4px 0 0 4px;
    }

    .van-field__body {
      height: 100%;

      .van-field__control {
        height: 100%;
        background: #f2f2f2;
        border-radius: 0 4px 4px 0;
      }
    }

    .van-button {
      border: none;
      font-size: 16px;
      padding: 0 6px;
      color: rgb(193, 0, 0);
    }
  }
}

</style>