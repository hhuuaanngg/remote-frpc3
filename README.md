# frpc-editor

`frpc-editor` 是一个用于编辑和运行 `frpc.toml` 的桌面客户端。项目基于 Tauri 2、React、TypeScript 和 Vite 构建，提供图形化表单来维护 frp 客户端配置，并可直接管理本地 `frpc` 进程。

## 功能

- 图形化编辑 `frpc.toml` 常用配置
  - 全局配置
  - 认证配置
  - 传输配置
  - Web 管理配置
  - 日志配置
  - Includes
- 管理代理映射和访问端配置
  - 支持 tcp、udp、http、https、stcp、sudp、xtcp、tcpmux 等代理类型
  - 支持 stcp、xtcp visitor 配置
- TOML 实时预览、解析和校验
- 自动保存配置到磁盘
- 选择本地 `frpc.exe` 并启动/停止 `frpc`
- 查看当前 `frpc` 运行状态和 PID
- 系统托盘操作
  - 显示窗口
  - 启动 frpc
  - 停止 frpc
  - 退出程序
- 开机自动启动 `frpc-editor`
- 可选开机后自动启动 `frpc`
- 深色/浅色主题切换

## 技术栈

- Tauri 2
- Rust 2021
- React 19
- TypeScript
- Vite 6
- Tailwind CSS
- Zustand
- Radix UI
- Monaco Editor
- framer-motion
- lucide-react

## 环境要求

- Node.js
- npm
- Rust
- Tauri 2 运行环境
- 本地 `frpc` 可执行文件

Windows 下需要准备 `frpc.exe`。其他平台可选择对应平台的 `frpc` 可执行文件。

## 安装依赖

```powershell
npm install
```

## 开发运行

启动 Tauri 开发模式：

```powershell
npm run tauri dev
```

仅启动前端 Vite 服务：

```powershell
npm run dev
```

仅构建前端：

```powershell
npm run build
```

## 打包

构建桌面应用安装包：

```powershell
npm run tauri build
```

构建产物位于 `src-tauri/target/release/bundle/`。

## GitHub 自动发布

仓库已配置 GitHub Actions（`.github/workflows/release.yml`），行为如下：

| 触发条件 | 行为 |
| --- | --- |
| 推送到 `main` 分支 | 自动构建 Windows 安装包，并创建 **Pre-release**（标签 `dev-<构建号>`） |
| 推送版本标签 `v*`（如 `v0.1.0`） | 自动构建并创建 **正式 Release** |
| Pull Request | 仅构建并上传 Artifact，不创建 Release |
| 手动触发 | 在 Actions 页面选择 **Run workflow** |

每次 Release 包含以下下载文件：

- `frpc-editor-windows-x64-portable.zip` — 便携版（单 exe）
- `*.msi` — Windows MSI 安装包
- `*-setup.exe` — NSIS 安装程序

用户可在 GitHub 仓库的 **Releases** 页面直接下载。

### 发布正式版本

1. 同步更新 `package.json`、`src-tauri/tauri.conf.json`、`src-tauri/Cargo.toml` 中的 `version` 字段。
2. 提交并推送到 `main`。
3. 创建并推送版本标签：

```powershell
git tag v0.1.0
git push origin v0.1.0
```

### 日常开发构建

每次推送到 `main` 都会自动生成预发布版本（`dev-1`、`dev-2` …），无需手动打标签。

## 使用方式

1. 启动应用。
2. 在左侧导航中编辑全局、认证、传输、Web 管理、日志、代理映射、访问端等配置。
3. 在 `TOML 预览` 页面确认生成的 `frpc.toml` 内容。
4. 在 `frpc 管理` 页面选择本地 `frpc.exe` 路径。
5. 选择或保存配置文件路径。
6. 点击 `启动` 运行 `frpc`。
7. 可通过页面按钮或系统托盘菜单停止 `frpc`。

## 配置文件保存规则

应用启动时会尝试从配置路径加载 `frpc.toml`：

- 如果在页面中设置了配置文件路径，则使用该路径。
- 如果未设置配置文件路径，则默认使用应用可执行文件同目录下的 `frpc.toml`。
- 编辑后的配置会自动保存到当前工作文件。
- 如果启动 `frpc` 时尚未指定配置文件，应用会先提示保存当前配置。

## frpc 进程管理

应用通过 Tauri 后端启动并持有 `frpc` 子进程句柄：

- 启动命令等价于：

```powershell
frpc.exe -c path\to\frpc.toml
```

- 启动前会停止当前由应用管理的旧 `frpc` 进程。
- 启动后会检查进程是否立即退出。
- 停止时会通过保存的子进程句柄和系统进程命令结束 `frpc`。
- 当 `frpc` 正在运行时，关闭窗口会隐藏到系统托盘。
- 通过托盘菜单退出应用时，会先停止由应用管理的 `frpc` 进程。

## 开机启动

`frpc 管理` 页面提供两个开关：

- `开机自动启动 frpc-editor`：系统登录后自动启动本应用。
- `开机时自动启动 frpc`：本应用开机启动后，自动读取已保存的 `frpc.exe` 路径和配置文件路径，并启动 `frpc`。

启用 `开机时自动启动 frpc` 时，需要先配置有效的 `frpc.exe` 路径。

## 项目结构

```text
.
├── src/                         # 前端源码
│   ├── App.tsx                  # 应用入口和页面切换
│   ├── components/              # 通用组件和 UI 组件
│   ├── hooks/                   # React hooks
│   ├── lib/                     # 工具函数、TOML 解析和字段说明
│   ├── sections/                # 配置编辑页面
│   ├── store/                   # Zustand 状态管理
│   └── types/                   # frpc 配置类型定义
├── src-tauri/                   # Tauri / Rust 后端
│   ├── capabilities/            # Tauri 权限配置
│   ├── src/
│   │   ├── commands/            # 文件、进程、开机启动命令
│   │   ├── lib.rs               # Tauri 初始化、托盘、命令注册
│   │   └── main.rs              # 桌面入口
│   ├── Cargo.toml
│   └── tauri.conf.json
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 常用命令

```powershell
# 安装依赖
npm install

# Tauri 开发模式
npm run tauri dev

# 前端类型检查和构建
npm run build

# 桌面应用打包
npm run tauri build
```

## 备注

- 当前项目默认面向 frp v0.60+ 的 `frpc.toml` 配置格式。
- 应用只管理由自身启动的 `frpc` 进程，不会主动接管外部手动启动的其他 `frpc` 实例。
- 前端在普通浏览器中运行时无法调用 Tauri 文件、进程和开机启动能力；完整功能需要通过 Tauri 桌面模式运行。
