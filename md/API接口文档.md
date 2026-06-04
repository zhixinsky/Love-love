# 恋爱日记APP API接口文档 V1.0

## 一、基础规范

### API基础地址

```text
https://api.xxx.com
```

### 请求格式

```text
Content-Type: application/json
Authorization: Bearer {token}
```

### 返回格式

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

### 错误码

| code | 说明    |
| ---- | ----- |
| 0    | 成功    |
| 400  | 参数错误  |
| 401  | 未登录   |
| 403  | 无权限   |
| 404  | 数据不存在 |
| 500  | 系统错误  |

---

# 二、用户与登录模块

## 1. 手机号验证码登录

### POST /api/auth/login/mobile

请求参数：

```json
{
  "mobile": "13800138000",
  "code": "123456"
}
```

返回：

```json
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "nickname": "小鹿",
    "avatar": "",
    "gender": 2,
    "loveStatus": 0
  }
}
```

---

## 2. 微信小程序登录

### POST /api/auth/login/wechat

请求参数：

```json
{
  "code": "wx_login_code",
  "nickname": "小鹿",
  "avatar": "https://xxx.com/avatar.png"
}
```

返回：

```json
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "nickname": "小鹿",
    "avatar": "https://xxx.com/avatar.png"
  }
}
```

---

## 3. 获取当前用户信息

### GET /api/user/profile

返回：

```json
{
  "id": 1,
  "nickname": "小鹿",
  "avatar": "",
  "gender": 2,
  "birthday": "2000-01-01",
  "city": "广州",
  "bio": "喜欢记录生活",
  "loveStatus": 1,
  "isVerified": 0
}
```

---

## 4. 修改用户资料

### PUT /api/user/profile

请求参数：

```json
{
  "nickname": "小鹿",
  "avatar": "https://xxx.com/avatar.png",
  "gender": 2,
  "birthday": "2000-01-01",
  "city": "广州",
  "bio": "记录爱情的人"
}
```

返回：

```json
{
  "success": true
}
```

---

# 三、情侣绑定模块

## 1. 生成情侣邀请码

### POST /api/couple/invite

请求参数：

```json
{
  "loveStartDate": "2025-05-20"
}
```

返回：

```json
{
  "inviteCode": "LOVE520",
  "expireTime": "2026-06-05 12:00:00"
}
```

---

## 2. 输入邀请码绑定

### POST /api/couple/bind

请求参数：

```json
{
  "inviteCode": "LOVE520"
}
```

返回：

```json
{
  "coupleId": 1,
  "partner": {
    "id": 2,
    "nickname": "小熊",
    "avatar": ""
  },
  "loveStartDate": "2025-05-20"
}
```

---

## 3. 获取情侣关系

### GET /api/couple/info

返回：

```json
{
  "coupleId": 1,
  "loveStartDate": "2025-05-20",
  "loveDays": 381,
  "partner": {
    "id": 2,
    "nickname": "小熊",
    "avatar": ""
  },
  "status": 1
}
```

---

## 4. 解除情侣绑定

### POST /api/couple/unbind

请求参数：

```json
{
  "reason": "和平解除"
}
```

返回：

```json
{
  "success": true
}
```

---

# 四、日记模块

## 1. 发布日记

### POST /api/diary

请求参数：

```json
{
  "title": "今天很开心",
  "content": "今天一起去吃火锅了。",
  "mood": "开心",
  "weather": "晴",
  "location": "广州",
  "visibility": 2,
  "mediaList": [
    {
      "mediaType": 1,
      "url": "https://xxx.com/1.jpg",
      "sort": 1
    }
  ]
}
```

visibility：

| 值 | 说明    |
| - | ----- |
| 1 | 仅自己可见 |
| 2 | 情侣可见  |
| 3 | 公开广场  |

返回：

```json
{
  "diaryId": 1001
}
```

---

## 2. 日记列表

### GET /api/diary/list

查询参数：

```text
page=1&pageSize=20&visibility=1
```

返回：

```json
{
  "list": [
    {
      "id": 1001,
      "title": "今天很开心",
      "content": "今天一起去吃火锅了。",
      "mood": "开心",
      "visibility": 2,
      "mediaList": [],
      "createdAt": "2026-06-04 10:00:00"
    }
  ],
  "total": 1
}
```

---

## 3. 日记详情

### GET /api/diary/{id}

返回：

