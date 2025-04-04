/**
 * 修复脚本引导加载器
 * 负责启动系统检查并加载所有修复
 */

(function () {
    // 记录开始时间
    const startTime = performance.now();

    // 初始化日志
    console.log('修复引导加载器启动...');

    // DOM 加载完成后执行
    document.addEventListener('DOMContentLoaded', function () {
        console.log('DOM加载完成，准备启动修复流程');
        loadSystemCheck();
    });

    /**
     * 加载系统检查脚本
     */
    function loadSystemCheck() {
        // 检查是否已加载
        if (document.getElementById('system-check-script')) {
            console.log('系统检查脚本已加载');
            startFixLoader();
            return;
        }

        console.log('正在加载系统检查脚本...');

        // 创建脚本元素
        const script = document.createElement('script');
        script.id = 'system-check-script';
        script.src = 'system_check.js';

        // 加载成功回调
        script.onload = function () {
            console.log('系统检查脚本加载成功');
            // 启动修复加载器
            startFixLoader();
        };

        // 加载失败回调
        script.onerror = function () {
            console.error('系统检查脚本加载失败，直接加载修复脚本');
            // 直接加载修复加载器
            loadFixLoader();
        };

        // 添加到文档头部
        document.head.appendChild(script);
    }

    /**
     * 启动修复加载流程
     */
    function startFixLoader() {
        // 如果系统检查API存在，先执行检查
        if (window.systemCheck && typeof window.systemCheck.start === 'function') {
            console.log('开始执行系统检查...');

            window.systemCheck.start(function (results) {
                console.log('系统检查完成，得分:', results.score);

                // 无论得分如何，都加载修复脚本以确保系统稳定
                loadFixLoader();

                // 如果得分低于阈值，尝试进行修复
                if (results.score < 70) {
                    console.warn('系统状态不佳，启动自动修复');

                    // 延迟执行修复，确保修复脚本已加载
                    setTimeout(function () {
                        if (window.systemCheck.fix) {
                            window.systemCheck.fix();
                        }
                    }, 2000);
                }
            });
        } else {
            // 如果系统检查API不可用，直接加载修复
            console.warn('系统检查API不可用，直接加载修复脚本');
            loadFixLoader();
        }
    }

    /**
     * 加载修复加载器
     */
    function loadFixLoader() {
        // 检查是否已加载
        if (document.getElementById('fix-loader-script')) {
            console.log('修复加载器已加载');
            return;
        }

        console.log('正在加载修复加载器...');

        // 创建脚本元素
        const script = document.createElement('script');
        script.id = 'fix-loader-script';
        script.src = 'fix_loader.js';

        // 加载成功回调
        script.onload = function () {
            console.log('修复加载器加载成功');

            // 记录完成时间
            const endTime = performance.now();
            console.log(`修复引导过程完成，耗时: ${(endTime - startTime).toFixed(2)}毫秒`);
        };

        // 加载失败回调
        script.onerror = function () {
            console.error('修复加载器加载失败，尝试直接加载修复脚本');
            // 直接加载所有修复脚本
            loadAllFixesDirectly();
        };

        // 添加到文档头部
        document.head.appendChild(script);
    }

    /**
     * 直接加载所有修复脚本（备用方案）
     */
    function loadAllFixesDirectly() {
        console.warn('正在执行备用方案：直接加载所有修复脚本');

        // 要加载的修复脚本
        const scripts = [
            { id: 'bug-fixes-script', src: 'bug_fixes.js' },
            { id: 'media-fixes-script', src: 'media_fixes.js' },
            { id: 'style-fixes-script', src: 'style_fixes.js' }
        ];

        // 加载每个脚本
        scripts.forEach(function (scriptInfo) {
            // 检查是否已加载
            if (document.getElementById(scriptInfo.id)) {
                console.log(`脚本 ${scriptInfo.src} 已加载`);
                return;
            }

            // 创建脚本元素
            const scriptEl = document.createElement('script');
            scriptEl.id = scriptInfo.id;
            scriptEl.src = scriptInfo.src;

            // 加载回调
            scriptEl.onload = function () {
                console.log(`脚本 ${scriptInfo.src} 加载成功`);
            };

            scriptEl.onerror = function () {
                console.error(`脚本 ${scriptInfo.src} 加载失败`);
            };

            // 添加到文档
            document.head.appendChild(scriptEl);
        });

        // 记录完成时间
        const endTime = performance.now();
        console.log(`备用修复加载完成，耗时: ${(endTime - startTime).toFixed(2)}毫秒`);
    }
})(); 