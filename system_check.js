/**
 * 系统功能检查脚本
 * 检查系统组件是否正确加载和运行
 */

// 立即执行函数
(function () {
    // 系统状态
    const systemStatus = {
        userVerified: false,
        encryptionReady: false,
        firebaseConnected: false,
        mediaSupport: {
            audio: false,
            video: false,
            image: true,
            recordingApi: false
        },
        browserCompatibility: {
            serviceWorker: false,
            webCrypto: false,
            indexedDB: false
        },
        fixesLoaded: false
    };

    // 系统检查完成后的回调函数
    let onCheckComplete = null;

    /**
     * 开始系统检查
     * @param {Function} callback - 检查完成后的回调
     */
    function startSystemCheck(callback) {
        onCheckComplete = callback;

        console.log('开始系统功能检查...');

        // 检查各项功能
        checkBrowserCompatibility();
        checkMediaSupport();
        checkUserVerification();
        checkFirebaseConnection();
        checkFixesLoaded();

        // 5秒后汇总结果
        setTimeout(reportResults, 5000);
    }

    /**
     * 检查浏览器兼容性
     */
    function checkBrowserCompatibility() {
        // 检查Service Worker支持
        systemStatus.browserCompatibility.serviceWorker = 'serviceWorker' in navigator;

        // 检查Web Crypto API
        systemStatus.browserCompatibility.webCrypto =
            window.crypto && typeof window.crypto.subtle !== 'undefined';

        // 检查IndexedDB支持
        systemStatus.browserCompatibility.indexedDB = 'indexedDB' in window;

        console.log('浏览器兼容性检查完成:', systemStatus.browserCompatibility);
    }

    /**
     * 检查媒体支持
     */
    function checkMediaSupport() {
        // 检查视频支持
        const videoElement = document.createElement('video');
        systemStatus.mediaSupport.video = !!videoElement.canPlayType;

        // 检查音频支持
        const audioElement = document.createElement('audio');
        systemStatus.mediaSupport.audio = !!audioElement.canPlayType;

        // 检查录音API支持
        systemStatus.mediaSupport.recordingApi =
            navigator.mediaDevices &&
            typeof navigator.mediaDevices.getUserMedia === 'function';

        console.log('媒体支持检查完成:', systemStatus.mediaSupport);
    }

    /**
     * 检查用户验证状态
     */
    function checkUserVerification() {
        // 检查是否全局变量
        if (typeof window.userVerified !== 'undefined') {
            systemStatus.userVerified = window.userVerified;
        }

        // 检查是否有加密密钥
        if (typeof window.encryptionKey !== 'undefined' && window.encryptionKey) {
            systemStatus.encryptionReady = true;
        }

        console.log('用户验证状态检查完成:', {
            userVerified: systemStatus.userVerified,
            encryptionReady: systemStatus.encryptionReady
        });
    }

    /**
     * 检查Firebase连接
     */
    function checkFirebaseConnection() {
        if (typeof firebase !== 'undefined' && firebase.database) {
            // 测试数据库连接
            const connectedRef = firebase.database().ref('.info/connected');
            connectedRef.on('value', (snap) => {
                systemStatus.firebaseConnected = !!snap.val();
                console.log('Firebase连接状态:', systemStatus.firebaseConnected ? '已连接' : '未连接');
            });
        } else {
            console.warn('未找到Firebase SDK');
            systemStatus.firebaseConnected = false;
        }
    }

    /**
     * 检查修复脚本是否加载
     */
    function checkFixesLoaded() {
        // 检查是否有修复脚本的标记
        if (document.getElementById('bug-fixes-script') ||
            document.getElementById('media-fixes-script') ||
            document.getElementById('style-fixes-script')) {
            systemStatus.fixesLoaded = true;
        }

        // 如果查询未能检测到修复脚本，根据特定对象或函数的存在判断
        if (!systemStatus.fixesLoaded) {
            if (typeof window.mediaUpload !== 'undefined' ||
                typeof window.mediaRecorderPolyfill !== 'undefined' ||
                document.getElementById('style-fixes')) {
                systemStatus.fixesLoaded = true;
            }
        }

        console.log('修复脚本加载状态:', systemStatus.fixesLoaded ? '已加载' : '未加载');
    }

    /**
     * 汇总并报告检查结果
     */
    function reportResults() {
        // 计算总体状态得分 (0-100)
        let systemScore = 0;
        let issues = [];

        // 基础浏览器兼容性 (30分)
        const compatibilityScore =
            (systemStatus.browserCompatibility.serviceWorker ? 10 : 0) +
            (systemStatus.browserCompatibility.webCrypto ? 15 : 0) +
            (systemStatus.browserCompatibility.indexedDB ? 5 : 0);
        systemScore += compatibilityScore;

        if (compatibilityScore < 30) {
            issues.push('浏览器兼容性不足，某些功能可能不可用');
        }

        // 媒体支持 (20分)
        const mediaScore =
            (systemStatus.mediaSupport.audio ? 5 : 0) +
            (systemStatus.mediaSupport.video ? 5 : 0) +
            (systemStatus.mediaSupport.image ? 5 : 0) +
            (systemStatus.mediaSupport.recordingApi ? 5 : 0);
        systemScore += mediaScore;

        if (mediaScore < 15) {
            issues.push('媒体功能支持不足，部分多媒体功能可能无法使用');
        }

        // 用户验证和加密 (20分)
        const securityScore =
            (systemStatus.userVerified ? 10 : 0) +
            (systemStatus.encryptionReady ? 10 : 0);
        systemScore += securityScore;

        if (securityScore < 20) {
            issues.push('用户未验证或加密未设置，请先输入密码');
        }

        // Firebase连接 (15分)
        const firebaseScore = systemStatus.firebaseConnected ? 15 : 0;
        systemScore += firebaseScore;

        if (firebaseScore === 0) {
            issues.push('无法连接到Firebase，请检查网络连接');
        }

        // 修复脚本 (15分)
        const fixesScore = systemStatus.fixesLoaded ? 15 : 0;
        systemScore += fixesScore;

        if (fixesScore === 0) {
            issues.push('修复脚本未加载，系统可能存在稳定性问题');
        }

        // 总结
        const summary = {
            score: systemScore,
            status: systemScore >= 80 ? '良好' : systemScore >= 60 ? '一般' : '差',
            issues: issues,
            details: systemStatus
        };

        console.log('系统检查完成! 总体得分:', summary.score, '状态:', summary.status);

        if (issues.length > 0) {
            console.warn('系统存在以下问题:', issues);
        }

        // 调用回调函数
        if (typeof onCheckComplete === 'function') {
            onCheckComplete(summary);
        }

        // 如果有严重问题且分数低于60，尝试修复
        if (systemScore < 60) {
            attemptSystemRecovery();
        }
    }

    /**
     * 尝试修复系统问题
     */
    function attemptSystemRecovery() {
        console.log('尝试修复系统问题...');

        // 加载修复脚本
        if (!systemStatus.fixesLoaded) {
            loadFixScripts();
        }

        // 重新连接Firebase
        if (!systemStatus.firebaseConnected && typeof firebase !== 'undefined') {
            console.log('尝试重新连接Firebase...');
            try {
                // 尝试重新初始化
                firebase.app().delete().then(() => {
                    // 重新初始化
                    if (typeof firebaseConfig !== 'undefined') {
                        firebase.initializeApp(firebaseConfig);
                        console.log('Firebase重新初始化完成');
                    }
                }).catch(err => {
                    console.error('Firebase重置失败:', err);
                });
            } catch (err) {
                console.error('Firebase恢复失败:', err);
            }
        }

        console.log('系统恢复尝试完成');
    }

    /**
     * 加载修复脚本
     */
    function loadFixScripts() {
        // 检查修复加载器
        if (!document.getElementById('fix-loader-script')) {
            console.log('正在加载修复加载器...');

            // 创建并加载修复加载器
            const loaderScript = document.createElement('script');
            loaderScript.id = 'fix-loader-script';
            loaderScript.src = 'fix_loader.js';
            loaderScript.onload = () => console.log('修复加载器加载成功');
            loaderScript.onerror = () => console.error('修复加载器加载失败');

            document.head.appendChild(loaderScript);
        }
    }

    // 等待DOM加载完成
    document.addEventListener('DOMContentLoaded', function () {
        // 5秒后执行系统检查，给其他脚本加载的时间
        setTimeout(() => {
            startSystemCheck((results) => {
                // 显示状态通知
                showSystemStatus(results);
            });
        }, 5000);
    });

    /**
     * 显示系统状态通知
     */
    function showSystemStatus(results) {
        // 只在状态不佳时显示通知
        if (results.score >= 80) {
            return;
        }

        // 创建通知元素
        const statusNotification = document.createElement('div');
        statusNotification.id = 'system-status-notification';
        statusNotification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: ${results.score >= 60 ? 'rgba(255, 165, 0, 0.9)' : 'rgba(255, 0, 0, 0.8)'};
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-size: 14px;
            max-width: 300px;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            transition: opacity 0.3s;
        `;

        // 通知内容
        statusNotification.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <div style="margin-right: 8px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <div style="font-weight: bold;">系统状态: ${results.status} (${results.score}/100)</div>
            </div>
            <div style="margin-bottom: 5px;">检测到以下问题:</div>
            <ul style="margin: 0; padding-left: 20px; margin-bottom: 8px;">
                ${results.issues.map(issue => `<li>${issue}</li>`).join('')}
            </ul>
            <div style="text-align: right; margin-top: 5px;">
                <button id="system-fix-button" style="background: rgba(255,255,255,0.3); border: none; color: white; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-right: 5px;">修复问题</button>
                <button id="system-close-button" style="background: none; border: none; color: white; cursor: pointer;">关闭</button>
            </div>
        `;

        // 添加到DOM
        document.body.appendChild(statusNotification);

        // 绑定按钮事件
        const fixButton = document.getElementById('system-fix-button');
        const closeButton = document.getElementById('system-close-button');

        if (fixButton) {
            fixButton.addEventListener('click', function () {
                attemptSystemRecovery();

                // 显示修复中状态
                this.textContent = '修复中...';
                this.disabled = true;

                // 30秒后再次检查
                setTimeout(() => {
                    startSystemCheck((newResults) => {
                        if (newResults.score > results.score) {
                            // 修复有效
                            statusNotification.style.backgroundColor = 'rgba(0, 128, 0, 0.8)';
                            statusNotification.innerHTML = `
                                <div style="margin-bottom: 8px; font-weight: bold;">系统已修复! (${newResults.score}/100)</div>
                                <div style="text-align: right;">
                                    <button id="system-close-button-2" style="background: none; border: none; color: white; cursor: pointer;">关闭</button>
                                </div>
                            `;

                            // 绑定新的关闭按钮
                            document.getElementById('system-close-button-2').addEventListener('click', function () {
                                statusNotification.style.opacity = '0';
                                setTimeout(() => {
                                    if (document.body.contains(statusNotification)) {
                                        document.body.removeChild(statusNotification);
                                    }
                                }, 300);
                            });
                        } else {
                            // 修复无效
                            this.textContent = '修复问题';
                            this.disabled = false;
                            alert('系统修复未能完全解决问题，请刷新页面或尝试使用其他浏览器');
                        }
                    });
                }, 5000);
            });
        }

        if (closeButton) {
            closeButton.addEventListener('click', function () {
                statusNotification.style.opacity = '0';
                setTimeout(() => {
                    if (document.body.contains(statusNotification)) {
                        document.body.removeChild(statusNotification);
                    }
                }, 300);
            });
        }
    }

    // 将API暴露给全局作用域
    window.systemCheck = {
        start: startSystemCheck,
        fix: attemptSystemRecovery
    };
})(); 