```json
{
  "id": 1001,
  "title": "今天很开心",
  "content": "今天一起去吃火锅了。",
  "mood": "开心",
  "weather": "晴",
  "location": "广州",
  "visibility": 2,
  "mediaList": [],
  "author": {
    "id": 1,
    "nickname": "小鹿",
    "avatar": ""
  },
  "createdAt": "2026-06-04 10:00:00"
}
```

---

## 4. 修改日记

### PUT /api/diary/{id}

请求参数：

```json
{
  "title": "修改后的标题",
  "content": "修改后的内容",
  "mood": "平静",
  "visibility": 1,
  "mediaList": []
}
```

返回：

```json
{
  "success": true
}
```

---

## 5. 删除日记

### DELETE /api/diary/{id}

返回：

```json
{
  "success": true
}
```

---

# 五、恋爱广场模块

## 1. 发布动态

### POST /api/post

请求参数：

```json
{
  "content": "今天也要好好恋爱",
  "topicId": 1,
  "city": "广州",
  "location": "天河",
  "mediaList": [
    {
      "mediaType": 1,
      "url": "https://xxx.com/post.jpg",
      "sort": 1
    }
  ]
}
```

返回：

```json
{
  "postId": 2001
}
```

---

## 2. 广场动态列表

### GET /api/post/list

查询参数：

```text
page=1&pageSize=20&tab=recommend&city=广州
```

tab：

| 值         | 说明 |
| --------- | -- |
| recommend | 推荐 |
| nearby    | 附近 |
| couple    | 情侣 |
| single    | 单身 |
| follow    | 关注 |

返回：

```json
{
  "list": [
    {
      "id": 2001,
      "content": "今天也要好好恋爱",
      "author": {
        "id": 1,
        "nickname": "小鹿",
        "avatar": ""
      },
      "mediaList": [],
      "likeCount": 10,
      "commentCount": 2,
      "collectCount": 1,
      "isLiked": false,
      "isCollected": false,
      "createdAt": "2026-06-04 10:00:00"
    }
  ],
  "total": 1
}
```

---

## 3. 动态详情

### GET /api/post/{id}

返回：

```json
{
  "id": 2001,
  "content": "今天也要好好恋爱",
  "author": {
    "id": 1,
    "nickname": "小鹿",
    "avatar": ""
  },
  "mediaList": [],
  "likeCount": 10,
  "commentCount": 2,
  "collectCount": 1,
  "createdAt": "2026-06-04 10:00:00"
}
```

---

## 4. 删除动态

### DELETE /api/post/{id}

返回：

```json
{
  "success": true
}
```

---

# 六、互动模块

## 1. 点赞 / 取消点赞

### POST /api/like/toggle

请求参数：

```json
{
  "targetType": 1,
  "targetId": 2001
}
```

targetType：

| 值 | 说明 |
| - | -- |
| 1 | 动态 |
| 2 | 日记 |
| 3 | 评论 |

返回：

```json
{
  "liked": true,
  "likeCount": 11
}
```

---

## 2. 收藏 / 取消收藏

### POST /api/collect/toggle

请求参数：

```json
{
  "targetType": 1,
  "targetId": 2001
}
```

返回：

```json
{
  "collected": true,
  "collectCount": 2
}
```

---

## 3. 发布评论

### POST /api/comment

请求参数：

```json
{
  "targetType": 1,
  "targetId": 2001,
  "parentId": 0,
  "replyUserId": 0,
  "content": "好甜呀"
}
```

返回：

```json
{
  "commentId": 3001
}
```

---

## 4. 评论列表

### GET /api/comment/list

查询参数：

```text
targetType=1&targetId=2001&page=1&pageSize=20
```

返回：

```json
{
  "list": [
    {
      "id": 3001,
      "content": "好甜呀",
      "author": {
        "id": 3,
        "nickname": "小猫",
        "avatar": ""
      },
      "replyUser": null,
      "likeCount": 0,
      "createdAt": "2026-06-04 10:00:00"
    }
  ],
  "total": 1
}
```

---

# 七、漂流瓶模块

## 1. 扔漂流瓶

### POST /api/bottle

请求参数：

```json
{
  "content": "今天想认识一个有趣的人",
  "bottleType": 1,
  "mediaUrl": "",
  "isAnonymous": 1,
  "city": "广州"
}
```

返回：

```json
{
  "bottleId": 4001
}
```

---

## 2. 捞一个漂流瓶

### POST /api/bottle/pick

请求参数：

```json
{
  "city": "广州"
}
```

返回：

```json
{
  "id": 4001,
  "content": "今天想认识一个有趣的人",
  "bottleType": 1,
  "mediaUrl": "",
  "isAnonymous": 1,
  "author": {
    "id": 0,
    "nickname": "匿名用户",
    "avatar": ""
  },
  "createdAt": "2026-06-04 10:00:00"
}
```

