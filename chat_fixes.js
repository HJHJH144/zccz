/**
 * 聊天功能修复脚本
 * 解决聊天消息发送、接收和加密问题
 */

(function () {
    console.log('聊天功能修复脚本已加载');

    // 在DOM加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixChatFunctions);
    } else {
        fixChatFunctions();
    }

    /**
     * 修复聊天功能
     */
    function fixChatFunctions() {
        console.log('正在修复聊天功能...');

        // 修复Firebase连接
        fixFirebaseConnection();

        // 修复用户验证
        fixUserVerification();

        // 修复聊天消息发送
        fixMessageSending();

        // 监控聊天状态
        monitorChatStatus();
    }

    /**
     * 修复Firebase连接
     */
    function fixFirebaseConnection() {
        // 检查Firebase是否已加载
        if (typeof firebase === 'undefined') {
            console.error('Firebase未加载，正在尝试加载');
            loadFirebaseSDK();
            return;
        }

        // 检查是否已初始化Firebase
        try {
            firebase.app();
            console.log('Firebase已初始化');
            reconnectFirebaseRefs();
        } catch (e) {
            console.error('Firebase未初始化，正在尝试初始化');
            initializeFirebase();
        }

        // 检查在线状态
        try {
            const connectedRef = firebase.database().ref('.info/connected');
            connectedRef.on('value', (snap) => {
                const isConnected = snap.val() === true;
                updateConnectionStatus(isConnected);
            });
        } catch (e) {
            console.error('无法监听连接状态:', e);
        }
    }

    /**
     * 加载Firebase SDK
     */
    function loadFirebaseSDK() {
        // 加载Firebase App
        const appScript = document.createElement('script');
        appScript.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js';
        appScript.async = false;
        appScript.onload = function () {
            console.log('Firebase App SDK加载成功');

            // 加载Firebase Database
            const dbScript = document.createElement('script');
            dbScript.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js';
            dbScript.async = false;
            dbScript.onload = function () {
                console.log('Firebase Database SDK加载成功');

                // 加载Firebase Storage
                const storageScript = document.createElement('script');
                storageScript.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-storage.js';
                storageScript.async = false;
                storageScript.onload = function () {
                    console.log('Firebase Storage SDK加载成功');
                    initializeFirebase();
                };
                storageScript.onerror = function () {
                    console.error('Firebase Storage SDK加载失败');
                };
                document.head.appendChild(storageScript);
            };
            dbScript.onerror = function () {
                console.error('Firebase Database SDK加载失败');
            };
            document.head.appendChild(dbScript);
        };
        appScript.onerror = function () {
            console.error('Firebase App SDK加载失败');
        };
        document.head.appendChild(appScript);
    }

    /**
     * 初始化Firebase
     */
    function initializeFirebase() {
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

        try {
            // 初始化Firebase
            firebase.initializeApp(firebaseConfig);
            console.log('Firebase初始化成功');

            // 设置全局引用
            window.database = firebase.database();
            window.messagesRef = window.database.ref('messages');
            window.statusRef = window.database.ref('status');
            window.typingRef = window.database.ref('typing');
            window.storage = firebase.storage();
            window.storageRef = window.storage.ref();

            // 重新加载消息
            if (typeof window.loadFirebaseMessages === 'function') {
                window.loadFirebaseMessages();
            } else {
                console.warn('消息加载函数不存在，可能需要刷新页面');
            }
        } catch (error) {
            console.error('Firebase初始化失败:', error);
        }
    }

    /**
     * 重新连接Firebase引用
     */
    function reconnectFirebaseRefs() {
        try {
            // 设置全局引用（如果不存在）
            if (typeof window.database === 'undefined') {
                window.database = firebase.database();
            }
            if (typeof window.messagesRef === 'undefined') {
                window.messagesRef = window.database.ref('messages');
            }
            if (typeof window.statusRef === 'undefined') {
                window.statusRef = window.database.ref('status');
            }
            if (typeof window.typingRef === 'undefined') {
                window.typingRef = window.database.ref('typing');
            }
            if (typeof window.storage === 'undefined') {
                window.storage = firebase.storage();
            }
            if (typeof window.storageRef === 'undefined') {
                window.storageRef = window.storage.ref();
            }

            console.log('Firebase引用已重新连接');
        } catch (error) {
            console.error('Firebase引用重连失败:', error);
        }
    }

    /**
     * 更新连接状态
     */
    function updateConnectionStatus(isConnected) {
        const statusIndicator = document.getElementById('statusIndicator');
        if (statusIndicator) {
            statusIndicator.textContent = isConnected ? '在线' : '连接中...';
            statusIndicator.style.color = isConnected ? '#4CAF50' : '#FFC107';
        }
    }

    /**
     * 修复用户验证
     */
    function fixUserVerification() {
        // 检查是否已经验证
        if (typeof window.userVerified === 'undefined') {
            window.userVerified = false;
        }

        // 检查是否有密码
        if (typeof window.encryptionKey === 'undefined') {
            window.encryptionKey = '';
        }

        // 尝试从本地存储加载密码
        const savedPassword = localStorage.getItem('lcz_zc_global_password');
        if (savedPassword && !window.encryptionKey) {
            window.encryptionKey = savedPassword;
            window.userVerified = true;
            console.log('已从本地存储恢复用户密码');

            // 隐藏密码层
            const passwordLayer = document.getElementById('passwordLayer');
            if (passwordLayer) {
                passwordLayer.style.display = 'none';
            }
        }
        // 尝试从会话存储加载密码
        else if (!window.encryptionKey) {
            const sessionPassword = sessionStorage.getItem('current_password');
            if (sessionPassword) {
                window.encryptionKey = sessionPassword;
                window.userVerified = true;
                console.log('已从会话存储恢复用户密码');

                // 隐藏密码层
                const passwordLayer = document.getElementById('passwordLayer');
                if (passwordLayer) {
                    passwordLayer.style.display = 'none';
                }

                // 保存到本地存储以便跨页面使用
                localStorage.setItem('lcz_zc_global_password', sessionPassword);
            }
        }

        // 修复解锁按钮事件
        fixUnlockButton();

        // 修复密码验证层显示
        fixPasswordLayer();
    }

    /**
     * 修复解锁按钮事件
     */
    function fixUnlockButton() {
        const unlockBtn = document.getElementById('unlockBtn');
        const chatPassword = document.getElementById('chatPassword');
        const passwordError = document.getElementById('passwordError');

        if (unlockBtn && chatPassword) {
            // 移除现有事件处理程序
            const newBtn = unlockBtn.cloneNode(true);
            unlockBtn.parentNode.replaceChild(newBtn, unlockBtn);

            // 添加新事件处理程序
            newBtn.addEventListener('click', function () {
                const password = chatPassword.value.trim();
                if (!password) {
                    if (passwordError) {
                        passwordError.textContent = '请输入密码';
                        passwordError.style.display = 'block';
                    } else {
                        alert('请输入密码');
                    }
                    return;
                }

                // 设置加密密钥和用户验证状态
                window.encryptionKey = password;
                window.userVerified = true;

                // 保存到本地存储和会话存储
                localStorage.setItem('lcz_zc_global_password', password);
                sessionStorage.setItem('current_password', password);

                // 隐藏密码层
                const passwordLayer = document.getElementById('passwordLayer');
                if (passwordLayer) {
                    passwordLayer.style.display = 'none';
                }

                // 尝试初始化聊天
                if (typeof window.initializeChat === 'function') {
                    window.initializeChat();
                } else {
                    console.warn('聊天初始化函数不存在，尝试重新绑定事件');
                    bindChatEvents();
                }

                console.log('用户验证成功');
            });

            // 绑定回车键
            chatPassword.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    newBtn.click();
                }
            });
        }
    }

    /**
     * 修复密码验证层显示
     */
    function fixPasswordLayer() {
        const passwordLayer = document.getElementById('passwordLayer');

        if (passwordLayer) {
            // 如果用户已验证，隐藏密码层
            if (window.userVerified) {
                passwordLayer.style.display = 'none';
            } else {
                // 否则显示密码层
                passwordLayer.style.display = 'flex';
            }
        }
    }

    /**
     * 修复消息发送功能
     */
    function fixMessageSending() {
        // 全局化sendMessageToFirebase函数以确保它可以在任何页面调用
        window.sendMessageToFirebase = async function (type = 'text', content = null) {
            if (!window.userVerified || typeof window.encryptionKey === 'undefined' || !window.encryptionKey) {
                alert('请先输入密码解锁聊天');
                return;
            }

            try {
                // 确保Firebase引用存在
                if (typeof window.messagesRef === 'undefined' || !window.messagesRef) {
                    reconnectFirebaseRefs();
                }

                // 获取用户选择
                const userSelect = document.getElementById('userSelect');
                const sender = userSelect ? userSelect.value : 'unknown';
                const sendBtn = document.getElementById('sendBtn');

                // 禁用发送按钮防止重复发送
                if (sendBtn) {
                    sendBtn.disabled = true;
                    sendBtn.textContent = '发送中...';
                }

                // 创建基本消息对象
                const newMessage = {
                    sender: sender,
                    timestamp: firebase.database.ServerValue.TIMESTAMP,
                    type: type
                };

                // 根据消息类型处理内容
                if (type === 'text') {
                    const messageInput = document.getElementById('messageInput');
                    const message = messageInput ? messageInput.value.trim() : '';
                    if (!message) {
                        if (sendBtn) {
                            sendBtn.disabled = false;
                            sendBtn.textContent = '发送';
                        }
                        return;
                    }

                    try {
                        // 使用增强型加密
                        if (typeof window.encryptMessage === 'function') {
                            newMessage.text = await window.encryptMessage(message);
                        } else {
                            // 基本加密
                            newMessage.text = CryptoJS.AES.encrypt(message, window.encryptionKey).toString();
                        }

                        // 添加消息摘要用于验证
                        newMessage.digest = CryptoJS.SHA256(message).toString().substring(0, 16);

                        // 推送消息到Firebase
                        await window.messagesRef.push(newMessage);
                        console.log('消息发送成功');

                        // 清空输入框
                        if (messageInput) {
                            messageInput.value = '';
                        }
                    } catch (error) {
                        console.error('消息发送失败:', error);
                        alert('消息发送失败，请重试！');
                    }
                } else if (['image', 'video', 'audio'].includes(type) && content) {
                    // 处理多媒体消息上传
                    try {
                        // 创建唯一的文件名
                        const fileName = `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
                        const fileRef = window.storageRef.child(`${sender}/${fileName}`);

                        // 上传文件到Firebase Storage
                        const snapshot = await fileRef.put(content);

                        // 获取下载URL
                        const downloadURL = await snapshot.ref.getDownloadURL();

                        // 加密URL
                        if (typeof window.encryptMessage === 'function') {
                            newMessage.url = await window.encryptMessage(downloadURL);
                        } else {
                            newMessage.url = CryptoJS.AES.encrypt(downloadURL, window.encryptionKey).toString();
                        }

                        // 推送消息到Firebase
                        await window.messagesRef.push(newMessage);
                        console.log('多媒体消息发送成功');
                    } catch (error) {
                        console.error('多媒体消息发送失败:', error);
                        alert(`${type}发送失败，请重试！`);
                    }
                }

                // 恢复发送按钮
                if (sendBtn) {
                    sendBtn.disabled = false;
                    sendBtn.textContent = '发送';
                }
            } catch (error) {
                console.error('消息发送系统错误:', error);
                alert('发送系统出现错误，请刷新页面重试');

                // 恢复发送按钮
                const sendBtn = document.getElementById('sendBtn');
                if (sendBtn) {
                    sendBtn.disabled = false;
                    sendBtn.textContent = '发送';
                }
            }
        };

        // 绑定聊天事件
        bindChatEvents();
    }

    /**
     * 绑定聊天事件
     */
    function bindChatEvents() {
        // 绑定聊天按钮
        const chatBtn = document.getElementById('chatBtn');
        const chatContainer = document.getElementById('chatContainer');
        const closeChatBtn = document.getElementById('closeChatBtn');

        if (chatBtn && chatContainer) {
            chatBtn.onclick = function () {
                // 检查是否已验证
                if (!window.userVerified) {
                    const passwordLayer = document.getElementById('passwordLayer');
                    if (passwordLayer) {
                        passwordLayer.style.display = 'flex';
                    }
                    return;
                }

                chatContainer.style.display = 'flex';
                chatContainer.classList.add('visible');
            };
        }

        if (closeChatBtn && chatContainer) {
            closeChatBtn.onclick = function () {
                chatContainer.style.display = 'none';
                chatContainer.classList.remove('visible');
            };
        }

        // 绑定发送消息功能
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            // 移除现有事件处理程序
            const newBtn = sendBtn.cloneNode(true);
            sendBtn.parentNode.replaceChild(newBtn, sendBtn);

            // 添加新事件处理程序
            newBtn.addEventListener('click', function () {
                if (typeof window.sendMessageToFirebase === 'function') {
                    window.sendMessageToFirebase();
                } else {
                    console.error('发送消息函数不存在');
                    alert('发送功能暂不可用，请刷新页面重试');
                }
            });
        }

        // 绑定回车键发送
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            // 移除现有事件处理程序
            const newInput = messageInput.cloneNode(true);
            messageInput.parentNode.replaceChild(newInput, messageInput);

            // 添加新事件处理程序
            newInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter' && typeof window.sendMessageToFirebase === 'function') {
                    window.sendMessageToFirebase();
                }
            });
        }
    }

    /**
     * 监控聊天状态
     */
    function monitorChatStatus() {
        // 每5秒检查一次状态
        setInterval(function () {
            // 检查Firebase连接
            if (typeof firebase === 'undefined' || !firebase.database) {
                console.warn('Firebase连接丢失，尝试重新连接');
                fixFirebaseConnection();
                return;
            }

            // 检查用户验证状态
            const passwordLayer = document.getElementById('passwordLayer');
            if (passwordLayer && window.userVerified) {
                passwordLayer.style.display = 'none';
            }

            // 检查消息加载
            if (typeof window.loadFirebaseMessages === 'function' &&
                document.getElementById('chatMessages') &&
                window.userVerified &&
                !document.getElementById('chatMessages').hasChildNodes()) {
                console.log('尝试加载聊天消息');
                window.loadFirebaseMessages();
            }
        }, 5000);
    }
})(); 