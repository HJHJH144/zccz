/**
 * 修复加载器脚本
 * 负责加载和应用所有修复
 */

// 在DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function () {
    console.log('修复加载器已启动');

    // 首先应用全局密码修复
    applyGlobalPasswordFix();

    // 加载其他修复
    loadAndApplyFixes();
});

/**
 * 全局密码修复
 * 确保密码在所有页面间共享
 */
function applyGlobalPasswordFix() {
    console.log('应用全局密码修复...');

    // 确保全局用户验证状态
    if (typeof window.userVerified === 'undefined') {
        window.userVerified = false;
    }

    // 尝试从localStorage加载密码
    const savedPassword = localStorage.getItem('lcz_zc_global_password');
    if (savedPassword) {
        window.encryptionKey = savedPassword;
        window.userVerified = true;
        sessionStorage.setItem('current_password', savedPassword);
        console.log('已从本地存储恢复密码');

        // 隐藏密码层
        const passwordLayer = document.getElementById('passwordLayer');
        if (passwordLayer) {
            passwordLayer.style.display = 'none';
        }
    }

    // 修改所有解锁按钮的行为
    const unlockBtn = document.getElementById('unlockBtn');
    if (unlockBtn) {
        const chatPassword = document.getElementById('chatPassword');
        const passwordError = document.getElementById('passwordError');

        // 替换解锁按钮事件处理
        const newBtn = unlockBtn.cloneNode(true);
        unlockBtn.parentNode.replaceChild(newBtn, unlockBtn);

        // 添加新的解锁功能
        newBtn.addEventListener('click', function () {
            const password = chatPassword.value.trim();
            if (!password) {
                if (passwordError) {
                    passwordError.textContent = '请输入密码';
                    passwordError.style.display = 'block';
                }
                return;
            }

            // 设置全局密码
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

            // 初始化聊天
            if (typeof window.initializeChat === 'function') {
                window.initializeChat();
            }

            console.log('全局密码设置成功');
        });

        // 绑定回车键
        if (chatPassword) {
            chatPassword.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    newBtn.click();
                }
            });
        }
    }
}

/**
 * 加载和应用所有修复
 */
function loadAndApplyFixes() {
    // 按优先级顺序加载修复脚本
    const fixes = [
        { src: 'system_check.js', priority: 10 },
        { src: 'crypto_fixes.js', priority: 9 },
        { src: 'chat_fixes.js', priority: 8 },
        { src: 'bug_fixes.js', priority: 7 },
        { src: 'media_fixes.js', priority: 6 },
        { src: 'style_fixes.js', priority: 5 },
        { src: 'chat_multimedia.js', priority: 4 }
    ];

    // 按优先级排序
    fixes.sort((a, b) => b.priority - a.priority);

    // 依次加载脚本
    let loadIndex = 0;

    function loadNextFix() {
        if (loadIndex >= fixes.length) {
            console.log('所有修复已加载完成');
            return;
        }

        const fix = fixes[loadIndex++];
        const script = document.createElement('script');
        script.src = fix.src;
        script.async = false;

        script.onload = function () {
            console.log(`已加载修复: ${fix.src}`);
            loadNextFix();
        };

        script.onerror = function () {
            console.error(`加载修复失败: ${fix.src}`);
            loadNextFix();
        };

        document.body.appendChild(script);
    }

    // 开始加载
    loadNextFix();
} 