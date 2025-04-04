// DOM元素
const introScreen = document.getElementById('introScreen');
const loveScreen = document.getElementById('loveScreen');
const finalScreen = document.getElementById('finalScreen');
const nameInput = document.getElementById('nameInput');
const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const personName = document.getElementById('personName');
const loveMessage = document.getElementById('loveMessage');
const finalText = document.getElementById('finalText');
const replayBtn = document.getElementById('replayBtn');
const musicBtn = document.getElementById('musicBtn');
const bgMusic = document.getElementById('bgMusic');
const heartContainer = document.querySelector('.heart-container');
const starsContainer = document.querySelector('.stars-container');
const fireworksContainer = document.querySelector('.fireworks-container');

// 聊天相关元素
const chatBtn = document.getElementById('chatBtn');
const chatContainer = document.getElementById('chatContainer');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatMessages = document.getElementById('chatMessages');
const userSelect = document.getElementById('userSelect');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

// 浪漫消息数组
const messages = [
    "zc和lcz的爱情故事，从这里开始...",
    "每一天，你们的爱都在加深",
    "彼此的微笑是对方最大的幸福",
    "携手走过的每一天都充满阳光",
    "你们共同的未来将更加美好"
];

// 最终表白文字
const finalMessage = `亲爱的zc和lcz：
你们是彼此生命中最美丽的意外，
每一次相遇，都让对方心动不已。
你们的笑容，让彼此的世界充满阳光，
你们的陪伴，是最温暖的港湾。

这个小小的爱情空间，
记录着你们走过的每一天。
无论是晴天还是雨天，
你们都将一直相伴。

zc ❤️ lcz`;

// 当前消息索引
let currentMessageIndex = 0;
let userName = '';
let isChatVisible = false; // 添加聊天窗口显示状态标记

// 初始化
function init() {
    console.log("初始化应用...");

    // 确保DOM元素存在
    checkDomElements();

    // 创建星星
    createStars();

    // 绑定事件处理
    bindEvents();
    loadMessages(); // 加载已有的聊天消息

    // 处理本地音频选择
    setupAudioFileInput();
}

// 检查DOM元素是否正确获取
function checkDomElements() {
    console.log("检查DOM元素:");
    console.log("聊天按钮:", chatBtn);
    console.log("聊天容器:", chatContainer);
    console.log("最终屏幕:", finalScreen);
    console.log("聊天按钮HTML:", chatBtn ? chatBtn.outerHTML : "不存在");

    // 如果聊天按钮不存在，尝试重新获取
    if (!chatBtn) {
        console.log("尝试重新获取聊天按钮...");
        setTimeout(() => {
            const newChatBtn = document.getElementById('chatBtn');
            console.log("重新获取的聊天按钮:", newChatBtn);
            if (newChatBtn && !newChatBtn.onclick) {
                console.log("成功获取聊天按钮，正在绑定toggleChat事件");
                newChatBtn.addEventListener('click', function (e) {
                    console.log("聊天按钮被点击");
                    e.preventDefault();
                    toggleChat();
                });
                // 重新赋值全局变量
                window.chatBtn = newChatBtn;
            }
        }, 1000);
    } else if (chatBtn && !chatBtn.onclick) {
        console.log("聊天按钮已存在，确保事件绑定");
        // 重新绑定事件以确保有效
        chatBtn.addEventListener('click', function (e) {
            console.log("聊天按钮被点击");
            e.preventDefault();
            toggleChat();
        });
    } else {
        console.log("聊天按钮已存在并已绑定事件，无需重新绑定");
    }
}

