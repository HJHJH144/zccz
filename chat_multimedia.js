/**
 * 多媒体聊天增强功能
 * 提供图片、视频和音频消息支持
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function () {
    // 确保先加载了Firebase和密码验证
    const initInterval = setInterval(() => {
        if (typeof userVerified !== 'undefined' && userVerified) {
            clearInterval(initInterval);
            initializeMultimediaChat();
        }
    }, 500);

    // 超时处理
    setTimeout(() => clearInterval(initInterval), 10000);
});

/**
 * 初始化多媒体聊天功能
 */
function initializeMultimediaChat() {
    console.log('初始化多媒体聊天功能...');

    // 添加多媒体工具栏
    addMultimediaToolbar();

    // 绑定多媒体按钮事件
    bindMultimediaEvents();
}

/**
 * 添加多媒体工具栏
 */
function addMultimediaToolbar() {
    // 检查是否已经存在工具栏
    if (document.querySelector('.multimedia-bar')) {
        console.log('多媒体工具栏已存在');
        return;
    }

    // 创建工具栏
    const multimediaBar = document.createElement('div');
    multimediaBar.className = 'multimedia-bar';
    multimediaBar.style.cssText = `
        padding: 10px 15px;
        display: flex;
        align-items: center;
        background: rgba(0, 0, 0, 0.2);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    `;

    // 添加表情按钮
    multimediaBar.innerHTML = `
        <button id="emoji-button" class="media-button" title="发送表情" style="background: none; border: none; color: white; margin-right: 15px; cursor: pointer;">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
        </button>
        
        <!-- 媒体菜单按钮 -->
        <button id="media-button" class="media-button" title="发送媒体" style="background: none; border: none; color: white; cursor: pointer;">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
        </button>
        
        <!-- 媒体菜单 -->
        <div id="media-menu" style="display: none; position: absolute; bottom: 70px; left: 65px; background: rgba(0,0,0,0.8); border-radius: 10px; padding: 10px; z-index: 100; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
            <button id="image-button" class="media-menu-item" style="background: none; border: none; color: white; display: flex; align-items: center; padding: 8px 15px; cursor: pointer; width: 100%; text-align: left;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                发送图片
            </button>
            <button id="video-button" class="media-menu-item" style="background: none; border: none; color: white; display: flex; align-items: center; padding: 8px 15px; cursor: pointer; width: 100%; text-align: left; margin-top: 5px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
                发送视频
            </button>
            <button id="audio-button" class="media-menu-item" style="background: none; border: none; color: white; display: flex; align-items: center; padding: 8px 15px; cursor: pointer; width: 100%; text-align: left; margin-top: 5px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                发送语音
            </button>
        </div>
    `;

    // 创建文件上传输入
    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.id = 'image-input';
    imageInput.accept = 'image/*';
    imageInput.style.display = 'none';

    const videoInput = document.createElement('input');
    videoInput.type = 'file';
    videoInput.id = 'video-input';
    videoInput.accept = 'video/*';
    videoInput.style.display = 'none';

    // 添加到DOM
    const chatContainer = document.getElementById('chatContainer');
    const chatInput = document.querySelector('.chat-input');

    if (chatContainer && chatInput) {
        chatContainer.insertBefore(multimediaBar, chatInput);
        document.body.appendChild(imageInput);
        document.body.appendChild(videoInput);
    }

    // 创建表情面板
    createEmojiPanel();
}

/**
 * 创建表情面板
 */
