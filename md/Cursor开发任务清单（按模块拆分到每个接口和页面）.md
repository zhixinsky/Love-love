# 恋爱日记APP Cursor开发任务清单 V1.0

## 一、项目基础搭建

### 任务 1：初始化前端项目

技术栈：

uni-app + Vue3 + TypeScript

需要完成：

* 创建项目结构
* 配置路由
* 配置 TabBar
* 封装 request 请求
* 封装 token 存储
* 封装登录拦截
* 配置全局样式

目录建议：

```text
src/
  pages/
  components/
  api/
  store/
  utils/
  static/
```

验收标准：

* App 可以正常启动
* TabBar 正常显示
* 请求封装可用

---

### 任务 2：初始化后端项目

技术栈：

NestJS + MySQL + Redis + JWT

需要完成：

* 创建 NestJS 项目
* 配置 MySQL
* 配置 Redis
* 配置 JWT
* 配置统一返回格式
* 配置全局异常处理
* 配置接口参数校验

目录建议：

```text
src/
  modules/
  common/
  config/
  entities/
  guards/
  utils/
```

验收标准：

* 后端服务可启动
* 数据库连接成功
* JWT 鉴权可用

---

# 二、登录与用户模块

## 前端页面

### 页面 1：登录页

路径：

```text
/pages/login/index
```

功能：

* 微信登录
* 手机号登录
* 获取验证码
* 登录成功保存 token
* 跳转首页

调用接口：

```text
POST /api/auth/login/wechat
POST /api/auth/login/mobile
```

---

### 页面 2：个人资料页

路径：

```text
/pages/user/profile
```

功能：

* 昵称
* 头像
* 性别
* 生日
* 城市
* 简介
* 保存资料

调用接口：

```text
GET /api/user/profile
PUT /api/user/profile
```

---

## 后端任务

### AuthModule

接口：

```text
POST /api/auth/login/mobile
POST /api/auth/login/wechat
```

需要实现：

* 登录
* 注册
* JWT生成
* 用户不存在自动创建

---

### UserModule

接口：

```text
GET /api/user/profile
PUT /api/user/profile
GET /api/user/home
```

需要实现：

* 获取用户资料
* 修改用户资料
* 我的首页统计

---

# 三、TabBar模块

## TabBar结构

```text
广场
遇见
发布
AI恋人
我们
```

---

### 页面 1：广场首页

路径：

```text
/pages/post/index
```

功能：

* 推荐动态流
* 顶部频道切换
* 点赞
* 评论入口
* 发布入口

接口：

```text
GET /api/post/list
POST /api/like/toggle
POST /api/collect/toggle
```

---

### 页面 2：遇见页

路径：

```text
/pages/meet/index
```

MVP先展示入口：

* 漂流瓶
* 附近的人
* 每日推荐

第一版附近的人可以先做静态入口。

---

### 页面 3：发布页

路径：

```text
/pages/publish/index
```

功能：

* 发动态
* 写日记
* 发漂流瓶

---

### 页面 4：AI恋人页

路径：

```text
/pages/ai/index
```

功能：

* AI聊天入口
* AI记忆
* 恋爱周报入口

---

### 页面 5：我们页

路径：

```text
/pages/me/index
```

功能：

* 未绑定：显示邀请对象
* 已绑定：显示恋爱天数、情侣空间
* 我的日记
* 我的动态
* 设置

接口：

```text
GET /api/user/home
GET /api/couple/info
```

---

# 四、情侣绑定模块

## 前端页面

### 页面 1：情侣绑定页

路径：

```text
/pages/couple/bind
```

功能：

* 生成邀请码
* 输入邀请码
* 显示绑定状态

接口：

```text
POST /api/couple/invite
POST /api/couple/bind
GET /api/couple/info
```

---

### 页面 2：情侣空间页

路径：

```text
/pages/couple/space
```

功能：

* 恋爱天数
* 对方信息
* 最近日记
* 纪念日
* 愿望清单

接口：

```text
GET /api/couple/info
GET /api/diary/list
GET /api/anniversary/list
GET /api/wish/list
```

---

## 后端任务

