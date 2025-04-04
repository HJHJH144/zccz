// Firebase配置
const firebaseConfig = {
    apiKey: "AIzaSyD8Iwxm9wECPAA_wey6vCPeGFz_USv8-JI",
    authDomain: "zc-lcz-love-chat.firebaseapp.com",
    databaseURL: "https://zc-lcz-love-chat-default-rtdb.firebaseio.com",
    projectId: "zc-lcz-love-chat",
    storageBucket: "zc-lcz-love-chat.appspot.com",
    messagingSenderId: "404788494356",
    appId: "1:404788494356:web:b2e8a8a04f9d25fdcb2cc1"
};

// 初始化Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const messagesRef = database.ref('messages');
const statusRef = database.ref('status');
const typingRef = database.ref('typing');
// 初始化Firebase Storage用于多媒体上传
const storage = firebase.storage();
const storageRef = storage.ref();

// 加密密钥 - 你们的专属密钥，不会上传到服务器
let encryptionKey = '';

// 用于存储当前会话ID
let sessionId = Date.now().toString() + Math.floor(Math.random() * 1000);

// 用户已验证标志
let userVerified = false;

// 全局密码存储相关常量
const STORAGE_PREFIX = "lcz_zc_secure_";
const LOCAL_PASSWORD_KEY = STORAGE_PREFIX + "pwd_hash";
const LOCAL_SALT_KEY = STORAGE_PREFIX + "salt";
const LOCAL_VERIFICATION_KEY = STORAGE_PREFIX + "verification";
const GLOBAL_PASSWORD_ID = STORAGE_PREFIX + "global_pwd_id";
const MESSAGES_PASSWORD_ID = STORAGE_PREFIX + "messages_pwd_id";