---

## 3. 回复漂流瓶

### POST /api/bottle/reply

请求参数：

```json
{
  "bottleId": 4001,
  "content": "我也想认识你"
}
```

返回：

```json
{
  "sessionId": 5001
}
```

---

# 八、聊天模块

## 1. 获取会话列表

### GET /api/chat/session/list

返回：

```json
{
  "list": [
    {
      "id": 5001,
      "sessionType": 1,
      "targetUser": {
        "id": 2,
        "nickname": "小熊",
        "avatar": ""
      },
      "lastMessage": "晚安",
      "lastMessageTime": "2026-06-04 22:00:00",
      "unreadCount": 2
    }
  ]
}
```

---

## 2. 获取聊天记录

### GET /api/chat/message/list

查询参数：

```text
sessionId=5001&page=1&pageSize=20
```

返回：

```json
{
  "list": [
    {
      "id": 6001,
      "senderId": 1,
      "receiverId": 2,
      "messageType": 1,
      "content": "晚安",
      "mediaUrl": "",
      "isRead": 1,
      "createdAt": "2026-06-04 22:00:00"
    }
  ]
}
```

---

## 3. 发送聊天消息

### POST /api/chat/message

请求参数：

```json
{
  "sessionId": 5001,
  "receiverId": 2,
  "messageType": 1,
  "content": "晚安",
  "mediaUrl": ""
}
```

返回：

```json
{
  "messageId": 6002
}
```

说明：

MVP 可以先用 HTTP 轮询，后续升级 WebSocket。

---

# 九、AI恋人模块

## 1. 创建AI会话

### POST /api/ai/session

请求参数：

```json
{
  "aiRoleId": 1
}
```

返回：

```json
{
  "sessionId": 7001
}
```

---

## 2. AI聊天

### POST /api/ai/chat

请求参数：

```json
{
  "sessionId": 7001,
  "message": "我今天和对象吵架了",
  "useDiaryMemory": true
}
```

返回：

```json
{
  "reply": "我能感觉到你有点委屈。要不要先告诉我，你们是因为什么吵架？",
  "memoryUsed": [
    {
      "id": 1,
      "content": "用户最近提到对象工作很忙"
    }
  ]
}
```

---

## 3. 获取AI记忆列表

### GET /api/ai/memory/list

查询参数：

```text
page=1&pageSize=20
```

返回：

```json
{
  "list": [
    {
      "id": 1,
      "memoryType": 1,
      "content": "对象喜欢草莓蛋糕",
      "importance": 80,
      "happenedAt": "2026-05-20"
    }
  ]
}
```

---

## 4. 删除AI记忆

### DELETE /api/ai/memory/{id}

返回：

```json
{
  "success": true
}
```

---

## 5. 生成恋爱周报

### POST /api/ai/report/generate

请求参数：

```json
{
  "reportType": 1,
  "startDate": "2026-06-01",
  "endDate": "2026-06-07"
}
```

返回：

```json
{
  "reportId": 8001
}
```

---

## 6. 获取AI报告详情

### GET /api/ai/report/{id}

返回：

```json
{
  "id": 8001,
  "reportType": 1,
  "startDate": "2026-06-01",
  "endDate": "2026-06-07",
  "emotionScore": 85,
  "intimacyScore": 90,
  "communicationScore": 78,
  "ritualScore": 70,
  "totalScore": 82,
  "summary": "这一周你们整体状态不错。",
  "suggestion": "建议安排一次轻松的约会。"
}
```

---

# 十、纪念日模块

## 1. 新增纪念日

### POST /api/anniversary

请求参数：

```json
{
  "title": "恋爱纪念日",
  "eventDate": "2025-05-20",
  "repeatType": 1,
  "reminderDays": 3
}
```

返回：

```json
{
  "anniversaryId": 9001
}
```

---

## 2. 纪念日列表

### GET /api/anniversary/list

返回：

```json
{
  "list": [
    {
      "id": 9001,
      "title": "恋爱纪念日",
      "eventDate": "2025-05-20",
      "repeatType": 1,
      "daysLeft": 20
    }
  ]
}
```

---

## 3. 删除纪念日

### DELETE /api/anniversary/{id}

返回：

```json
{
  "success": true
}
```

---

# 十一、愿望清单模块

## 1. 新增愿望

### POST /api/wish

请求参数：

```json
{
  "title": "一起去看海",
  "description": "今年夏天完成"
}
```

