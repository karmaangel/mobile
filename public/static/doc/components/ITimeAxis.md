## 时间轴数据源格式为两种

### 第一种为嵌套格式

```json
{
  "code": "200",
  "type": "success",
  "message": "操作成功",
  "metadata": null,
  "token": "",
  "data": [
    {
        "label": "2021", // 时间
        "children": [ // 子集
          {
            "label": "11-3",// 时间
            "title": "参加了《12》参加了《12》参加了《12》", // 标题
            "desc": "2021-12-11 12:33:33", // 描述
            "icon": "/resource/idm/img/14.png", // 图标
            "iconText": "组织生活" // 图标描述
          },
          {
            "label": "12-2",
            "title": "参加了《12》",
            "desc": "2021-12-11 12:33:33",
            "icon": "/resource/idm/img/14.png",
            "iconText": "组织生活"
          }
        ]
      }
  ]
}
```

### 第二种为单层格式

```json
{
  "code": "200",
  "type": "success",
  "message": "操作成功",
  "metadata": null,
  "token": "",
  "data": [
      {
        label: "1937年7月7日", // 日期
        title: "日本帝国主义者以制争",// 标题
        desc: "1937年7月7日 日本帝国主义者。",// 描述
      },
      {
        label: "1937年7月7日",
        title:
          "日本帝国主义者以制造卢沟桥事变为七点，发动全面侵华战争",
        desc: "1937年7月7日 日本帝国主义者以制造卢沟桥事变为七点，发动全面侵华战争。", 
      }
  ]
}
```
