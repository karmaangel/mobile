# 待办列表

这里用来描述组件的具体作用说明，描述内容建议简明扼要。

## 组件类名（className）

idm.component.mobile.itodolist

## 组件类 ID（classId）

idm.componet.basics.text

## 组件开发语言（comLangue）

vue

## 组件类型（comType）

common

## 所在代码包版本

basics@1.0.0

## 组件属性

### 唯一标识【ctrlId】

### 基本属性

#### 文本内容【fontContent】

#### title【htmlTitle】

#### 默认状态【defaultStatus】

### 样式设置

#### 内外边距【box】

#### 宽高

##### 宽【width】

##### 高【height】

#### 背景设置

##### 背景色【bgColor】

##### 背景图片【bgImgUrl】

##### 横向偏移【positionX】

##### 纵向偏移【positionY】

##### 背景大小【bgSize】

##### 宽度【bgSizeWidth】

##### 高度【bgSizeHeight】

##### 平铺模式【bgRepeat】

##### 背景模式【bgAttachment】

#### 边框【border】

#### 文字【font】

### 高级

#### 点击时动作【clickFunction】

#### 动态内容【dataSourceType】

#### 接口地址【customInterfaceUrl】

#### 结果集名【dataName】

#### 显示字段【dataFiled】

#### 自定义函数【customFunction】

##### 接口返回数据格式

```js
{
    code: 200,
    data: {
        value: [
            {
                jumpUrl: '',
                readStatus: '0',
                moduleName: '党费缴纳',
                title: '您已经连续两个月没有交党费了，您已经连续两个月没有交党费了，您已经连续两个月没有交党费了。请尽快缴纳党费，请尽快缴纳党费，请尽快缴纳党费，重要的事说三遍'
            },
            {
                jumpUrl: '',
                moduleName: '组织生活',
                readStatus: '1',
                title: '您已经连续两个月没有参加活动了'
            }
        ],
        count: 2,
        moreUrl: ''
    },
    message: 'success'
}
```
