/**
 * Bug修复和系统优化脚本
 * 解决检查出的各种问题
 */

// 在DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function () {
    // 修复问题1: 全局变量确认和初始化
    fixGlobalVariables();

    // 修复问题2: 优化页面间导航和密码验证
    enhanceNavigation();

    // 修复问题3: 改进在线状态管理
    improveOnlineStatus();

    // 修复问题4: 添加媒体上传进度指示
    enhanceMediaUpload();

    // 修复问题5: 优化样式和兼容性
    fixStylingIssues();
});

/**
 * 问题1: 确保全局变量正确初始化
 */
function fixGlobalVariables() {
    // 确保userVerified全局可用
    if (typeof window.userVerified === 'undefined') {
        window.userVerified = false;
    }

    // 确保sessionId全局可用
    if (typeof window.sessionId === 'undefined') {
        window.sessionId = Date.now().toString() + Math.floor(Math.random() * 1000);
    }

    // 确保加密密钥变量存在
    if (typeof window.encryptionKey === 'undefined') {
        window.encryptionKey = '';
    }

    // 创建全局方法映射，以便在不同脚本中访问关键功能
    window.chatUtils = window.chatUtils || {};

    // 将现有的发送消息功能复制到全局工具对象中
    if (typeof window.sendMessageToFirebase === 'function' && !window.chatUtils.sendMessage) {
        window.chatUtils.sendMessage = window.sendMessageToFirebase;
    }

    console.log("全局变量和功能初始化完成");
}

/**
 * 问题2: 优化页面间导航和密码验证
 * 确保用户在切换页面时不需要重复密码验证
 */
function enhanceNavigation() {
    // 检测当前页面类型
    const isIndexPage = document.getElementById('introScreen') !== null;
    const isChatPage = document.querySelector('.chat-page') !== null;
    const isFunctionsPage = document.querySelector('.functions-page') !== null;

    // 添加页面类型标记
    document.body.dataset.pageType = isIndexPage ? 'index' :
        isChatPage ? 'chat' :
            isFunctionsPage ? 'functions' : 'unknown';

    // 页面特定的增强
    if (isIndexPage) {
        // 主页特定的修复
        enhanceIndexPage();
    } else if (isChatPage) {
        // 聊天页面特定的修复
        enhanceChatPage();
    } else if (isFunctionsPage) {
        // 功能页面特定的修复
        enhanceFunctionsPage();
    }

    // 为所有页面添加返回主页的按钮（除了主页自己）
    if (!isIndexPage) {
        addHomeButton();
    }

    console.log("页面导航增强完成");
}

/**
 * 增强主页功能
 */
function enhanceIndexPage() {
    // 确保密码层仅在需要时显示
    const passwordLayer = document.getElementById('passwordLayer');
    if (passwordLayer) {
        // 检查sessionStorage中是否有密码
        if (sessionStorage.getItem('current_password')) {
            passwordLayer.style.display = 'none';
            window.userVerified = true;
        } else {
            passwordLayer.style.display = 'flex';
        }
    }
}

/**
 * 增强聊天页面功能
 */
function enhanceChatPage() {
    // 确保未验证用户无法访问聊天
    if (!window.userVerified && !sessionStorage.getItem('current_password')) {
        // 如果未验证，显示密码层或重定向到主页
        const passwordLayer = document.getElementById('passwordLayer');
        if (passwordLayer) {
            passwordLayer.style.display = 'flex';
        } else {
            // 如果没有密码层，重定向到主页
            window.location.href = 'index.html';
        }
    }

    // 使发送消息功能在全局可用
    if (typeof window.sendMessageToFirebase === 'function') {
        window.chatUtils.sendMessage = window.sendMessageToFirebase;
    }
}

/**
 * 增强功能页面
 */
function enhanceFunctionsPage() {
    // 类似上面的检查和增强
    if (!window.userVerified && !sessionStorage.getItem('current_password')) {
        const passwordLayer = document.getElementById('passwordLayer');
        if (passwordLayer) {
            passwordLayer.style.display = 'flex';
        } else {
            window.location.href = 'index.html';
        }
    }
}

/**
 * 添加返回主页按钮
 */