返回：

```json
{
  "wishId": 9101
}
```

---

## 2. 愿望列表

### GET /api/wish/list

返回：

```json
{
  "list": [
    {
      "id": 9101,
      "title": "一起去看海",
      "description": "今年夏天完成",
      "status": 1,
      "createdAt": "2026-06-04 10:00:00"
    }
  ]
}
```

---

## 3. 完成愿望

### POST /api/wish/{id}/complete

返回：

```json
{
  "success": true
}
```

---

# 十二、通知模块

## 1. 通知列表

### GET /api/notification/list

查询参数：

```text
page=1&pageSize=20
```

返回：

```json
{
  "list": [
    {
      "id": 1,
      "type": 1,
      "title": "收到一个点赞",
      "content": "小猫点赞了你的动态",
      "isRead": 0,
      "createdAt": "2026-06-04 10:00:00"
    }
  ],
  "unreadCount": 3
}
```

---

## 2. 标记已读

### POST /api/notification/read

请求参数：

```json
{
  "notificationIds": [1, 2, 3]
}
```

返回：

```json
{
  "success": true
}
```

---

# 十三、文件上传模块

## 1. 获取上传凭证

### POST /api/upload/token

请求参数：

```json
{
  "fileType": "image",
  "scene": "diary"
}
```

返回：

```json
{
  "uploadUrl": "https://cos.xxx.com/upload",
  "fileUrl": "https://cdn.xxx.com/xxx.jpg",
  "token": "upload_token"
}
```

说明：

图片、视频上传建议客户端直传对象存储，后端只负责签名。

---

# 十四、举报与风控模块

## 1. 举报内容

### POST /api/report

请求参数：

```json
{
  "targetType": 2,
  "targetId": 2001,
  "reasonType": 1,
  "reason": "内容不适"
}
```

返回：

```json
{
  "reportId": 10001
}
```

---

## 2. 拉黑用户

### POST /api/user/block

请求参数：

```json
{
  "targetUserId": 2
}
```

返回：

```json
{
  "success": true
}
```

---

# 十五、我的页面接口

## 1. 我的首页数据

### GET /api/user/home

返回：

```json
{
  "user": {
    "id": 1,
    "nickname": "小鹿",
    "avatar": "",
    "loveStatus": 1
  },
  "couple": {
    "coupleId": 1,
    "loveDays": 381,
    "partnerNickname": "小熊"
  },
  "stats": {
    "diaryCount": 20,
    "postCount": 8,
    "followCount": 10,
    "fansCount": 15
  }
}
```

---

# 十六、后台管理接口

## 1. 管理员登录

### POST /api/admin/login

请求参数：

```json
{
  "username": "admin",
  "password": "123456"
}
```

---

## 2. 内容审核列表

### GET /api/admin/audit/list

查询参数：

```text
type=post&page=1&pageSize=20&status=2
```

---

## 3. 审核内容

### POST /api/admin/audit/handle

请求参数：

```json
{
  "targetType": 1,
  "targetId": 2001,
  "action": "pass",
  "reason": ""
}
```

action：

| 值      | 说明 |
| ------ | -- |
| pass   | 通过 |
| reject | 驳回 |
| hide   | 隐藏 |

---

# 十七、接口开发优先级

## 第一阶段必须开发

1. 登录
2. 用户资料
3. 情侣绑定
4. 日记发布/列表/详情
5. 广场动态
6. 点赞评论
7. AI聊天
8. 文件上传
9. 我的首页

---

## 第二阶段开发

1. 漂流瓶
2. 附近的人
3. 聊天系统
4. 纪念日
5. 愿望清单
6. AI周报

---

## 第三阶段开发

1. 会员
2. 订单
3. 礼物
4. 高级匹配
5. 后台审核
6. 数据统计

---

# 十八、关键权限规则

## 日记权限

仅自己：

只有作者可见。

情侣可见：

作者和当前绑定对象可见。

公开广场：

所有用户可见。

---

## 情侣关系

一个用户只能有一个当前有效情侣关系。

---

## 聊天权限

普通用户不能直接私聊陌生人。

必须满足：

互相关注

互相喜欢

漂流瓶回复

情侣关系

之一。

---

## AI权限

免费用户：

每天限制AI聊天次数。

会员用户：

提高次数或无限次数。

---

# 十九、后续建议补充接口

后续可以继续补：

1. WebSocket聊天接口
2. 附近的人接口
3. 会员支付接口
4. AI提示词接口
5. 推荐算法接口
6. 数据统计接口
7. 管理后台完整接口