document.addEventListener('DOMContentLoaded', function () {
    // 密码验证
    const passwordLayer = document.getElementById('passwordLayer');
    const chatPassword = document.getElementById('chatPassword');
    const unlockBtn = document.getElementById('unlockBtn');
    const passwordError = document.getElementById('passwordError');
    const shareBtn = document.getElementById('shareBtn');

    // 确保密码层最初显示
    passwordLayer.style.display = 'flex';
    userVerified = false;

    // 获取或生成加密盐值
    let salt = localStorage.getItem(LOCAL_SALT_KEY);
    if (!salt) {
        // 生成随机盐值 (32字节)
        const randomArray = new Uint8Array(32);
        window.crypto.getRandomValues(randomArray);
        salt = Array.from(randomArray).map(b => b.toString(16).padStart(2, '0')).join('');
        localStorage.setItem(LOCAL_SALT_KEY, salt);
    }

    // 增强版密码哈希函数 - 使用PBKDF2算法
    async function generateSecureHash(password, salt) {
        // 将密码和盐值转换为ArrayBuffer
        const encoder = new TextEncoder();
        const passwordData = encoder.encode(password);
        const saltData = encoder.encode(salt);

        // 使用密码导入密钥
        const passwordKey = await window.crypto.subtle.importKey(
            'raw',
            passwordData,
            { name: 'PBKDF2' },
            false,
            ['deriveBits']
        );

        // 使用PBKDF2导出密钥位 (50,000次迭代，增加暴力破解难度)
        const derivedBits = await window.crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: saltData,
                iterations: 50000,
                hash: 'SHA-256'
            },
            passwordKey,
            256
        );

        // 转换为十六进制字符串
        const hashArray = Array.from(new Uint8Array(derivedBits));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // 生成验证字符串 - 用于验证密码是否正确
    async function generateVerificationString(password) {
        // 创建一个固定的验证文本
        const verificationText = "zc_loves_lcz_verified_2024";

        // 使用AES-GCM加密验证文本
        const encoder = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );

        // 派生AES-GCM使用的密钥
        const key = await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode(salt),
                iterations: 10000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt']
        );

        // 生成随机IV
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        // 加密验证文本
        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            encoder.encode(verificationText)
        );

        // 组合IV和加密数据
        const encryptedArray = new Uint8Array(iv.length + encryptedData.byteLength);
        encryptedArray.set(iv, 0);
        encryptedArray.set(new Uint8Array(encryptedData), iv.length);

        // 转换为Base64字符串
        return btoa(String.fromCharCode.apply(null, encryptedArray));
    }

    // 验证密码是否正确
    async function verifyPassword(password, storedVerification) {
        try {
            // 解析Base64编码的验证字符串
            const encryptedArray = new Uint8Array(
                atob(storedVerification).split('').map(char => char.charCodeAt(0))
            );

            // 提取IV (前12字节)
            const iv = encryptedArray.slice(0, 12);

            // 提取加密数据
            const encryptedData = encryptedArray.slice(12);

            // 导入密钥材料
            const encoder = new TextEncoder();
            const keyMaterial = await window.crypto.subtle.importKey(
                'raw',
                encoder.encode(password),
                { name: 'PBKDF2' },
                false,
                ['deriveBits', 'deriveKey']
            );

            // 派生解密用的密钥
            const key = await window.crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: encoder.encode(salt),
                    iterations: 10000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['decrypt']
            );

            // 尝试解密
            const decryptedData = await window.crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                encryptedData
            );

            // 检查解密结果
            const decryptedText = new TextDecoder().decode(decryptedData);
            return decryptedText === "zc_loves_lcz_verified_2024";
        } catch (error) {
            console.error("验证失败:", error);
            return false;
        }
    }

    // 生成密码ID，用于标识不同的密码和确定是否需要重置消息
    async function generatePasswordId(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
    }

    // 将密码保存到所有Storage区域
    function saveGlobalPassword(password, passwordId) {
        // 保存到localStorage
        localStorage.setItem(GLOBAL_PASSWORD_ID, passwordId);

        // 保存到sessionStorage (用于当前会话共享)
        sessionStorage.setItem(GLOBAL_PASSWORD_ID, passwordId);
        sessionStorage.setItem('current_password', password);

        // 设置全局变量
        window.globalPasswordId = passwordId;
        window.currentPassword = password;

        // 将密码ID保存到数据库以便同步
        database.ref('settings/globalPasswordId').set(passwordId);
    }

    // 处理解锁按钮点击
    unlockBtn.addEventListener('click', async function () {
        const password = chatPassword.value.trim();
        if (!password) {
            passwordError.textContent = '请输入密码';
            passwordError.style.display = 'block';
            return;
        }

        try {
            // 检查本地存储中是否有验证字符串
            const storedVerification = localStorage.getItem(LOCAL_VERIFICATION_KEY);
            const storedHash = localStorage.getItem(LOCAL_PASSWORD_KEY);

            // 生成当前密码的ID
            const currentPasswordId = await generatePasswordId(password);

            // 如果没有存储的验证字符串，这是首次设置密码
            if (!storedVerification || !storedHash) {
                // 生成增强的密码哈希
                const secureHash = await generateSecureHash(password, salt);

                // 生成验证字符串
                const verification = await generateVerificationString(password);

                // 存储到本地
                localStorage.setItem(LOCAL_PASSWORD_KEY, secureHash);
                localStorage.setItem(LOCAL_VERIFICATION_KEY, verification);

                // 设置全局密码
                saveGlobalPassword(password, currentPasswordId);
                localStorage.setItem(MESSAGES_PASSWORD_ID, currentPasswordId);

                // 使用密码作为加密密钥
                encryptionKey = password;
                passwordLayer.style.display = 'none';
                userVerified = true;

                // 初始化聊天
                initializeChat();
                console.log("首次设置密码成功");

                // 在Firebase中存储一个随机标识符（不是真正的密码哈希）
                // 这样管理员无法获取真实密码
                const randomIdentifier = Math.random().toString(36).substring(2, 15) +
                    Math.random().toString(36).substring(2, 15);
                database.ref('settings/identifier').set(randomIdentifier);
            } else {
                // 生成当前输入密码的哈希
                const inputHash = await generateSecureHash(password, salt);

                // 首先比较哈希值（快速检查）
                if (inputHash === storedHash) {
                    // 再进行验证字符串验证（双重检查）
                    const isValid = await verifyPassword(password, storedVerification);

                    if (isValid) {
                        // 密码正确 - 检查是否与上次使用的密码相同
                        const storedPasswordId = localStorage.getItem(GLOBAL_PASSWORD_ID);
                        const messagesPasswordId = localStorage.getItem(MESSAGES_PASSWORD_ID);

                        // 更新全局密码
                        saveGlobalPassword(password, currentPasswordId);

                        // 检查是否需要重置消息
                        if (messagesPasswordId && messagesPasswordId !== currentPasswordId) {
                            // 提示用户密码已更改，将清除所有消息
                            if (confirm('检测到密码已更改。为确保安全，所有聊天记录将被清除。是否继续？')) {
                                // 清除消息
                                await messagesRef.remove();
                                // 更新消息密码ID
                                localStorage.setItem(MESSAGES_PASSWORD_ID, currentPasswordId);
                            } else {
                                // 用户取消，提示需要使用原密码
                                passwordError.textContent = '请使用原密码登录或确认清除消息';
                                passwordError.style.display = 'block';
                                return;
                            }
                        }

                        // 密码正确
                        encryptionKey = password;
                        passwordLayer.style.display = 'none';
                        userVerified = true;
                        initializeChat();
                        console.log("密码验证成功");
                    } else {
                        // 验证失败
                        passwordError.textContent = '密码不正确，请重试';
                        passwordError.style.display = 'block';
                        console.log("密码验证失败 - 验证字符串不匹配");
                    }
                } else {
                    // 密码错误
                    passwordError.textContent = '密码不正确，请重试';
                    passwordError.style.display = 'block';
                    console.log("密码验证失败 - 哈希不匹配");
                }
            }
        } catch (error) {
            console.error("密码处理过程中出错:", error);
            passwordError.textContent = '系统错误，请重试';
            passwordError.style.display = 'block';
        }
    });

    // 按回车键提交密码
    chatPassword.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            unlockBtn.click();
        }
    });

    // 尝试从会话存储中获取密码 (用于页面间共享)
    const sessionPassword = sessionStorage.getItem('current_password');
    if (sessionPassword) {
        chatPassword.value = sessionPassword;
        // 自动点击解锁按钮尝试验证
        setTimeout(() => {
            unlockBtn.click();
        }, 500);
    } else {
        // 如果没有会话密码，尝试从URL参数获取密码
        const urlParams = new URLSearchParams(window.location.search);
        const autoPassword = urlParams.get('p');
        if (autoPassword) {
            chatPassword.value = autoPassword;
            // 自动清除URL参数
            window.history.replaceState({}, document.title, window.location.pathname);
            // 自动点击解锁按钮尝试验证
            setTimeout(() => {
                unlockBtn.click();
            }, 500);
        }
    }

    // 分享功能
    if (shareBtn) {
        shareBtn.addEventListener('click', function () {
            if (!userVerified || !encryptionKey) {
                alert('请先解锁聊天室');
                return;
            }

            // 创建带密码的链接
            const currentUrl = window.location.href.split('?')[0]; // 移除现有参数
            const shareUrl = `${currentUrl}?p=${encodeURIComponent(encryptionKey)}`;

            // 尝试使用Web Share API
            if (navigator.share) {
                navigator.share({
                    title: 'zc和lcz的聊天室',
                    text: '点击链接进入我们的专属聊天室',
                    url: shareUrl
                }).catch(err => {
                    console.error('分享失败:', err);
                    copyToClipboard(shareUrl);
                });
            } else {
                // 后备方案：复制到剪贴板
                copyToClipboard(shareUrl);
            }
        });
    }
});