function createEmojiPanel() {
    // 检查是否已存在表情面板
    if (document.getElementById('emoji-panel')) {
        console.log('表情面板已存在');
        return;
    }

    // 表情符号列表
    const emojis = [
        '❤️', '😊', '😍', '🥰', '😘', '😚', '😙', '🤗', '🤔', '🤭',
        '🙂', '😉', '😌', '😏', '🥳', '🎉', '🎂', '🎁', '💝', '💖',
        '💕', '💓', '💗', '💞', '💘', '💋', '👩‍❤️‍👨', '👨‍❤️‍👨', '👩‍❤️‍👩', '💑',
        '👨‍👩‍👧', '👪', '👨‍👩‍👧‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧', '👫', '👭', '👬', '💍', '👑',
        '👸', '🤴', '👰', '🤵', '💐', '🌹', '🌷', '🌸', '🌺', '🌻'
    ];

    // 创建表情面板
    const emojiPanel = document.createElement('div');
    emojiPanel.id = 'emoji-panel';
    emojiPanel.style.cssText = `
        display: none;
        position: absolute;
        bottom: 70px;
        left: 15px;
        background: rgba(30, 40, 58, 0.95);
        border-radius: 10px;
        padding: 10px;
        z-index: 100;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        width: 280px;
        max-height: 200px;
        overflow-y: auto;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;

    // 填充表情
    emojis.forEach(emoji => {
        const emojiBtn = document.createElement('div');
        emojiBtn.className = 'emoji-item';
        emojiBtn.textContent = emoji;
        emojiBtn.style.cssText = `
            font-size: 24px;
            cursor: pointer;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
        `;

        // 悬停效果
        emojiBtn.addEventListener('mouseover', function () {
            this.style.transform = 'scale(1.2)';
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            this.style.borderRadius = '5px';
        });

        emojiBtn.addEventListener('mouseout', function () {
            this.style.transform = 'scale(1)';
            this.style.backgroundColor = 'transparent';
        });

        // 点击插入表情到输入框
        emojiBtn.addEventListener('click', function () {
            const messageInput = document.getElementById('messageInput');
            if (messageInput) {
                messageInput.value += emoji;
                messageInput.focus();
                toggleEmojiPanel(); // 选择后关闭面板
            }
        });

        emojiPanel.appendChild(emojiBtn);
    });

    // 添加到DOM
    document.body.appendChild(emojiPanel);
    emojiPanel.style.display = 'none';
}

/**
 * 切换表情面板显示状态
 */
function toggleEmojiPanel() {
    const emojiPanel = document.getElementById('emoji-panel');

    if (emojiPanel) {
        if (emojiPanel.style.display === 'none') {
            // 显示表情面板
            emojiPanel.style.display = 'flex';

            // 隐藏媒体菜单
            const mediaMenu = document.getElementById('media-menu');
            if (mediaMenu) {
                mediaMenu.style.display = 'none';
            }

            // 点击面板外关闭面板
            document.addEventListener('click', closeEmojiPanelOutside);
        } else {
            // 隐藏表情面板
            emojiPanel.style.display = 'none';
            document.removeEventListener('click', closeEmojiPanelOutside);
        }
    }
}

/**
 * 切换媒体菜单显示状态
 */
function toggleMediaMenu() {
    const mediaMenu = document.getElementById('media-menu');

    if (mediaMenu) {
        if (mediaMenu.style.display === 'none') {
            // 显示媒体菜单
            mediaMenu.style.display = 'block';

            // 隐藏表情面板
            const emojiPanel = document.getElementById('emoji-panel');
            if (emojiPanel) {
                emojiPanel.style.display = 'none';
            }

            // 点击菜单外关闭菜单
            document.addEventListener('click', closeMediaMenuOutside);
        } else {
            // 隐藏媒体菜单
            mediaMenu.style.display = 'none';
            document.removeEventListener('click', closeMediaMenuOutside);
        }
    }
}

/**
 * 在点击面板外部时关闭表情面板
 */
function closeEmojiPanelOutside(event) {
    const emojiPanel = document.getElementById('emoji-panel');
    const emojiButton = document.getElementById('emoji-button');

    if (emojiPanel && emojiButton) {
        if (!emojiPanel.contains(event.target) && event.target !== emojiButton) {
            emojiPanel.style.display = 'none';
            document.removeEventListener('click', closeEmojiPanelOutside);
        }
    }
}

/**
 * 在点击菜单外部时关闭媒体菜单
 */
function closeMediaMenuOutside(event) {
    const mediaMenu = document.getElementById('media-menu');
    const mediaButton = document.getElementById('media-button');

    if (mediaMenu && mediaButton) {
        if (!mediaMenu.contains(event.target) && event.target !== mediaButton) {
            mediaMenu.style.display = 'none';
            document.removeEventListener('click', closeMediaMenuOutside);
        }
    }
}

/**
 * 绑定多媒体按钮事件
 */
function bindMultimediaEvents() {
    // 表情按钮点击事件
    const emojiButton = document.getElementById('emoji-button');
    if (emojiButton) {
        emojiButton.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleEmojiPanel();
        });
    }

    // 媒体菜单按钮点击事件
    const mediaButton = document.getElementById('media-button');
    if (mediaButton) {
        mediaButton.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleMediaMenu();
        });
    }

    // 图片按钮点击事件
    const imageButton = document.getElementById('image-button');
    const imageInput = document.getElementById('image-input');
    if (imageButton && imageInput) {
        imageButton.addEventListener('click', function () {
            imageInput.click();
            toggleMediaMenu();
        });

        imageInput.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                handleImageUpload(this.files[0]);
            }
        });
    }

    // 视频按钮点击事件
    const videoButton = document.getElementById('video-button');
    const videoInput = document.getElementById('video-input');
    if (videoButton && videoInput) {
        videoButton.addEventListener('click', function () {
            videoInput.click();
            toggleMediaMenu();
        });

        videoInput.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                handleVideoUpload(this.files[0]);
            }
        });
    }

    // 音频按钮点击事件
    const audioButton = document.getElementById('audio-button');
    if (audioButton) {
        audioButton.addEventListener('click', function () {
            toggleMediaMenu();
            startRecording(this);
        });
    }
}

/**
 * 处理图片上传
 */
function handleImageUpload(file) {
    // 检查文件类型
    if (!file.type.match('image.*')) {
        alert('请选择图片文件');
        return;
    }

    // 检查文件大小
    if (file.size > 5 * 1024 * 1024) {
        alert('图片不能超过5MB!');
        return;
    }

    // 压缩和预览图片
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            // 压缩图片
            const canvas = document.createElement('canvas');
            const maxWidth = 1200;
            const maxHeight = 1200;
            let width = img.width;
            let height = img.height;

            // 调整尺寸
            if (width > height && width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            } else if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // 转换为Blob
            canvas.toBlob(function (blob) {
                sendMessageToFirebase('image', blob);
            }, 'image/jpeg', 0.85);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

/**
 * 处理视频上传
 */
function handleVideoUpload(file) {
    // 检查文件类型
    if (!file.type.match('video.*')) {
        alert('请选择视频文件');
        return;
    }

    // 检查文件大小
    if (file.size > 50 * 1024 * 1024) {
        alert('视频不能超过50MB!');
        return;
    }

    // 直接发送视频文件
    sendMessageToFirebase('video', file);
}

/**
 * 开始录音
 */
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];

function startRecording(button) {
    // 检查是否已经在录音
    if (isRecording) {
        stopRecording(button);
        return;
    }

    // 请求麦克风权限
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function (stream) {
            // 创建MediaRecorder实例
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            // 收集录音数据
            mediaRecorder.addEventListener('dataavailable', function (e) {
                audioChunks.push(e.data);
            });

            // 录音结束处理
            mediaRecorder.addEventListener('stop', function () {
                // 创建音频Blob
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

                // 停止所有音轨
                stream.getTracks().forEach(track => track.stop());

                // 发送音频消息
                sendMessageToFirebase('audio', audioBlob);
            });

            // 开始录音
            mediaRecorder.start();
            isRecording = true;

            // 更新按钮状态
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
            button.style.color = '#ff5555';

            // 设置最长录音时间(60秒)
            setTimeout(() => {
                if (isRecording) {
                    stopRecording(button);
                }
            }, 60000);
        })
        .catch(function (err) {
            console.error('录音错误:', err);
            if (err.name === 'NotAllowedError') {
                alert('请允许访问麦克风以进行录音');
            } else {
                alert('录音失败: ' + err.message);
            }
        });
}

/**
 * 停止录音
 */
function stopRecording(button) {
    if (mediaRecorder && isRecording) {
        // 停止录音
        mediaRecorder.stop();
        isRecording = false;

        // 恢复按钮状态
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>';
        button.style.color = 'white';
    }
}

// 将全局函数暴露给window
window.toggleEmojiPanel = toggleEmojiPanel;
window.handleImageUpload = handleImageUpload;
window.handleVideoUpload = handleVideoUpload;
window.startRecording = startRecording;
window.stopRecording = stopRecording;