function addHomeButton() {
    // 检查是否已存在
    if (document.getElementById('homeButton')) return;

    // 创建返回按钮
    const homeButton = document.createElement('a');
    homeButton.id = 'homeButton';
    homeButton.href = 'index.html';
    homeButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
    `;
    homeButton.title = "返回首页";
    homeButton.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 1000;
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        text-decoration: none;
        transition: background 0.3s;
    `;

    // 添加悬停效果
    homeButton.addEventListener('mouseover', function () {
        this.style.background = 'rgba(255, 255, 255, 0.3)';
    });
    homeButton.addEventListener('mouseout', function () {
        this.style.background = 'rgba(255, 255, 255, 0.2)';
    });

    // 添加到DOM
    document.body.appendChild(homeButton);
}

/**
 * 问题3: 改进在线状态管理
 * 处理多设备登录和网络断开问题
 */
function improveOnlineStatus() {
    // 只在聊天功能激活时执行
    if (!window.userVerified && !window.firebase) return;

    try {
        const database = window.firebase.database();
        const statusRef = database.ref('status');
        const connectedRef = database.ref('.info/connected');

        // 优化会话ID，使用设备信息和随机ID
        const deviceId = getDeviceId();
        window.sessionId = deviceId + '-' + Date.now().toString();

        // 优化状态更新
        connectedRef.on('value', (snap) => {
            if (snap.val() === true) {
                // 设备在线，但只有在用户已验证时才显示
                if (window.userVerified) {
                    const userStatusRef = statusRef.child(window.sessionId);

                    // 设置当前用户为在线
                    userStatusRef.set({
                        online: true,
                        lastActive: firebase.database.ServerValue.TIMESTAMP,
                        user: getUserName(),
                        device: getDeviceInfo(),
                        reconnected: true
                    });

                    // 断开连接时更新状态
                    userStatusRef.onDisconnect().update({
                        online: false,
                        lastActive: firebase.database.ServerValue.TIMESTAMP
                    });
                }
            }
        });

        // 清理过期状态
        cleanupOldStatuses(statusRef);

        console.log("在线状态管理增强完成");
    } catch (error) {
        console.error("在线状态增强失败:", error);
    }
}

/**
 * 获取设备唯一ID
 */
function getDeviceId() {
    // 尝试获取存储的设备ID
    let deviceId = localStorage.getItem('device_id');

    // 如果没有，创建一个新ID
    if (!deviceId) {
        deviceId = 'device_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('device_id', deviceId);
    }

    return deviceId;
}

/**
 * 获取当前用户名
 */
function getUserName() {
    try {
        const userSelect = document.getElementById('userSelect');
        return userSelect ? userSelect.value : 'unknown';
    } catch (e) {
        return 'unknown';
    }
}

/**
 * 获取设备信息
 */
function getDeviceInfo() {
    const ua = navigator.userAgent;
    let deviceInfo = 'unknown';

    if (/Android/i.test(ua)) {
        deviceInfo = 'Android';
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
        deviceInfo = 'iOS';
    } else if (/Windows/i.test(ua)) {
        deviceInfo = 'Windows';
    } else if (/Mac/i.test(ua)) {
        deviceInfo = 'Mac';
    } else if (/Linux/i.test(ua)) {
        deviceInfo = 'Linux';
    }

    return deviceInfo;
}

/**
 * 清理旧的在线状态
 */
function cleanupOldStatuses(statusRef) {
    setInterval(() => {
        const cutoff = Date.now() - 3600000; // 1小时前

        statusRef.once('value', (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                const userData = childSnapshot.val();

                // 删除超过1小时未更新的状态
                if (userData.lastActive && userData.lastActive < cutoff) {
                    statusRef.child(childSnapshot.key).remove();
                }

                // 删除在线但无活动的用户
                if (userData.online === true &&
                    userData.lastActive &&
                    userData.lastActive < (Date.now() - 300000)) { // 5分钟
                    statusRef.child(childSnapshot.key).update({ online: false });
                }
            });
        });
    }, 300000); // 每5分钟运行一次
}

/**
 * 问题4: 添加媒体上传进度指示
 */