### CoupleModule

接口：

```text
POST /api/couple/invite
POST /api/couple/bind
GET /api/couple/info
POST /api/couple/unbind
```

需要实现：

* 邀请码生成
* 邀请码有效期
* 绑定关系校验
* 一人只能绑定一个对象
* 解除绑定

验收标准：

* A生成邀请码
* B输入后绑定成功
* A/B都能看到情侣信息
* 重复绑定被拦截

---

# 五、日记模块

## 前端页面

### 页面 1：日记列表页

路径：

```text
/pages/diary/index
```

功能：

* 我的日记
* 情侣日记
* 权限筛选
* 按时间排序

接口：

```text
GET /api/diary/list
```

---

### 页面 2：写日记页

路径：

```text
/pages/diary/edit
```

功能：

* 标题
* 内容
* 心情
* 天气
* 位置
* 图片上传
* 可见权限
* 保存

接口：

```text
POST /api/upload/token
POST /api/diary
PUT /api/diary/{id}
```

---

### 页面 3：日记详情页

路径：

```text
/pages/diary/detail
```

功能：

* 查看内容
* 查看图片
* 编辑
* 删除
* AI分析入口

接口：

```text
GET /api/diary/{id}
DELETE /api/diary/{id}
```

---

## 后端任务

### DiaryModule

接口：

```text
POST /api/diary
GET /api/diary/list
GET /api/diary/{id}
PUT /api/diary/{id}
DELETE /api/diary/{id}
```

需要实现：

* 新增日记
* 修改日记
* 删除日记
* 权限控制
* 媒体保存
* 公开日记同步生成广场动态

验收标准：

* 私密日记只有自己可见
* 情侣日记双方可见
* 公开日记可进入广场
* 删除后广场不再展示

---

# 六、广场动态模块

## 前端页面

### 页面 1：广场列表页

路径：

```text
/pages/post/index
```

功能：

* 动态流
* 推荐/附近/情侣/单身
* 点赞
* 收藏
* 评论入口

---

### 页面 2：发布动态页

路径：

```text
/pages/post/publish
```

功能：

* 文本
* 图片
* 话题
* 城市
* 发布

接口：

```text
POST /api/post
```

---

### 页面 3：动态详情页

路径：

```text
/pages/post/detail
```

功能：

* 动态详情
* 评论列表
* 发布评论
* 点赞
* 收藏
* 举报

接口：

```text
GET /api/post/{id}
GET /api/comment/list
POST /api/comment
POST /api/like/toggle
POST /api/collect/toggle
POST /api/report
```

---

## 后端任务

### PostModule

接口：

```text
POST /api/post
GET /api/post/list
GET /api/post/{id}
DELETE /api/post/{id}
```

需要实现：

* 发布动态
* 动态列表
* 动态详情
* 删除动态
* 根据 tab 返回不同内容

---

### InteractionModule

接口：

```text
POST /api/like/toggle
POST /api/collect/toggle
POST /api/comment
GET /api/comment/list
```

需要实现：

* 点赞
* 取消点赞
* 收藏
* 取消收藏
* 评论
* 回复评论

验收标准：

* 不能重复点赞
* 点赞数正确增减
* 评论数正确更新

---

# 七、漂流瓶模块

## 前端页面

### 页面 1：漂流瓶首页

路径：

```text
/pages/bottle/index
```

功能：

* 扔瓶子
* 捞瓶子
* 我的瓶子

接口：

```text
POST /api/bottle
POST /api/bottle/pick
```

---

### 页面 2：瓶子详情页

路径：

```text
/pages/bottle/detail
```

功能：

* 查看瓶子
* 回复瓶子
* 开启聊天

接口：

```text
POST /api/bottle/reply
```

---

## 后端任务

### BottleModule

接口：

```text
POST /api/bottle
POST /api/bottle/pick
POST /api/bottle/reply
```

需要实现：

* 扔瓶子
* 随机捞瓶子
* 同城优先
* 匿名展示
* 回复后创建聊天会话

---

# 八、聊天模块

## 前端页面

### 页面 1：会话列表

路径：