// 绑定事件
function bindEvents() {
    console.log("绑定事件...");

    startBtn.addEventListener('click', startLoveAnimation);
    nextBtn.addEventListener('click', showNextMessage);
    replayBtn.addEventListener('click', replayAnimation);

    // 聊天相关事件 - 只在其他方法没有绑定时才绑定
    if (chatBtn && !chatBtn.onclick) {
        console.log("绑定聊天按钮点击事件");
        chatBtn.addEventListener('click', function (e) {
            console.log("聊天按钮被点击(bindEvents)");
            e.preventDefault();
            toggleChat();
        });
    } else if (!chatBtn) {
        console.log("聊天按钮不存在，无法绑定事件");
        // 尝试直接获取
        const directChatBtn = document.getElementById('chatBtn');
        if (directChatBtn && !directChatBtn.onclick) {
            console.log("通过直接获取找到聊天按钮");
            directChatBtn.addEventListener('click', function (e) {
                console.log("聊天按钮被点击(直接获取)");
                e.preventDefault();
                toggleChat();
            });
        }
    }

    if (closeChatBtn && !closeChatBtn.onclick) {
        closeChatBtn.addEventListener('click', function (e) {
            console.log("关闭聊天按钮被点击");
            e.preventDefault();
            toggleChat();
        });
    } else if (!closeChatBtn) {
        console.log("关闭聊天按钮不存在");
        const directCloseBtn = document.getElementById('closeChatBtn');
        if (directCloseBtn && !directCloseBtn.onclick) {
            console.log("通过直接获取找到关闭按钮");
            directCloseBtn.addEventListener('click', function (e) {
                console.log("关闭按钮被点击(直接获取)");
                e.preventDefault();
                toggleChat();
            });
        }
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    if (messageInput) {
        messageInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

// 开始爱心动画
function startLoveAnimation() {
    // 直接使用"zc和lcz"作为名字，不需要从输入框获取
    userName = 'zc和lcz';
    personName.textContent = userName;

    // 隐藏介绍屏幕，显示爱心屏幕
    introScreen.style.opacity = '0';
    setTimeout(() => {
        introScreen.style.display = 'none';
        loveScreen.style.display = 'flex';

        // 播放背景音乐
        playBackgroundMusic();

        // 显示第一条消息
        showMessage(0);

        // 创建心形
        createHearts();
    }, 1000);
}

// 显示下一条消息
function showNextMessage() {
    currentMessageIndex++;

    if (currentMessageIndex < messages.length) {
        showMessage(currentMessageIndex);
        createFirework(); // 显示烟花效果
    } else {
        // 显示最终屏幕
        loveScreen.style.display = 'none';
        finalScreen.style.display = 'flex';
        finalText.textContent = finalMessage;
        createFirework();
        createFirework();
        createFirework();

        // 简单的检查，不替换元素
        console.log("最终屏幕显示完成");
    }
}

// 显示消息
function showMessage(index) {
    loveMessage.textContent = messages[index];
    createHearts(); // 每次显示消息时创建新的心形
}

// 重新播放动画
function replayAnimation() {
    finalScreen.style.display = 'none';
    introScreen.style.display = 'flex';
    introScreen.style.opacity = '1';
    currentMessageIndex = 0;
    // 不再需要设置nameInput的值
    // nameInput.value = userName;

    // 确保聊天窗口隐藏
    chatContainer.style.display = 'none';
    isChatVisible = false;
}

// 创建心形
function createHearts() {
    // 清除之前的心形
    heartContainer.innerHTML = '';

    // 创建新的心形
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.classList.add('heart');

            // 随机大小
            const size = Math.random() * 30 + 10;
            heart.style.width = `${size}px`;
            heart.style.height = `${size}px`;

            // 随机位置
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            heart.style.left = `${left}%`;
            heart.style.top = `${top}%`;

            // 随机颜色
            const hue = Math.random() * 60 + 330; // 红粉色范围
            heart.style.backgroundColor = `hsl(${hue}, 100%, 65%)`;

            // 随机动画延迟
            heart.style.animationDelay = `${Math.random() * 5}s`;

            // 设置心形
            heart.style.clipPath = 'path("M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z")';
            heart.style.transform = `rotate(${Math.random() * 60 - 30}deg)`;

            heartContainer.appendChild(heart);
        }, i * 100);
    }
}

// 创建星星
function createStars() {
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // 随机大小
        const size = Math.random() * 3 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        // 随机位置
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        star.style.left = `${left}%`;
        star.style.top = `${top}%`;

        // 随机动画延迟
        star.style.animationDelay = `${Math.random() * 2}s`;

        // 随机亮度
        const brightness = Math.random() * 0.5 + 0.5;
        star.style.opacity = brightness;

        starsContainer.appendChild(star);
    }
}

// 创建烟花
function createFirework() {
    // 烟花的随机位置
    const left = Math.random() * 80 + 10;
    const top = Math.random() * 80 + 10;

    // 烟花粒子数量
    const particleCount = 30;

    // 随机颜色
    const hue = Math.random() * 360;

    // 创建烟花粒子
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('firework');

        // 设置基本位置
        particle.style.left = `${left}%`;
        particle.style.top = `${top}%`;

        // 设置颜色
        particle.style.backgroundColor = `hsl(${hue}, 100%, 65%)`;

        // 随机角度
        const angle = (i / particleCount) * 360;

        // 设置动画
        particle.style.transform = `rotate(${angle}deg) translateX(0)`;
        particle.style.animationDuration = `${Math.random() * 0.5 + 0.5}s`;

        fireworksContainer.appendChild(particle);

        // 移除粒子
        setTimeout(() => {
            fireworksContainer.removeChild(particle);
        }, 1000);
    }
}

