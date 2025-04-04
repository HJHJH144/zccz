/**
 * 样式修复脚本
 * 解决CSS兼容性和布局问题
 */

// 在DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function () {
    // 立即修复布局问题
    fixLayoutIssues();

    // 添加响应式调整
    addResponsiveAdjustments();

    // 修复动画
    fixAnimationIssues();

    // 优化移动设备体验
    enhanceMobileExperience();

    // 动态调整聊天窗口
    if (document.getElementById('chatContainer')) {
        // 立即调整一次
        adjustChatContainer();

        // 监听窗口大小变化
        window.addEventListener('resize', adjustChatContainer);
    }
});

/**
 * 修复布局问题
 */
function fixLayoutIssues() {
    // 修复聊天消息容器高度计算问题
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.style.height = 'calc(100% - 130px)';
    }

    // 修复emoji面板位置
    const emojiPanel = document.getElementById('emoji-panel');
    if (emojiPanel) {
        adjustPanelPosition(emojiPanel);
    }

    // 修复媒体菜单位置
    const mediaMenu = document.getElementById('media-menu');
    if (mediaMenu) {
        adjustPanelPosition(mediaMenu);
    }

    // 添加聊天容器圆角修复
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
        fixBorderRadius(chatContainer);
    }

    // 添加CSS修复
    addStyleFixes();
}

/**
 * 添加通用样式修复
 */
function addStyleFixes() {
    // 创建样式元素
    const style = document.createElement('style');
    style.id = 'style-fixes';
    style.textContent = `
        /* 修复动画定义 */
        @keyframes pulse {
            0% {
                opacity: 0.6;
                transform: scale(1);
            }
            50% {
                opacity: 1;
                transform: scale(1.05);
            }
            100% {
                opacity: 0.6;
                transform: scale(1);
            }
        }
        
        /* 修复消息气泡样式 */
        .message {
            padding: 10px 15px !important;
            border-radius: 15px !important;
            max-width: 75% !important;
            word-break: break-word !important;
            position: relative !important;
            margin-bottom: 20px !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2) !important;
        }
        
        /* 确保聊天容器正确显示 */
        #chatContainer.visible {
            display: flex !important;
        }
        
        /* 修复媒体查看器样式 */
        .media-overlay {
            animation: fadeIn 0.3s ease !important;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        /* 修复在录音时的动画效果 */
        @keyframes recording-pulse {
            0% { background-color: rgba(255, 0, 0, 0.3); }
            50% { background-color: rgba(255, 0, 0, 0.6); }
            100% { background-color: rgba(255, 0, 0, 0.3); }
        }
        
        /* 确保输入框在所有浏览器中都有一致外观 */
        input, textarea, select, button {
            font-family: inherit;
            box-sizing: border-box;
        }
        
        /* 确保所有滚动条样式一致 */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        
        ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.1);
            border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
        }
        
        /* Safari浏览器特定修复 */
        @supports (-webkit-appearance:none) {
            .chat-input input, .chat-input button {
                margin: 0;
            }
        }
        
        /* 移动设备特定样式 */
        @media (max-width: 768px) {
            .message {
                max-width: 85% !important;
            }
            
            #chatContainer {
                width: 95% !important;
                height: 90% !important;
            }
            
            .chat-input {
                padding: 10px !important;
            }
        }
    `;

    // 添加到文档头部
    document.head.appendChild(style);
}

/**
 * 调整面板位置
 */
function adjustPanelPosition(panel) {
    if (!panel) return;

    // 获取视窗尺寸
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 获取面板尺寸
    const rect = panel.getBoundingClientRect();

    // 检查是否超出右边界
    if (rect.right > viewportWidth) {
        panel.style.left = (viewportWidth - rect.width - 10) + 'px';
    }

    // 检查是否超出左边界
    if (rect.left < 0) {
        panel.style.left = '10px';
    }

    // 检查是否超出底部
    if (rect.bottom > viewportHeight) {
        panel.style.bottom = (viewportHeight - rect.top - 10) + 'px';
    }
}

/**
 * 修复边框圆角
 */
function fixBorderRadius(element) {
    if (!element) return;

    // 确保圆角在Safari中正确显示
    element.style.webkitBorderRadius = element.style.borderRadius;

    // 确保子元素不超出圆角
    element.style.overflow = 'hidden';
}

/**
 * 添加响应式调整
 */
