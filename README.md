# 🎟️ Stub Studio (票根工作室)

一个优雅、极简的在线票根生成工具。通过上传照片并进行简单的文本和排版定制，快速生成具有设计感的纪念票根。

![Stub Studio Preview](./screenshot.png) 
*(💡 提示：请在项目根目录下放一张名为 `screenshot.png` 的应用截图，以在 GitHub 上展示最佳效果)*

## ✨ 特性 (Features)

* **📸 灵活的图片处理**: 支持图片拖拽上传，提供覆盖 (Cover)、包含 (Contain) 模式，并可自由调整图片比例和缩放。
* **✍️ 丰富的文本定制**: 自定义目的地、日期、票号、条形码及背景水印。
* **🎨 智能色彩提取**: 自动提取上传图片的主题色作为票根背景，也可自定义背景显示和尺寸。
* **🖱️ 自由拖拽排版**: 票根上的所有文本元素均支持自由拖拽，实现精确的所见即所得 (WYSIWYG) 排版。
* **📱 移动端友好**: 针对手机端横屏模式进行了深度空间优化，在移动设备上也能获得完美的编辑体验。
* **💾 高清导出**: 一键将设计好的票根导出为高质量的 PNG 图片。

## 🛠️ 技术栈 (Tech Stack)

* **前端框架**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
* **样式**: [Tailwind CSS](https://tailwindcss.com/)
* **交互与动画**: [Framer Motion](https://www.framer.com/motion/) (用于物理拖拽和丝滑动画)
* **功能组件**: 
  * `react-dropzone` (拖拽上传文件)
  * `html-to-image` (将 DOM 节点转换为高质量图片导出)
* **图标库**: [Lucide React](https://lucide.dev/)

## 🚀 快速开始 (Getting Started)

### 1. 克隆仓库
```bash
git clone <your-github-repo-url>
cd stub-studio
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动开发环境
```bash
npm run dev
```
打开浏览器并访问控制台提示的本地地址（如 `http://localhost:3000`）。

### 4. 构建生产版本
```bash
npm run build
```

## 💡 使用指南

1. **上传照片**: 在左侧面板点击或拖拽上传你的风景/人物照片。
2. **填写信息**: 输入你想要记录的目的地、时间及个性化的票号和文字水印。
3. **排版调整**: 
   * 切换横向/竖向布局。
   * **直接在画布上使用鼠标/手指拖拽** 目的地、日期、票号等文本，将其放在你喜欢的位置。
4. **一键保存**: 点击右上角的“保存票根”按钮，自动生成并下载纪念图片。

## 📄 开源协议 (License)

本项目基于 [MIT License](LICENSE) 开源。您可以自由地使用、修改和分发。