// 播放背景音乐
function playBackgroundMusic() {
    // 应用保存的音量设置
    const savedVolume = localStorage.getItem('musicVolume');
    if (savedVolume) {
        bgMusic.volume = savedVolume / 100;
    } else {
        bgMusic.volume = 0.5; // 默认音量
    }

    // 应用保存的循环设置
    const savedLoop = localStorage.getItem('musicLoop');
    if (savedLoop !== null) {
        bgMusic.loop = savedLoop === 'true';
    } else {
        bgMusic.loop = true; // 默认循环播放
    }

    bgMusic.play().catch(e => {
        console.log("自动播放受限: ", e);
    });
}

// 处理本地音频选择
function setupAudioFileInput() {
    const audioFileInput = document.getElementById('audioFileInput');
    const musicBtn = document.getElementById('musicBtn');

    if (!audioFileInput) return;

    // 创建音量控制元素
    const volumeControl = document.createElement('div');
    volumeControl.className = 'volume-control';
    volumeControl.style.cssText = `
        position: absolute;
        bottom: -60px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.7);
        padding: 10px;
        border-radius: 20px;
        display: none;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        width: 150px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        z-index: 100;
    `;

    // 添加音量调节滑块
    volumeControl.innerHTML = `
        <span style="color: white; font-size: 12px; margin-bottom: 5px;">音量控制</span>
        <input type="range" id="volumeSlider" min="0" max="100" value="50" style="width: 100%;">
        <label for="loopCheckbox" style="color: white; font-size: 12px; display: flex; align-items: center; margin-top: 5px;">
            <input type="checkbox" id="loopCheckbox" checked style="margin-right: 5px;">
            循环播放
        </label>
    `;

    // 将音量控制添加到按钮旁边
    musicBtn.parentNode.appendChild(volumeControl);

    // 获取滑块和循环选择框
    const volumeSlider = document.getElementById('volumeSlider');
    const loopCheckbox = document.getElementById('loopCheckbox');

    // 音量滑块变化事件
    volumeSlider.addEventListener('input', function () {
        bgMusic.volume = this.value / 100;
        // 保存音量设置
        localStorage.setItem('musicVolume', this.value);
    });

    // 循环播放选择框事件
    loopCheckbox.addEventListener('change', function () {
        bgMusic.loop = this.checked;
        // 保存循环设置
        localStorage.setItem('musicLoop', this.checked ? 'true' : 'false');
    });

    // 显示/隐藏音量控制的功能
    const toggleVolumeControl = function (e) {
        // 阻止事件冒泡，防止立即隐藏
        e.stopPropagation();

        if (volumeControl.style.display === 'none' || volumeControl.style.display === '') {
            volumeControl.style.display = 'flex';

            // 点击音乐按钮和音量控制之外的地方隐藏音量控制
            const hideVolumeControl = function (event) {
                if (!volumeControl.contains(event.target) && event.target !== musicBtn) {
                    volumeControl.style.display = 'none';
                    document.removeEventListener('click', hideVolumeControl);
                }
            };

            // 添加延迟，防止立即触发
            setTimeout(() => {
                document.addEventListener('click', hideVolumeControl);
            }, 100);
        } else {
            volumeControl.style.display = 'none';
        }
    };

    // 右击音乐按钮显示音量控制
    musicBtn.addEventListener('contextmenu', function (e) {
        e.preventDefault(); // 阻止默认的右键菜单
        toggleVolumeControl(e);
    });

    // 添加音量图标，点击显示音量控制
    const volumeIcon = document.createElement('div');
    volumeIcon.className = 'volume-icon';
    volumeIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
            style="cursor: pointer; position: absolute; right: 5px; top: 50%; transform: translateY(-50%);">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
    `;
    musicBtn.style.position = 'relative';
    musicBtn.appendChild(volumeIcon);

    volumeIcon.querySelector('svg').addEventListener('click', function (e) {
        toggleVolumeControl(e);
    });

    audioFileInput.addEventListener('change', function (e) {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            const fileURL = URL.createObjectURL(file);

            // 更新音频源
            bgMusic.src = fileURL;
            bgMusic.load();

            // 应用保存的设置
            const savedVolume = localStorage.getItem('musicVolume');
            if (savedVolume) {
                bgMusic.volume = savedVolume / 100;
                volumeSlider.value = savedVolume;
            }

            const savedLoop = localStorage.getItem('musicLoop');
            if (savedLoop !== null) {
                bgMusic.loop = savedLoop === 'true';
                loopCheckbox.checked = savedLoop === 'true';
            } else {
                bgMusic.loop = true; // 默认循环播放
                loopCheckbox.checked = true;
            }

            bgMusic.play().catch(err => {
                console.error("播放失败:", err);
            });

            // 更新按钮文本显示当前播放的文件名
            const fileName = file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name;
            musicBtn.querySelector('svg').nextSibling.textContent = ' ' + fileName;

            // 保存到本地存储
            try {
                localStorage.setItem('lastAudioName', file.name);
                // 无法直接保存文件，但可以记住用户选择了自定义音乐
                localStorage.setItem('customAudioSelected', 'true');
            } catch (err) {
                console.error("保存音频信息失败:", err);
            }
        }
    });

    // 点击按钮播放/暂停音乐
    musicBtn.addEventListener('click', function (e) {
        // 防止点击按钮触发文件选择
        if (e.target !== audioFileInput && !volumeIcon.contains(e.target)) {
            e.preventDefault();

            if (bgMusic.paused) {
                bgMusic.play().catch(err => {
                    console.error("播放失败:", err);
                    // 如果播放失败，可能需要用户再次选择文件
                    audioFileInput.click();
                });
            } else {
                bgMusic.pause();
            }
        }
    });

    // 检查是否有自定义音乐记录
    const customAudioSelected = localStorage.getItem('customAudioSelected');
    const lastAudioName = localStorage.getItem('lastAudioName');

    if (customAudioSelected && lastAudioName) {
        musicBtn.querySelector('svg').nextSibling.textContent = ' ' +
            (lastAudioName.length > 15 ? lastAudioName.substring(0, 12) + '...' : lastAudioName);
    }

    // 初始化音量和循环设置
    const savedVolume = localStorage.getItem('musicVolume');
    if (savedVolume) {
        bgMusic.volume = savedVolume / 100;
        volumeSlider.value = savedVolume;
    } else {
        bgMusic.volume = 0.5; // 默认音量
        volumeSlider.value = 50;
    }

    const savedLoop = localStorage.getItem('musicLoop');
    if (savedLoop !== null) {
        bgMusic.loop = savedLoop === 'true';
        loopCheckbox.checked = savedLoop === 'true';
    } else {
        bgMusic.loop = true; // 默认循环播放
        loopCheckbox.checked = true;
    }
}

// 聊天功能相关代码
// ===============================

// 切换聊天窗口显示/隐藏
function toggleChat() {
    console.log("toggleChat函数被调用");

    // 直接检查当前状态
    if (chatContainer.style.display === 'flex') {
        console.log("正在隐藏聊天窗口");
        chatContainer.style.display = 'none';
        isChatVisible = false;
    } else {
        console.log("正在显示聊天窗口");
        chatContainer.style.display = 'flex';
        isChatVisible = true;
        messageInput.focus();
        scrollToBottom();
    }
}

// 发送消息
function sendMessage() {
    const text = messageInput.value.trim();
    if (text === '') return;

    const sender = userSelect.value;
    const timestamp = new Date();

    // 创建消息对象
    const messageObj = {
        text: text,
        sender: sender,
        timestamp: timestamp.toISOString()
    };

    // 添加消息到界面
    addMessageToChat(messageObj);

    // 保存消息
    saveMessage(messageObj);

    // 清空输入框
    messageInput.value = '';
    messageInput.focus();
}

// 添加消息到聊天界面
function addMessageToChat(messageObj) {
    const msgElement = document.createElement('div');
    msgElement.classList.add('message', messageObj.sender);

    const formattedTime = formatTime(new Date(messageObj.timestamp));

    msgElement.innerHTML = `
        <div class="message-sender">${messageObj.sender}</div>
        <div class="message-content">${messageObj.text}</div>
        <div class="message-time">${formattedTime}</div>
    `;

    chatMessages.appendChild(msgElement);
    scrollToBottom();
}

// 格式化时间
function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// 滚动到聊天底部
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 保存消息到本地存储
function saveMessage(messageObj) {
    let messages = getMessages();
    messages.push(messageObj);

    // 最多保存100条消息
    if (messages.length > 100) {
        messages = messages.slice(-100);
    }

    localStorage.setItem('loveMessages', JSON.stringify(messages));
}

// 获取已保存的消息
function getMessages() {
    const saved = localStorage.getItem('loveMessages');
    return saved ? JSON.parse(saved) : [];
}

// 加载已保存的消息
function loadMessages() {
    const messages = getMessages();

    // 清空聊天容器
    chatMessages.innerHTML = '';

    // 添加所有消息
    messages.forEach(msg => {
        addMessageToChat(msg);
    });
}

// 确保在DOM完全加载后运行
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM已加载完成");

    // 设置一个标志，防止多次初始化
    if (window.appInitialized) {
        console.log("应用已初始化，跳过");
        return;
    }

    init();
    window.appInitialized = true;

    // 延迟检查元素，确保所有动态元素都已加载
    setTimeout(() => {
        checkDomElements();
    }, 1000);
});