// 复制到剪贴板
function copyToClipboard(text) {
    // 创建临时输入框
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();

    // 复制文本
    try {
        document.execCommand('copy');
        alert('链接已复制到剪贴板!');
    } catch (err) {
        console.error('复制失败:', err);
        alert('无法复制链接: ' + text);
    }

    // 移除临时元素
    document.body.removeChild(input);
}

// 增强型消息加密函数 - 使用AES-GCM模式
async function encryptMessage(message) {
    try {
        // 创建从密码派生的加密密钥
        const encoder = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(encryptionKey),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );

        // 使用当前会话ID和固定字符串作为盐值
        const saltString = "zc_lcz_secure_messaging_" + sessionId.substring(0, 8);

        // 派生AES-GCM密钥
        const key = await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode(saltString),
                iterations: 1000, // 较低的迭代次数以提高性能，因为我们在频繁加密消息
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt']
        );

        // 生成随机IV (12字节)
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        // 加密消息
        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            encoder.encode(message)
        );

        // 组合IV和加密数据
        const result = new Uint8Array(iv.length + encryptedData.byteLength);
        result.set(iv, 0);
        result.set(new Uint8Array(encryptedData), iv.length);

        // 转换为Base64字符串
        return btoa(String.fromCharCode.apply(null, result));
    } catch (error) {
        console.error('增强加密失败:', error);
        // 作为后备，使用CryptoJS
        return 'fallback:' + CryptoJS.AES.encrypt(message, encryptionKey).toString();
    }
}

