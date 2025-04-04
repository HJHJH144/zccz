# 心动表白 - 浪漫表白网页应用

这是一个简单而浪漫的表白网页应用，可以在电脑和手机上打开，支持中文。

## 功能特点

- 漂亮的动画效果：心形、星星和烟花
- 可自定义表白对象的名字
- 浪漫的表白消息和最终告白
- 背景音乐
- 响应式设计，适配不同屏幕尺寸
- 支持中文显示
- **多媒体聊天功能**：支持发送文字、表情、图片、视频和语音消息
- 端到端加密：所有聊天内容都经过加密处理，保护隐私
- 聊天记录云端保存：通过Firebase实时数据库存储聊天记录
- 上传照片功能：可以上传并展示你们的甜蜜合照

## 如何使用

1. 直接在浏览器中打开 `index.html` 文件
2. 输入你要表白的人的名字（如果不输入，将默认为"亲爱的"）
3. 点击"开始表白"按钮
4. 观看动画并点击"下一页"按钮查看更多浪漫消息
5. 最终会显示完整的表白告白
6. 点击"留言聊天"按钮，可以打开聊天界面进行双人对话

## 聊天功能使用说明

在最终的表白页面，你可以使用多媒体聊天功能：

1. 点击"情侣聊天室"按钮打开聊天窗口
2. 首次使用时，需要设置一个密码，该密码用于加密聊天内容
3. 从下拉菜单选择身份（"zc"或"lcz"）
4. 可以发送以下类型的消息：
   - 文字消息：直接在输入框中输入并发送
   - 表情：点击😊按钮选择表情
   - 图片：点击图片按钮上传图片（最大5MB）
   - 视频：点击视频按钮上传短视频（最大20MB）
   - 语音：点击麦克风按钮开始录音，再次点击结束录音（最长1分钟）
5. 点击消息中的图片或视频可以全屏查看
6. 点击分享按钮可以生成带密码的链接，分享给对方

所有聊天内容经过端到端加密，只有知道密码的人才能查看，确保你们的隐私安全。聊天记录会自动保存在Firebase云端，即使更换设备也能查看历史消息。

### 密码保护

聊天功能使用端到端加密技术保护你们的隐私：

1. 所有消息在发送前会在本地加密
2. 加密密钥永远不会发送到服务器
3. 只有知道正确密码的人才能解密和查看消息
4. 即使是Firebase数据库管理员也无法查看你们的聊天内容

### 多媒体文件存储

多媒体文件（图片、视频、语音）会上传到Firebase Storage存储：

1. 文件的访问链接在保存前会被加密
2. 上传的文件有大小限制：图片最大5MB，视频最大20MB，语音最大2MB
3. 请确保上传的内容遵守相关法律法规

## 自定义内容

### 修改表白消息

你可以在 `script.js` 文件中修改 `messages` 数组来自定义表白消息：

```javascript
const messages = [
    "每一天，我对你的爱都在加深",
    "你的微笑是我最大的幸福",
    "我愿意用一生的时间来爱你",
    "你是我心中最美的风景",
    "与你相遇是我最大的幸运"
];
```

### 修改最终告白

要修改最终的表白告白，编辑 `script.js` 文件中的 `finalMessage` 变量：

```javascript
const finalMessage = `亲爱的，我想说：
你是我生命中最美丽的意外，
每一次与你相遇，都让我心动不已。
...
我爱你！`;
```

### 更换背景音乐

在 `index.html` 文件中，找到以下代码，并将音乐链接替换为你喜欢的音乐链接：

```html
<audio id="bgMusic" loop>
    <source src="你的音乐文件链接" type="audio/mpeg">
</audio>
```

### 添加照片

你可以替换掉照片区域的占位符，添加你们的照片。在 `index.html` 文件中，找到以下代码：

```html
<div class="photo-frame">
    <div class="photo-placeholder">放置你们的照片</div>
</div>
```

将其替换为：

```html
<div class="photo-frame">
    <img src="你的照片路径" alt="美好回忆">
</div>
```

## 技术栈

- HTML5
- CSS3 (动画、过渡效果、弹性布局)
- JavaScript (ES6+)
- Firebase (实时数据库与存储)
- CryptoJS (用于端到端加密)
- Web APIs (MediaRecorder用于录音功能)
- PWA (渐进式Web应用支持)

## 兼容性

- 现代浏览器（Chrome、Firefox、Safari、Edge等）
- 移动设备浏览器（iOS Safari、Android Chrome等）

## 注意事项

- 由于浏览器的自动播放政策，背景音乐可能需要用户交互后才能播放
- 某些旧版浏览器可能不支持所有动画效果
- 录音功能需要用户授予麦克风访问权限
- 发送大型文件可能需要较长的上传时间，请耐心等待
- 请确保有稳定的网络连接以使用多媒体功能

希望这个浪漫的表白应用能够帮助你表达你的爱意！❤️ 