function enhanceMediaUpload() {
    // 创建并添加全局进度条
    const uploadProgressContainer = document.createElement('div');
    uploadProgressContainer.id = 'uploadProgressContainer';
    uploadProgressContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: rgba(0, 0, 0, 0.1);
        z-index: 10000;
        display: none;
    `;

    const uploadProgressBar = document.createElement('div');
    uploadProgressBar.id = 'uploadProgressBar';
    uploadProgressBar.style.cssText = `
        height: 100%;
        width: 0%;
        background: linear-gradient(45deg, #ff758c, #ff7eb3);
        transition: width 0.2s;
    `;

    uploadProgressContainer.appendChild(uploadProgressBar);
    document.body.appendChild(uploadProgressContainer);

    // 添加上传状态提示
    const uploadStatusText = document.createElement('div');
    uploadStatusText.id = 'uploadStatusText';
    uploadStatusText.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        padding: 5px 15px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border-radius: 20px;
        font-size: 12px;
        z-index: 10001;
        display: none;
    `;
    document.body.appendChild(uploadStatusText);

    // 提供全局上传进度方法
    window.mediaUpload = {
        showProgress: function (show = true) {
            uploadProgressContainer.style.display = show ? 'block' : 'none';
        },

        updateProgress: function (percent) {
            uploadProgressBar.style.width = `${percent}%`;

            // 如果百分比是100，2秒后隐藏进度条
            if (percent >= 100) {
                setTimeout(() => {
                    this.showProgress(false);
                    this.showStatus(false);
                }, 2000);
            }
        },

        showStatus: function (show = true, text = '') {
            uploadStatusText.style.display = show ? 'block' : 'none';
            if (text) {
                uploadStatusText.textContent = text;
            }
        },

        // 优化的文件上传方法，替换原有上传函数
        uploadFile: function (file, type, callback) {
            if (!window.firebase || !window.firebase.storage) {
                alert('Firebase存储未初始化，无法上传文件');
                return;
            }

            // 检查文件大小
            const maxSizes = {
                'image': 5 * 1024 * 1024,  // 5MB
                'video': 50 * 1024 * 1024, // 50MB
                'audio': 5 * 1024 * 1024   // 5MB
            };

            if (file.size > maxSizes[type]) {
                alert(`${type === 'image' ? '图片' : type === 'video' ? '视频' : '音频'}不能超过${maxSizes[type] / 1024 / 1024}MB!`);
                return;
            }

            // 显示进度指示
            this.showProgress(true);
            this.updateProgress(0);
            this.showStatus(true, `正在上传${type === 'image' ? '图片' : type === 'video' ? '视频' : '语音'}...`);

            try {
                // 创建唯一的文件名
                const fileName = `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
                const sender = getUserName();
                const storageRef = window.firebase.storage().ref();
                const fileRef = storageRef.child(`${sender}/${fileName}`);

                // 创建上传任务
                const uploadTask = fileRef.put(file);

                // 监听上传进度
                uploadTask.on('state_changed',
                    (snapshot) => {
                        // 更新进度
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        this.updateProgress(progress);
                    },
                    (error) => {
                        // 上传错误
                        console.error('上传失败:', error);
                        this.showStatus(true, '上传失败，请重试');
                        setTimeout(() => {
                            this.showProgress(false);
                            this.showStatus(false);
                        }, 3000);

                        if (callback) callback(null, error);
                    },
                    () => {
                        // 上传完成获取下载链接
                        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                            this.updateProgress(100);
                            this.showStatus(true, '上传完成！');

                            if (callback) callback(downloadURL, null);
                        });
                    }
                );
            } catch (error) {
                console.error('上传过程错误:', error);
                this.showStatus(true, '上传过程出错');
                setTimeout(() => {
                    this.showProgress(false);
                    this.showStatus(false);
                }, 3000);

                if (callback) callback(null, error);
            }
        }
    };

    console.log("媒体上传增强完成");
}

/**
 * 问题5: 修复样式和兼容性问题
 */
function fixStylingIssues() {
    // 修复聊天消息容器高度计算
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        // 使用相对高度而非固定像素
        chatMessages.style.height = 'calc(100% - 130px)';
        chatMessages.style.maxHeight = 'calc(100% - 130px)';

        // 添加resize事件监听，确保在窗口大小变化时调整
        window.addEventListener('resize', () => {
            adjustChatHeight();
        });

        // 立即调整一次
        adjustChatHeight();
    }

    // 修复移动端媒体面板位置
    fixMediaPanelPosition();

    // 添加浏览器兼容性检查
    checkBrowserCompatibility();

    console.log("样式和兼容性问题修复完成");
}

/**
 * 调整聊天高度适应不同设备
 */
function adjustChatHeight() {
    const chatMessages = document.getElementById('chatMessages');
    const chatContainer = document.getElementById('chatContainer');
    const chatHeader = document.querySelector('.chat-header');
    const chatInput = document.querySelector('.chat-input');
    const multimediaBar = document.querySelector('.multimedia-bar');

    if (!chatMessages || !chatContainer) return;

    // 计算高度
    let headerHeight = chatHeader ? chatHeader.offsetHeight : 0;
    let inputHeight = chatInput ? chatInput.offsetHeight : 0;
    let multimediaHeight = multimediaBar ? multimediaBar.offsetHeight : 0;

    // 考虑typing指示器
    const typingIndicator = document.getElementById('typingIndicator');
    let typingHeight = typingIndicator && typingIndicator.style.display !== 'none' ?
        typingIndicator.offsetHeight : 0;

    // 计算总高度
    let totalHeight = headerHeight + inputHeight + multimediaHeight + typingHeight;

    // 设置消息容器高度
    chatMessages.style.height = `calc(100% - ${totalHeight}px)`;
    chatMessages.style.maxHeight = `calc(100% - ${totalHeight}px)`;
}

/**
 * 修复媒体面板位置
 */
function fixMediaPanelPosition() {
    // 修复表情面板和媒体菜单位置
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // 获取事件函数
    const originalToggleEmojiPanel = window.toggleEmojiPanel;

    if (typeof originalToggleEmojiPanel === 'function') {
        // 重写表情面板方法
        window.toggleEmojiPanel = function () {
            // 先调用原函数创建面板
            originalToggleEmojiPanel();

            // 然后调整面板位置
            const emojiPanel = document.getElementById('emoji-panel');
            if (emojiPanel) {
                if (isMobile) {
                    // 移动设备上居中显示
                    emojiPanel.style.left = '50%';
                    emojiPanel.style.transform = 'translateX(-50%)';
                    emojiPanel.style.bottom = '80px';
                    emojiPanel.style.maxWidth = 'calc(100% - 40px)';
                }

                // 确保表情面板不超出视窗
                ensurePanelInViewport(emojiPanel);
            }
        };
    }

    // 尝试修复媒体菜单位置
    const mediaButton = document.getElementById('media-button');
    const mediaMenu = document.getElementById('media-menu');

    if (mediaButton && mediaMenu) {
        mediaButton.addEventListener('click', () => {
            if (isMobile) {
                // 移动设备上居中显示
                mediaMenu.style.left = '50%';
                mediaMenu.style.transform = 'translateX(-50%)';
                mediaMenu.style.bottom = '80px';
            }

            // 确保菜单不超出视窗
            ensurePanelInViewport(mediaMenu);
        });
    }
}

/**
 * 确保面板在视窗内
 */
function ensurePanelInViewport(element) {
    if (!element) return;

    setTimeout(() => {
        const rect = element.getBoundingClientRect();

        // 检查是否超出右边
        if (rect.right > window.innerWidth) {
            element.style.left = `${window.innerWidth - rect.width - 10}px`;
            element.style.transform = 'none';
        }

        // 检查是否超出左边
        if (rect.left < 0) {
            element.style.left = '10px';
            element.style.transform = 'none';
        }

        // 检查是否超出底部
        if (rect.bottom > window.innerHeight) {
            element.style.bottom = `${window.innerHeight - rect.top + 10}px`;
        }
    }, 10);
}

/**
 * 检查浏览器兼容性
 */
function checkBrowserCompatibility() {
    const compatibilityIssues = [];

    // 检查Service Worker支持
    if (!('serviceWorker' in navigator)) {
        compatibilityIssues.push('您的浏览器不支持Service Worker，无法离线使用');
    }

    // 检查音频录制支持
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        compatibilityIssues.push('您的浏览器不支持录音功能');
    }

    // 检查WebRTC支持
    if (!window.RTCPeerConnection) {
        compatibilityIssues.push('您的浏览器不支持WebRTC特性');
    }

    // 检查加密API支持
    if (!window.crypto || !window.crypto.subtle) {
        compatibilityIssues.push('您的浏览器不支持加密API，消息安全性可能受到影响');
    }

    // 检查IndexedDB支持
    if (!window.indexedDB) {
        compatibilityIssues.push('您的浏览器不支持IndexedDB，离线存储功能可能受限');
    }

    // 如果有兼容性问题，显示警告
    if (compatibilityIssues.length > 0) {
        console.warn('浏览器兼容性问题:', compatibilityIssues);

        // 创建警告提示
        const warningEl = document.createElement('div');
        warningEl.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(255, 200, 50, 0.9);
            color: #333;
            padding: 8px 12px;
            border-radius: 5px;
            font-size: 12px;
            max-width: 250px;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            cursor: pointer;
        `;
        warningEl.textContent = '检测到浏览器兼容性问题，某些功能可能无法使用';
        warningEl.addEventListener('click', () => {
            alert('浏览器兼容性问题:\n' + compatibilityIssues.join('\n'));
        });

        document.body.appendChild(warningEl);
    }
}

// 立即执行一些重要的修复
fixGlobalVariables(); 