function addResponsiveAdjustments() {
    // 检测设备类型
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // 标记文档作为移动设备或桌面设备
    document.body.classList.add(isMobile ? 'mobile-device' : 'desktop-device');

    // 为移动设备添加meta viewport
    if (isMobile) {
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }

    // 添加方向变化监听器
    window.addEventListener('orientationchange', function () {
        // 延迟执行以确保UI正确更新
        setTimeout(function () {
            adjustChatContainer();

            // 重新调整浮动元素位置
            const panels = [
                document.getElementById('emoji-panel'),
                document.getElementById('media-menu'),
                document.getElementById('recording-indicator')
            ];

            panels.forEach(panel => {
                if (panel) adjustPanelPosition(panel);
            });
        }, 300);
    });
}

/**
 * 修复动画问题
 */
function fixAnimationIssues() {
    // 检查是否有动画样式定义
    const hasKeyframes = Array.from(document.styleSheets).some(sheet => {
        try {
            const rules = sheet.cssRules || sheet.rules;
            return Array.from(rules).some(rule => rule.type === CSSRule.KEYFRAMES_RULE);
        } catch (e) {
            // 跨域样式表会抛出安全错误
            return false;
        }
    });

    // 如果没有关键帧定义，添加缺失的动画
    if (!hasKeyframes) {
        const animationStyles = document.createElement('style');
        animationStyles.textContent = `
            @keyframes pulse {
                0% { opacity: 0.6; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.05); }
                100% { opacity: 0.6; transform: scale(1); }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes slideIn {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(20px); opacity: 0; }
            }
        `;
        document.head.appendChild(animationStyles);
    }

    // 修复动画表现
    Array.from(document.querySelectorAll('[style*="animation"]')).forEach(el => {
        // 确保动画不会无限循环导致性能问题
        if (el.style.animation && !el.style.animation.includes('forwards') && !el.style.animation.includes('infinite')) {
            el.style.animationIterationCount = '1';
            el.style.animationFillMode = 'forwards';
        }
    });
}

/**
 * 优化移动设备体验
 */
function enhanceMobileExperience() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!isMobile) return;

    // 优化表单元素
    Array.from(document.querySelectorAll('input, button, select, textarea')).forEach(el => {
        // 增大触摸区域
        if (el.tagName === 'BUTTON' || el.type === 'button' || el.type === 'submit') {
            el.style.minHeight = '44px';
            el.style.minWidth = '44px';
        }

        // 避免iOS上输入框的缩放
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.style.fontSize = '16px';
        }
    });

    // 修复iOS上的双击缩放
    document.addEventListener('touchend', function (event) {
        // 防止双击缩放
        event.preventDefault();
    }, { passive: false });

    // 改进聊天输入体验
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        // 让键盘上有一个"发送"按钮
        messageInput.setAttribute('enterkeyhint', 'send');

        // 输入时自动滚动到底部
        messageInput.addEventListener('focus', function () {
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                setTimeout(() => {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 300);
            }
        });
    }

    // 优化文件上传按钮
    const uploadButtons = Array.from(document.querySelectorAll('[id$="-button"]'));
    uploadButtons.forEach(button => {
        if (button.id.includes('media') || button.id.includes('emoji') || button.id.includes('audio')) {
            button.style.width = '40px';
            button.style.height = '40px';
        }
    });
}

/**
 * 调整聊天容器
 */
function adjustChatContainer() {
    const chatContainer = document.getElementById('chatContainer');
    if (!chatContainer) return;

    // 获取各个聊天元素
    const chatHeader = document.querySelector('.chat-header');
    const chatMessages = document.getElementById('chatMessages');
    const typingIndicator = document.getElementById('typingIndicator');
    const multimediaBar = document.querySelector('.multimedia-bar');
    const chatInput = document.querySelector('.chat-input');

    if (!chatMessages) return;

    // 计算各部分高度
    const headerHeight = chatHeader ? chatHeader.offsetHeight : 0;
    const typingHeight = typingIndicator && typingIndicator.style.display !== 'none' ? typingIndicator.offsetHeight : 0;
    const multimediaHeight = multimediaBar ? multimediaBar.offsetHeight : 0;
    const inputHeight = chatInput ? chatInput.offsetHeight : 0;

    // 计算聊天消息区域应有的高度
    const totalComponentsHeight = headerHeight + typingHeight + multimediaHeight + inputHeight;
    const messagesHeight = `calc(100% - ${totalComponentsHeight}px)`;

    // 设置高度
    chatMessages.style.height = messagesHeight;

    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // 调试高度计算
    console.log('聊天容器高度调整:', {
        headerHeight,
        typingHeight,
        multimediaHeight,
        inputHeight,
        totalHeight: totalComponentsHeight,
        calculatedHeight: messagesHeight
    });
} 