/**
 * 修复测试脚本
 * 验证所有修复是否正确应用
 */

(function () {
    console.log('正在运行修复测试...');

    // 等待页面完全加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runTests);
    } else {
        setTimeout(runTests, 1000); // 等待其他脚本加载
    }

    /**
     * 运行所有测试
     */
    function runTests() {
        console.log('开始测试修复效果...');

        // 测试全局密码
        testGlobalPassword();

        // 测试加密功能
        testCryptoFixes();

        // 测试聊天功能
        testChatFixes();

        // 测试UI调整
        testUIFixes();

        // 打印系统状态
        setTimeout(printSystemStatus, 2000);
    }

    /**
     * 测试全局密码
     */
    function testGlobalPassword() {
        console.log('测试全局密码...');

        // 检查是否从本地存储加载了密码
        const savedPassword = localStorage.getItem('lcz_zc_global_password');
        if (savedPassword) {
            console.log('✓ 已找到本地存储的密码');

            // 验证密码是否正确应用
            if (window.encryptionKey === savedPassword && window.userVerified === true) {
                console.log('✓ 全局密码已正确加载');

                // 检查密码层是否隐藏
                const passwordLayer = document.getElementById('passwordLayer');
                if (passwordLayer && passwordLayer.style.display === 'none') {
                    console.log('✓ 密码层已正确隐藏');
                } else if (passwordLayer) {
                    console.warn('! 密码层未正确隐藏，尝试修复');
                    passwordLayer.style.display = 'none';
                }
            } else {
                console.warn('! 全局密码未正确应用，尝试修复');
                window.encryptionKey = savedPassword;
                window.userVerified = true;

                // 同步到会话存储
                sessionStorage.setItem('current_password', savedPassword);
            }
        } else {
            console.log('i 未找到本地存储的密码，等待用户输入');
        }
    }

    /**
     * 测试加密修复
     */
    function testCryptoFixes() {
        console.log('测试加密修复...');

        // 检查加密函数是否可用
        if (typeof window.encryptMessage === 'function' &&
            typeof window.decryptMessage === 'function') {
            console.log('✓ 加密函数已加载');

            // 加载了密码后尝试测试加密
            if (window.encryptionKey) {
                try {
                    const testMessage = 'test-message-' + Date.now();
                    window.encryptMessage(testMessage).then(encrypted => {
                        window.decryptMessage(encrypted).then(decrypted => {
                            if (decrypted === testMessage) {
                                console.log('✓ 加密/解密测试通过');
                                window.cryptoFixesApplied = true;
                            } else {
                                console.error('✗ 加密/解密测试失败 - 解密结果不匹配');
                            }
                        }).catch(err => {
                            console.error('✗ 解密测试失败:', err);
                        });
                    }).catch(err => {
                        console.error('✗ 加密测试失败:', err);
                    });
                } catch (error) {
                    console.error('✗ 加密/解密测试出错:', error);
                }
            } else {
                console.log('i 未设置加密密钥，无法测试加密功能');
            }
        } else {
            console.error('✗ 加密函数未找到');

            // 尝试重新加载加密修复脚本
            const script = document.createElement('script');
            script.src = 'crypto_fixes.js';
            script.async = false;
            document.body.appendChild(script);
        }
    }

    /**
     * 测试聊天修复
     */
    function testChatFixes() {
        console.log('测试聊天功能修复...');

        // 检查Firebase连接
        if (typeof firebase !== 'undefined' &&
            firebase.database &&
            typeof database !== 'undefined') {
            console.log('✓ Firebase连接已建立');

            // 检查数据库引用
            if (typeof window.messagesRef !== 'undefined' &&
                typeof window.statusRef !== 'undefined' &&
                typeof window.typingRef !== 'undefined') {
                console.log('✓ 数据库引用已创建');

                // 测试消息发送函数
                if (typeof window.sendMessageToFirebase === 'function') {
                    console.log('✓ 消息发送函数已加载');

                    // 检查聊天容器
                    const chatMessages = document.getElementById('chatMessages');
                    if (chatMessages) {
                        console.log('✓ 聊天消息容器已找到');

                        // 如果消息容器为空且用户已验证，尝试加载消息
                        if (window.userVerified && !chatMessages.hasChildNodes() &&
                            typeof window.loadFirebaseMessages === 'function') {
                            console.log('i 尝试加载聊天消息');
                            window.loadFirebaseMessages();
                        }
                    } else if (window.location.href.includes('chat.html')) {
                        console.warn('! 未找到聊天消息容器');
                    }
                } else {
                    console.warn('! 消息发送函数未加载，尝试修复');

                    // 尝试加载聊天修复脚本
                    const script = document.createElement('script');
                    script.src = 'chat_fixes.js';
                    script.async = false;
                    document.body.appendChild(script);
                }
            } else {
                console.warn('! 部分数据库引用未创建');

                // 尝试重新连接Firebase引用
                if (typeof reconnectFirebaseRefs === 'function') {
                    reconnectFirebaseRefs();
                }
            }
        } else {
            console.error('✗ Firebase连接失败');

            // 尝试重新加载Firebase SDK
            if (window.location.href.includes('chat.html')) {
                loadFirebaseScripts();
            }
        }

        // 检查密码验证功能
        const passwordLayer = document.getElementById('passwordLayer');
        if (passwordLayer) {
            if (window.userVerified) {
                if (passwordLayer.style.display === 'none') {
                    console.log('✓ 用户验证状态正确');
                } else {
                    console.warn('! 用户已验证但密码层仍显示');
                    // 尝试修复
                    passwordLayer.style.display = 'none';
                }
            } else {
                if (passwordLayer.style.display !== 'none') {
                    console.log('✓ 密码验证层显示正常');
                } else {
                    console.warn('! 用户未验证但密码层未显示');
                    // 尝试修复
                    passwordLayer.style.display = 'flex';
                }
            }
        } else {
            // 只在相关页面报错
            if (window.location.href.includes('chat.html') || window.location.href.includes('index.html')) {
                console.error('✗ 密码验证层未找到');
            }
        }
    }

    /**
     * 加载Firebase脚本
     */
    function loadFirebaseScripts() {
        // 如果还没有加载，加载Firebase脚本
        if (!document.querySelector('script[src*="firebase-app.js"]')) {
            const appScript = document.createElement('script');
            appScript.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js';
            appScript.async = false;

            const dbScript = document.createElement('script');
            dbScript.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js';
            dbScript.async = false;

            const storageScript = document.createElement('script');
            storageScript.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-storage.js';
            storageScript.async = false;

            document.head.appendChild(appScript);
            appScript.onload = function () {
                document.head.appendChild(dbScript);
                dbScript.onload = function () {
                    document.head.appendChild(storageScript);
                    storageScript.onload = function () {
                        console.log('Firebase脚本已重新加载');

                        // 尝试重新加载聊天修复脚本
                        const fixScript = document.createElement('script');
                        fixScript.src = 'chat_fixes.js';
                        fixScript.async = false;
                        document.body.appendChild(fixScript);
                    }
                }
            }
        }
    }

    /**
     * 测试UI修复
     */
    function testUIFixes() {
        console.log('测试UI修复...');

        // 测试功能中心按钮位置
        const functionsBtn = document.getElementById('functionsBtn');
        if (functionsBtn) {
            const actionButtons = functionsBtn.closest('.action-buttons');

            if (actionButtons) {
                const computedStyle = window.getComputedStyle(actionButtons);
                if (computedStyle.marginTop && parseInt(computedStyle.marginTop) < 15) {
                    console.warn('! 功能中心按钮位置可能未优化');

                    // 修复按钮位置
                    actionButtons.style.marginTop = '10px';
                    actionButtons.style.order = '-1';

                    // 增强按钮样式
                    functionsBtn.style.fontWeight = 'bold';
                    functionsBtn.style.boxShadow = '0 4px 15px rgba(255, 128, 0, 0.6)';
                    functionsBtn.style.padding = '15px 25px';

                    // 如果功能按钮是在最终屏幕内，确保它在内容之前
                    const finalMessage = document.querySelector('.final-message');
                    if (finalMessage) {
                        // 尝试插入到最前面
                        try {
                            finalMessage.insertBefore(actionButtons, finalMessage.firstChild);

                            // 更新样式
                            finalMessage.style.display = 'flex';
                            finalMessage.style.flexDirection = 'column';
                            finalMessage.style.alignItems = 'center';

                            console.log('✓ 已修复功能中心按钮位置');
                        } catch (e) {
                            console.error('✗ 修复功能中心按钮位置失败:', e);
                        }
                    }
                } else {
                    console.log('✓ 功能中心按钮位置正常');
                }
            } else {
                console.warn('! 未找到功能中心按钮容器');
            }
        }

        // 测试聊天按钮功能
        const chatBtn = document.getElementById('chatBtn');
        const chatContainer = document.getElementById('chatContainer');

        if (chatBtn && chatContainer) {
            console.log('✓ 聊天组件已找到');

            // 检查事件绑定
            if (chatBtn.onclick === null) {
                console.warn('! 聊天按钮可能未绑定事件');
                // 尝试重新绑定事件
                chatBtn.onclick = function () {
                    // 先检查是否已验证密码
                    if (!window.userVerified) {
                        // 显示密码验证层
                        const passwordLayer = document.getElementById('passwordLayer');
                        if (passwordLayer) {
                            passwordLayer.style.display = 'flex';
                        }
                        return;
                    }

                    chatContainer.style.display = 'flex';
                    chatContainer.classList.add('visible');
                };
                console.log('✓ 已重新绑定聊天按钮事件');
            } else {
                console.log('✓ 聊天按钮事件绑定正常');
            }
        }

        // 检查多媒体功能
        const mediaBar = document.querySelector('.multimedia-bar');
        if (mediaBar && window.location.href.includes('chat.html')) {
            console.log('✓ 多媒体工具栏已加载');
        } else if (window.location.href.includes('chat.html')) {
            console.warn('! 多媒体工具栏未找到，尝试加载');

            // 尝试加载多媒体修复脚本
            const script = document.createElement('script');
            script.src = 'chat_multimedia.js';
            script.async = false;
            document.body.appendChild(script);
        }
    }

    /**
     * 打印系统状态
     */
    function printSystemStatus() {
        console.log('--------系统状态报告--------');

        // 计算系统健康度
        let healthPoints = 100;
        let issues = [];

        // 检查基本组件
        if (typeof firebase === 'undefined') {
            healthPoints -= 25;
            issues.push('Firebase未加载');
        }

        if (typeof window.encryptMessage !== 'function') {
            healthPoints -= 15;
            issues.push('加密功能不可用');
        }

        if (typeof window.sendMessageToFirebase !== 'function') {
            healthPoints -= 20;
            issues.push('消息发送功能不可用');
        }

        if (window.location.href.includes('chat.html') && !document.querySelector('.multimedia-bar')) {
            healthPoints -= 10;
            issues.push('多媒体功能不可用');
        }

        if (typeof window.userVerified !== 'undefined') {
            const passwordLayer = document.getElementById('passwordLayer');
            if (window.userVerified && passwordLayer && passwordLayer.style.display !== 'none') {
                healthPoints -= 10;
                issues.push('密码验证状态异常');
            }
        } else {
            healthPoints -= 10;
            issues.push('用户验证状态未定义');
        }

        // 报告健康状态
        console.log(`系统健康度: ${healthPoints}%`);
        if (issues.length > 0) {
            console.log('检测到以下问题:');
            issues.forEach(issue => console.log(`- ${issue}`));

            // 如果健康度过低，尝试自动修复
            if (healthPoints < 60) {
                console.log('尝试自动修复系统...');

                // 重新加载关键修复脚本
                loadFixScripts();
            }
        } else {
            console.log('系统运行正常，未检测到问题');
        }
    }

    /**
     * 加载修复脚本
     */
    function loadFixScripts() {
        // 加载修复脚本
        const scripts = [
            { src: 'fix_loader.js', priority: 1 },
            { src: 'crypto_fixes.js', priority: 2 },
            { src: 'chat_fixes.js', priority: 3 },
            { src: 'media_fixes.js', priority: 4 }
        ];

        // 按优先级排序
        scripts.sort((a, b) => a.priority - b.priority);

        // 依次加载
        let index = 0;
        function loadNext() {
            if (index >= scripts.length) return;

            const script = document.createElement('script');
            script.src = scripts[index].src;
            script.async = false;
            script.onload = function () {
                console.log(`已加载修复脚本: ${scripts[index].src}`);
                index++;
                loadNext();
            };
            document.body.appendChild(script);
        }

        loadNext();
    }
})(); 