// 增强型消息解密函数
async function decryptMessage(encrypted) {
    try {
        // 检查是否为后备加密
        if (encrypted.startsWith('fallback:')) {
            const fallbackData = encrypted.substring(9);
            const bytes = CryptoJS.AES.decrypt(fallbackData, encryptionKey);
            return bytes.toString(CryptoJS.enc.Utf8);
        }

        // 解析Base64字符串
        const encryptedArray = new Uint8Array(
            atob(encrypted).split('').map(char => char.charCodeAt(0))
        );

        // 提取IV和加密数据
        const iv = encryptedArray.slice(0, 12);
        const encryptedData = encryptedArray.slice(12);

        // 创建从密码派生的解密密钥
        const encoder = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(encryptionKey),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );

        // 使用和加密相同的盐值
        const saltString = "zc_lcz_secure_messaging_" + sessionId.substring(0, 8);

        // 派生AES-GCM密钥
        const key = await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode(saltString),
                iterations: 1000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );

        // 解密数据
        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            encryptedData
        );

        // 解码为字符串
        return new TextDecoder().decode(decryptedData);
    } catch (error) {
        console.error('解密失败:', error);

        // 尝试使用旧方法解密
        try {
            const bytes = CryptoJS.AES.decrypt(encrypted, encryptionKey);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (fallbackError) {
            console.error('后备解密也失败:', fallbackError);
            return '[无法解密的消息]';
        }
    }
}

// 初始化聊天功能
function initializeChat() {
    // 绑定发送消息事件
    document.getElementById('sendBtn').addEventListener('click', function () {
        sendMessageToFirebase();
    });

    // 按Enter键发送消息
    document.getElementById('messageInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessageToFirebase();
        }
    });

    // 加载实时消息
    loadFirebaseMessages();

    // 设置在线状态
    setupOnlineStatus();

    // 设置正在输入状态
    setupTypingIndicator();

    // 获取用户选择元素
    var userSelect = document.getElementById('userSelect');

    // 用户切换身份时更新在线状态
    userSelect.addEventListener('change', function () {
        if (statusRef) {
            statusRef.child(sessionId).update({
                user: userSelect.value,
                lastActive: firebase.database.ServerValue.TIMESTAMP
            });
        }
    });

    // 尝试加载多媒体扩展
    if (typeof enhanceChatWithMultimedia === 'function') {
        const chatContainer = document.getElementById('chatContainer');
        enhanceChatWithMultimedia(chatContainer);
    }
}