```text
/pages/chat/index
```

功能：

* 私聊列表
* AI聊天列表
* 最后一条消息
* 未读数

接口：

```text
GET /api/chat/session/list
```

---

### 页面 2：聊天详情

路径：

```text
/pages/chat/detail
```

功能：

* 消息列表
* 发送文本
* 发送图片
* 自动滚动到底部

接口：

```text
GET /api/chat/message/list
POST /api/chat/message
```

---

## 后端任务

### ChatModule

接口：

```text
GET /api/chat/session/list
GET /api/chat/message/list
POST /api/chat/message
```

需要实现：

* 创建会话
* 获取会话
* 获取消息
* 发送消息
* 更新最后消息
* 未读数

MVP说明：

第一版用 HTTP 轮询。

第二版升级 WebSocket。

---

# 九、AI恋人模块

## 前端页面

### 页面 1：AI聊天页

路径：

```text
/pages/ai/chat
```

功能：

* AI对话
* 是否读取日记记忆
* 展示AI回复
* 展示使用的记忆

接口：

```text
POST /api/ai/session
POST /api/ai/chat
```

---

### 页面 2：AI记忆页

路径：

```text
/pages/ai/memory
```

功能：

* 查看AI记忆
* 删除AI记忆

接口：

```text
GET /api/ai/memory/list
DELETE /api/ai/memory/{id}
```

---

### 页面 3：AI周报页

路径：

```text
/pages/ai/report
```

功能：

* 生成周报
* 查看周报
* 分享周报

接口：

```text
POST /api/ai/report/generate
GET /api/ai/report/{id}
```

---

## 后端任务

### AiModule

接口：

```text
POST /api/ai/session
POST /api/ai/chat
GET /api/ai/memory/list
DELETE /api/ai/memory/{id}
POST /api/ai/report/generate
GET /api/ai/report/{id}
```

需要实现：

* AI会话创建
* 读取用户日记
* 读取AI记忆
* 拼接Prompt
* 调用AI模型
* 保存聊天记录
* 提取重要记忆
* 生成恋爱报告

验收标准：

* AI能根据用户日记回答
* AI不会读取无权限日记
* 用户可以删除AI记忆
* AI周报能根据日期生成

---

# 十、纪念日模块

## 前端页面

### 页面：纪念日列表

路径：

```text
/pages/anniversary/index
```

功能：

* 新增纪念日
* 列表展示
* 倒计时
* 删除

接口：

```text
POST /api/anniversary
GET /api/anniversary/list
DELETE /api/anniversary/{id}
```

---

## 后端任务

### AnniversaryModule

需要实现：

* 新增纪念日
* 计算剩余天数
* 重复提醒
* 删除纪念日

---

# 十一、愿望清单模块

## 前端页面

### 页面：愿望清单

路径：

```text
/pages/wish/index
```

功能：

* 新增愿望
* 完成愿望
* 删除愿望
* 情侣双方可见

接口：

```text
POST /api/wish
GET /api/wish/list
POST /api/wish/{id}/complete
```

---

## 后端任务

### WishModule

需要实现：

* 创建愿望
* 查看情侣愿望
* 完成愿望
* 权限校验

---

# 十二、上传模块

## 前端任务

封装上传组件：

```text
/components/upload-image
```

功能：

* 选择图片
* 获取上传凭证
* 上传到对象存储
* 返回URL
* 最多9张图

接口：

```text
POST /api/upload/token
```

---

## 后端任务

### UploadModule

需要实现：

* 获取 COS 上传签名
* 限制文件类型
* 限制文件大小
* 区分上传场景

上传场景：

```text
avatar
diary
post
chat
bottle
```

---

# 十三、通知模块

## 前端页面

### 页面：消息通知

路径：

```text
/pages/notification/index
```

功能：

* 点赞通知
* 评论通知
* 匹配通知
* 情侣邀请
* AI提醒
* 标记已读

接口：

```text
GET /api/notification/list
POST /api/notification/read
```

---

## 后端任务

### NotificationModule

需要实现：

* 创建通知
* 通知列表
* 未读数
* 标记已读

触发场景：

