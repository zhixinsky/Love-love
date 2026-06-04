# 恋恋（love）

恋爱日记 + AI 恋人平台 — 全栈 monorepo，依据 `md/` 文档实现。

## 文档对照

| 文档 | 实现状态 |
|------|----------|
| [页面清单.md](md/页面清单.md) | App 52 页 + 后台 6 页已注册并实现/联调 |
| [API接口文档.md](md/API接口文档.md) | 后端路由已全部落地（含占位/Mock 部分） |
| [数据库字段设计.md](md/数据库字段设计.md) | 核心 Entity + `database/schema.sql` |
| [Cursor开发任务清单](md/Cursor开发任务清单（按模块拆分到每个接口和页面）.md) | 六周任务均已覆盖骨架与主流程 |
| [AI提示词体系](md/AI提示词体系（恋爱分析、恋爱周报、AI恋人记忆系统）.md) | Moona 同款 OpenAI 兼容 LLM + 恋恋 Prompt |

## 目录

```text
apps/mobile/     uni-app + Vue3 + TS
apps/server/     NestJS + TypeORM + MySQL + JWT
apps/admin/      Vue3 + Element Plus
database/        SQL
md/              产品与技术文档
scripts/         页面生成与补丁脚本
```

## 快速启动

```bash
# 数据库
mysql -u root -p < database/schema.sql
cp apps/server/.env.example apps/server/.env

# 后端
cd apps/server && npm install && npm run start:dev

# App
cd apps/mobile && npm install && npm run dev:h5

# 后台 admin / admin123
cd apps/admin && npm install && npm run dev
```

## 账号与联调

| 场景 | 说明 |
|------|------|
| App 登录 | **手机号 + 短信验证码**注册/登录；开发默认码 `123456`；生产配置 `SMS_*` |
| 后台 | `admin` / `admin123`（首次启动自动种子） |
| 上传 | Mock COS 凭证，返回可写 key |
| AI 聊天/周报 | 配置 `OPENAI_API_KEY` / `OPENAI_BASE_URL` / `OPENAI_MODEL`；未配置时自动降级为规则回复 |

## 已实现模块（后端）

- Auth（短信/微信骨架）、User、Couple、Diary、Post
- Like / Collect / Comment、Bottle、Chat、AI（会话/记忆/周报）
- Anniversary、Wish、Notification、Upload、Report、Admin

## 已实现模块（前端）

- 第一周：启动、登录、TabBar、我们、资料
- 第二～六周：日记、情侣、广场、漂流瓶、聊天、AI、通知、设置等主流程页面
- 其余页面：功能页模板 + 导航（`patch-remaining-pages.mjs`）

## 脚本

```bash
npm run generate:pages      # 重新生成页面骨架
node scripts/patch-remaining-pages.mjs
```

## 后续可增强

- 对接真实短信、微信、COS、OpenAI/DeepSeek
- WebSocket 聊天、推荐算法、会员支付
- VIP / 附近的人 / 匹配等页面的完整 UI