// 发送消息到Firebase
async function sendMessageToFirebase(type = 'text', content = null) {
    if (!userVerified) return;

    var userSelect = document.getElementById('userSelect');
    var sender = userSelect.value;
    var sendBtn = document.getElementById('sendBtn');

    // 禁用发送按钮防止重复发送
    sendBtn.disabled = true;
    sendBtn.textContent = '发送中...';

    // 创建基本消息对象
    var newMessage = {
        sender: sender,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        type: type
    };

    // 根据消息类型处理内容
    if (type === 'text') {
        var messageInput = document.getElementById('messageInput');
        var message = messageInput.value.trim();
        if (!message) {
            sendBtn.disabled = false;
            sendBtn.textContent = '发送';
            return;
        }

        try {
            // 使用增强型加密
            newMessage.text = await encryptMessage(message);
            // 添加消息摘要用于验证
            newMessage.digest = CryptoJS.SHA256(message).toString().substring(0, 16);

            // 推送消息到Firebase
            await messagesRef.push(newMessage);
            console.log('消息发送成功');
            // 清空输入框
            messageInput.value = '';
        } catch (error) {
            console.error('消息发送失败:', error);
            alert('消息发送失败，请重试！');
        } finally {
            // 恢复发送按钮
            sendBtn.disabled = false;
            sendBtn.textContent = '发送';
        }
    } else if (['image', 'video', 'audio'].includes(type) && content) {
        // 处理多媒体消息上传
        try {
            // 创建唯一的文件名
            const fileName = `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            const fileRef = storageRef.child(`${sender}/${fileName}`);

            // 上传文件到Firebase Storage
            const snapshot = await fileRef.put(content);

            // 获取下载URL
            const downloadURL = await snapshot.ref.getDownloadURL();

            // 加密URL
            newMessage.url = await encryptMessage(downloadURL);

            // 推送消息到Firebase
            await messagesRef.push(newMessage);
            console.log('多媒体消息发送成功');
        } catch (error) {
            console.error('多媒体消息发送失败:', error);
            alert(`${type}发送失败，请重试！`);
        } finally {
            // 恢复发送按钮
            sendBtn.disabled = false;
            sendBtn.textContent = '发送';
        }
    } else {
        sendBtn.disabled = false;
        sendBtn.textContent = '发送';
    }
}

// 加载Firebase消息
function loadFirebaseMessages() {
    if (!userVerified) return;

    const chatMessages = document.getElementById('chatMessages');

    // 监听新消息
    messagesRef.orderByChild('timestamp').on('child_added', function (snapshot) {
        const message = snapshot.val();

        // 创建消息元素占位符
        const msgElement = document.createElement('div');
        msgElement.classList.add('message', message.sender, 'message-loading');
        msgElement.innerHTML = '<div class="message-loading-indicator">消息加载中...</div>';
        chatMessages.appendChild(msgElement);

        // 异步处理消息内容
        processMessageContent(message, msgElement).then(() => {
            // 移除加载指示器
            msgElement.classList.remove('message-loading');
            // 滚动到最新消息
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }).catch(error => {
            console.error('处理消息失败:', error);
            msgElement.innerHTML = `
                <div class="message-sender">${message.sender}</div>
                <div class="message-content">[消息加载失败]</div>
            `;
        });
    });
}

// 异步处理消息内容
async function processMessageContent(message, msgElement) {
    try {
        // 格式化时间
        const date = new Date(message.timestamp);
        const formattedTime = date.getHours().toString().padStart(2, '0') + ':' +
            date.getMinutes().toString().padStart(2, '0');

        // 尝试解密消息
        let messageContent = '';

        if (message.type === 'text') {
            // 文本消息
            const decryptedText = await decryptMessage(message.text);
            messageContent = `<div class="message-content">${decryptedText}</div>`;
        } else if (message.type === 'image') {
            // 图片消息
            const imageUrl = await decryptMessage(message.url);
            messageContent = `
                <div class="message-content">
                    <img src="${imageUrl}" class="message-image" style="max-width: 200px; max-height: 200px; border-radius: 8px; cursor: pointer;" onclick="showFullScreenMedia('${imageUrl}', 'image')">
                </div>`;
        } else if (message.type === 'video') {
            // 视频消息
            const videoUrl = await decryptMessage(message.url);
            messageContent = `
                <div class="message-content">
                    <video controls class="message-video" style="max-width: 200px; max-height: 200px; border-radius: 8px; cursor: pointer;" onclick="showFullScreenMedia('${videoUrl}', 'video')">
                        <source src="${videoUrl}" type="video/mp4">
                        你的浏览器不支持视频标签
                    </video>
                </div>`;
        } else if (message.type === 'audio') {
            // 语音消息
            const audioUrl = await decryptMessage(message.url);
            messageContent = `
                <div class="message-content">
                    <audio controls class="message-audio" style="max-width: 200px;">
                        <source src="${audioUrl}" type="audio/mpeg">
                        你的浏览器不支持音频标签
                    </audio>
                </div>`;
        } else {
            // 默认为文本消息
            try {
                const decryptedText = await decryptMessage(message.text || '');
                messageContent = `<div class="message-content">${decryptedText}</div>`;
            } catch (e) {
                messageContent = `<div class="message-content">[未知消息类型]</div>`;
            }
        }

        msgElement.innerHTML = `
            <div class="message-sender">${message.sender}</div>
            ${messageContent}
            <div class="message-time">${formattedTime}</div>
        `;
    } catch (error) {
        console.error('消息处理失败:', error);
        msgElement.innerHTML = `
            <div class="message-sender">${message.sender}</div>
            <div class="message-content">[无法解密的消息]</div>
            <div class="message-time">--:--</div>
        `;
    }
}

// 全屏查看媒体内容
function showFullScreenMedia(url, type) {
    // 创建全屏查看容器
    const overlay = document.createElement('div');
    overlay.classList.add('media-overlay');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    `;

    // 添加关闭按钮
    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = `
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"></path>
        </svg>
    `;
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        cursor: pointer;
        z-index: 1001;
    `;
    closeBtn.onclick = () => document.body.removeChild(overlay);

    // 创建媒体元素
    let mediaElement;
    if (type === 'image') {
        mediaElement = document.createElement('img');
        mediaElement.src = url;
        mediaElement.style.cssText = `
            max-width: 90%;
            max-height: 80%;
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.5);
        `;
    } else if (type === 'video') {
        mediaElement = document.createElement('video');
        mediaElement.controls = true;
        mediaElement.autoplay = true;
        const source = document.createElement('source');
        source.src = url;
        source.type = 'video/mp4';
        mediaElement.appendChild(source);
        mediaElement.style.cssText = `
            max-width: 90%;
            max-height: 80%;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.5);
        `;
    }

    // 添加到DOM
    overlay.appendChild(closeBtn);
    overlay.appendChild(mediaElement);
    document.body.appendChild(overlay);
}

// 将全屏媒体查看功能暴露为全局函数以便内联使用
window.showFullScreenMedia = showFullScreenMedia;

// 设置在线状态
function setupOnlineStatus() {
    const statusIndicator = document.getElementById('statusIndicator');

    // 更新在线状态
    const userStatusRef = statusRef.child(sessionId);

    // 设置当前用户为在线
    userStatusRef.set({
        online: true,
        lastActive: firebase.database.ServerValue.TIMESTAMP,
        user: document.getElementById('userSelect').value
    });

    // 断开连接时自动设置为离线
    userStatusRef.onDisconnect().remove();

    // 监听连接状态
    const connectedRef = firebase.database().ref('.info/connected');
    connectedRef.on('value', (snap) => {
        if (snap.val() === true) {
            statusIndicator.textContent = '已连接';
            statusIndicator.style.color = '#4caf50';
        } else {
            statusIndicator.textContent = '连接中...';
            statusIndicator.style.color = 'orange';
        }
    });

    // 监听其他用户状态变化
    statusRef.on('value', (snapshot) => {
        const onlineUsers = [];
        snapshot.forEach((childSnapshot) => {
            const userData = childSnapshot.val();
            if (userData.online && childSnapshot.key !== sessionId) {
                onlineUsers.push(userData.user);
            }
        });

        if (onlineUsers.length > 0) {
            const otherUser = onlineUsers.join('、');
            statusIndicator.textContent = `${otherUser} 在线`;
            statusIndicator.style.color = '#4caf50';
        } else if (connectedRef.key) {
            statusIndicator.textContent = '已连接';
        }
    });
}

// 设置正在输入状态
function setupTypingIndicator() {
    const messageInput = document.getElementById('messageInput');
    const typingIndicator = document.getElementById('typingIndicator');
    const userSelect = document.getElementById('userSelect');
    let typingTimeout = null;

    // 当用户开始输入时
    messageInput.addEventListener('input', () => {
        // 更新正在输入状态
        typingRef.child(sessionId).set({
            typing: true,
            user: userSelect.value,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        // 清除之前的超时
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        // 设置5秒后自动清除状态
        typingTimeout = setTimeout(() => {
            typingRef.child(sessionId).remove();
        }, 5000);
    });

    // 监听其他用户的输入状态
    typingRef.on('value', (snapshot) => {
        let someoneTyping = false;
        let typingUser = '';

        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            // 只显示其他用户的输入状态
            if (childSnapshot.key !== sessionId && data.typing) {
                someoneTyping = true;
                typingUser = data.user;

                // 检查是否输入状态过期(超过6秒)
                const now = Date.now();
                if (now - data.timestamp > 6000) {
                    someoneTyping = false;
                    typingRef.child(childSnapshot.key).remove();
                }
            }
        });

        if (someoneTyping) {
            typingIndicator.textContent = `${typingUser} 正在输入...`;
            typingIndicator.style.display = 'block';
        } else {
            typingIndicator.style.display = 'none';
        }
    });

    // 发送消息后清除输入状态
    document.getElementById('sendBtn').addEventListener('click', () => {
        typingRef.child(sessionId).remove();
    });

    // 断开连接时清除输入状态
    typingRef.child(sessionId).onDisconnect().remove();
}

// 注册Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker 注册成功:', registration);
            })
            .catch(error => {
                console.log('Service Worker 注册失败:', error);
            });
    });
} 