* 点赞
* 评论
* 情侣绑定
* 漂流瓶回复
* AI周报生成

---

# 十四、举报与风控模块

## 前端任务

在以下页面加入举报入口：

* 动态详情
* 评论
* 用户主页
* 漂流瓶

接口：

```text
POST /api/report
```

---

## 后端任务

### ReportModule

需要实现：

* 提交举报
* 防重复举报
* 后台查看举报
* 修改内容状态

---

# 十五、后台管理模块

## 后台页面

技术建议：

Vue3 + Element Plus

页面：

```text
/admin/login
/admin/dashboard
/admin/user
/admin/post
/admin/report
/admin/audit
```

---

## 后端接口

```text
POST /api/admin/login
GET /api/admin/audit/list
POST /api/admin/audit/handle
```

后台功能：

* 用户列表
* 内容审核
* 举报处理
* 封禁用户
* 隐藏动态

---

# 十六、全局组件清单

前端需要封装：

```text
LoveButton         点赞按钮
PostCard           动态卡片
DiaryCard          日记卡片
UserAvatar         用户头像
UploadImage        图片上传
EmptyState         空状态
CommentList        评论列表
TabFilter          顶部频道筛选
AiChatBubble       AI聊天气泡
PermissionSelector 日记权限选择器
```

---

# 十七、接口封装文件

前端 api 目录：

```text
api/auth.ts
api/user.ts
api/couple.ts
api/diary.ts
api/post.ts
api/comment.ts
api/like.ts
api/bottle.ts
api/chat.ts
api/ai.ts
api/upload.ts
api/notification.ts
api/report.ts
```

---

# 十八、开发顺序建议

## 第一周

* 项目初始化
* 登录
* 用户资料
* TabBar
* 我的页面

## 第二周

* 日记模块
* 图片上传
* 情侣绑定

## 第三周

* 广场动态
* 点赞
* 评论
* 收藏

## 第四周

* AI聊天
* AI记忆
* AI周报基础版

## 第五周

* 漂流瓶
* 聊天会话
* 通知系统

## 第六周

* 纪念日
* 愿望清单
* 举报
* 后台审核

---

# 十九、Cursor单任务提示词模板

## 前端页面开发提示词

```text
请基于 uni-app + Vue3 + TypeScript 开发页面：

页面路径：
/pages/xxx/index

功能需求：
1.
2.
3.

接口：
GET /api/xxx
POST /api/xxx

要求：
1. 使用组合式API
2. 样式清新、恋爱风、简洁现代
3. 封装请求到 api/xxx.ts
4. 增加 loading、empty、error 状态
5. 代码要可直接运行
```

---

## 后端接口开发提示词

```text
请基于 NestJS + TypeORM + MySQL 开发模块：

模块名称：
XxxModule

数据表：
xxx

接口：
GET /api/xxx
POST /api/xxx

要求：
1. 创建 controller、service、dto、entity
2. 使用 JWT 获取当前用户
3. 增加参数校验
4. 增加权限校验
5. 返回统一格式
6. 代码要可直接运行
```

---

## 数据库建表提示词

```text
请根据以下字段生成 MySQL 建表 SQL：

表名：
xxx

字段：
xxx

要求：
1. id 使用 bigint 主键
2. created_at、updated_at 使用 datetime
3. 状态字段 status 使用 tinyint
4. 添加必要索引
5. 使用 utf8mb4
```

---

# 二十、MVP验收标准

## 用户侧

* 用户可以登录
* 用户可以编辑资料
* 用户可以绑定对象
* 用户可以写日记
* 用户可以设置日记权限
* 用户可以发广场动态
* 用户可以点赞评论
* 用户可以和AI聊天
* AI可以读取日记上下文
* 用户可以生成恋爱周报

---

## 后台侧

* 管理员可以登录
* 管理员可以看内容
* 管理员可以处理举报
* 管理员可以隐藏违规内容

---

## 核心指标

MVP上线后重点看：

* 注册转化率
* 次日留存
* 7日留存
* 人均日记数
* 情侣绑定率
* AI聊天使用率
* 广场发布率
