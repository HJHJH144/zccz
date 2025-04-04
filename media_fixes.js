/**
 * 多媒体处理修复脚本
 * 修复录音和文件上传相关的bug
 */

// 在DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function () {
    // 等待主要脚本加载完成
    ensureGlobalFunctions();
});

// 确保全局函数可用
function ensureGlobalFunctions() {
    // 检查是否已添加录音兼容性
    if (!window.MediaRecorder || !window.mediaRecorderPolyfill) {
        addMediaRecorderPolyfill();
    }

    // 检查并替换媒体处理函数
    const checkInterval = setInterval(() => {
        if (document.getElementById('audio-button')) {
            clearInterval(checkInterval);
            enhanceMediaHandling();
        }
    }, 500);

    // 超时处理
    setTimeout(() => clearInterval(checkInterval), 10000);
}

// 添加MediaRecorder接口的兼容性处理
function addMediaRecorderPolyfill() {
    // 创建全局标志
    window.mediaRecorderPolyfill = true;

    // 如果已经支持，不需要polyfill
    if (window.MediaRecorder) return;

    // 简单的polyfill，用于不支持MediaRecorder的浏览器
    window.MediaRecorder = class MediaRecorderPolyfill {
        constructor(stream, options) {
            this.stream = stream;
            this.state = 'inactive';
            this.chunks = [];
            this._listeners = {
                'dataavailable': [],
                'stop': [],
                'error': []
            };

            // 记录音频数据
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioInput = this.audioContext.createMediaStreamSource(stream);
            this.recorder = this.audioContext.createScriptProcessor(4096, 1, 1);

            this.recorder.onaudioprocess = (e) => {
                if (this.state !== 'recording') return;

                // 将数据转成blob
                const data = e.inputBuffer.getChannelData(0);
                const dataBlob = new Blob([data], { type: 'audio/wav' });
                this.chunks.push(dataBlob);

                // 触发dataavailable事件
                const event = new Event('dataavailable');
                event.data = dataBlob;
                this._listeners['dataavailable'].forEach(listener => listener(event));
            };

            this.audioInput.connect(this.recorder);
            this.recorder.connect(this.audioContext.destination);
        }

        start() {
            if (this.state !== 'inactive') return;
            this.state = 'recording';
            this.chunks = [];
        }

        stop() {
            if (this.state === 'inactive') return;
            this.state = 'inactive';

            // 停止所有轨道
            this.stream.getTracks().forEach(track => track.stop());

            // 触发stop事件
            const event = new Event('stop');
            this._listeners['stop'].forEach(listener => listener(event));

            // 清理资源
            this.audioInput.disconnect();
            this.recorder.disconnect();
        }

        addEventListener(type, listener) {
            if (this._listeners[type]) {
                this._listeners[type].push(listener);
            }
        }

        removeEventListener(type, listener) {
            if (this._listeners[type]) {
                this._listeners[type] = this._listeners[type].filter(l => l !== listener);
            }
        }
    };
}

// 增强媒体处理功能
function enhanceMediaHandling() {
    // 确保全局变量
    window.isRecording = window.isRecording || false;
    window.mediaRecorder = window.mediaRecorder || null;
    window.audioChunks = window.audioChunks || [];

    // 增强录音功能
    enhanceRecordingFunction();

    // 增强文件上传处理
    enhanceFileUploads();

    console.log("媒体处理功能已增强");
}

// 增强录音功能
function enhanceRecordingFunction() {
    // 替换原始的录音开始函数
    if (typeof window.startRecording === 'function') {
        const originalStartRecording = window.startRecording;

        window.startRecording = function (button) {
            // 先检查浏览器兼容性
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                showCompatibilityError('您的浏览器不支持录音功能。请尝试使用Chrome、Firefox或Safari的最新版本。');
                return;
            }

            // 检查是否已经在录音
            if (window.isRecording) {
                stopRecording(button);
                return;
            }

            // 显示录音中指示器
            showRecordingIndicator();

            // 尝试多种音频格式
            const mimeTypes = [
                'audio/webm',
                'audio/mp4',
                'audio/ogg',
                'audio/wav'
            ];

            let options = {};

            // 找到浏览器支持的格式
            for (let type of mimeTypes) {
                if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
                    options = { mimeType: type };
                    break;
                }
            }

            // 请求麦克风权限
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(function (stream) {
                    try {
                        // 创建媒体记录器
                        window.mediaRecorder = new MediaRecorder(stream, options);
                        window.audioChunks = [];

                        // 收集音频数据
                        window.mediaRecorder.addEventListener('dataavailable', function (e) {
                            if (e.data.size > 0) window.audioChunks.push(e.data);
                        });

                        // 录音结束处理
                        window.mediaRecorder.addEventListener('stop', function () {
                            // 创建兼容的blob
                            let audioType = 'audio/webm';
                            for (let type of mimeTypes) {
                                if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
                                    audioType = type;
                                    break;
                                }
                            }

                            const audioBlob = new Blob(window.audioChunks, { type: audioType });

                            // 停止所有轨道
                            stream.getTracks().forEach(track => track.stop());

                            // 处理录音结果
                            processRecordingResult(audioBlob, button);
                        });

                        // 开始录音
                        window.mediaRecorder.start();
                        window.isRecording = true;

                        // 更新按钮状态
                        updateRecordingButtonState(button, true);

                        // 设置最长录音时间 (60秒)
                        window.recordingTimeout = setTimeout(() => {
                            if (window.isRecording) {
                                stopRecording(button);
                            }
                        }, 60000);
                    } catch (err) {
                        console.error('创建录音器失败:', err);
                        showCompatibilityError('无法创建录音器，请尝试使用其他浏览器');
                        hideRecordingIndicator();
                    }
                })
                .catch(function (err) {
                    console.error('录音失败:', err);
                    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                        alert('录音需要麦克风权限，请在浏览器设置中允许访问麦克风');
                    } else {
                        showCompatibilityError('无法访问麦克风：' + err.message);
                    }
                    hideRecordingIndicator();
                });
        };
    }

    // 增强停止录音功能
    if (typeof window.stopRecording === 'function') {
        const originalStopRecording = window.stopRecording;

        window.stopRecording = function (button) {
            // 清除录音超时
            if (window.recordingTimeout) {
                clearTimeout(window.recordingTimeout);
                window.recordingTimeout = null;
            }

            // 如果正在录音，停止录音
            if (window.mediaRecorder && window.isRecording) {
                try {
                    // 停止录音
                    window.mediaRecorder.stop();
                    window.isRecording = false;

                    // 更新按钮状态
                    updateRecordingButtonState(button, false);
                } catch (err) {
                    console.error('停止录音失败:', err);
                    // 恢复按钮状态
                    updateRecordingButtonState(button, false);
                    hideRecordingIndicator();
                }
            }
        };
    }
}

// 处理录音结果
function processRecordingResult(audioBlob, button) {
    // 检查文件大小
    if (audioBlob.size < 100) {
        alert('录音过短或未收集到声音');
        hideRecordingIndicator();
        return;
    }

    // 显示上传中状态
    if (window.mediaUpload && typeof window.mediaUpload.showProgress === 'function') {
        window.mediaUpload.showProgress(true);
        window.mediaUpload.updateProgress(0);
        window.mediaUpload.showStatus(true, '语音消息处理中...');
    }

    // 使用全局发送函数上传音频
    if (window.chatUtils && typeof window.chatUtils.sendMessage === 'function') {
        window.chatUtils.sendMessage('audio', audioBlob);
    } else if (typeof window.sendMessageToFirebase === 'function') {
        window.sendMessageToFirebase('audio', audioBlob);
    } else {
        alert('无法发送语音消息，请刷新页面重试');
    }

    // 更新按钮状态并隐藏录音指示器
    updateRecordingButtonState(button, false);
    hideRecordingIndicator();
}

// 更新录音按钮状态
function updateRecordingButtonState(button, isRecording) {
    if (!button) return;

    if (isRecording) {
        // 正在录音状态
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
        button.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        button.style.animation = 'pulse 1s infinite';
    } else {
        // 恢复初始状态
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>';
        button.style.backgroundColor = '';
        button.style.animation = '';
    }
}

// 显示录音指示器
function showRecordingIndicator() {
    // 移除旧的指示器
    hideRecordingIndicator();

    // 创建新的录音指示器
    const indicator = document.createElement('div');
    indicator.id = 'recording-indicator';
    indicator.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(255, 0, 0, 0.7);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 1010;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;

    // 添加计时器
    indicator.innerHTML = `
        <span style="display: inline-block; width: 10px; height: 10px; background-color: red; border-radius: 50%; animation: pulse 1s infinite;"></span>
        <span>录音中... <span id="recordingTime">0:00</span></span>
        <button id="stopRecordingBtn" style="background: none; border: none; color: white; margin-left: 10px; cursor: pointer;">×</button>
    `;

    document.body.appendChild(indicator);

    // 添加计时器功能
    let recordingSeconds = 0;
    window.recordingTimer = setInterval(() => {
        recordingSeconds++;
        const minutes = Math.floor(recordingSeconds / 60);
        const seconds = recordingSeconds % 60;
        const timeDisplay = document.getElementById('recordingTime');
        if (timeDisplay) {
            timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);

    // 添加停止按钮事件
    const stopBtn = document.getElementById('stopRecordingBtn');
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            const audioButton = document.getElementById('audio-button');
            if (audioButton) {
                stopRecording(audioButton);
            }
        });
    }
}

// 隐藏录音指示器
function hideRecordingIndicator() {
    // 清除计时器
    if (window.recordingTimer) {
        clearInterval(window.recordingTimer);
        window.recordingTimer = null;
    }

    // 移除指示器
    const recordingIndicator = document.getElementById('recording-indicator');
    if (recordingIndicator) {
        recordingIndicator.remove();
    }
}

// 显示兼容性错误
function showCompatibilityError(message) {
    alert(message || '您的浏览器不支持此功能，请尝试使用Chrome、Firefox或Safari的最新版本');
}

// 增强文件上传处理
function enhanceFileUploads() {
    // 增强图片上传函数
    if (typeof window.handleImageUpload === 'function') {
        const originalImageUpload = window.handleImageUpload;

        window.handleImageUpload = function (file) {
            // 检查文件类型
            if (!/^image\/(jpeg|png|gif|webp|heic|heif)$/i.test(file.type)) {
                alert('只支持JPEG、PNG、GIF和WEBP格式的图片');
                return;
            }

            // 处理HEIC/HEIF格式 (iPhone拍摄的图片)
            if (/^image\/(heic|heif)$/i.test(file.type)) {
                alert('正在转换iPhone格式图片，请稍候...');
                convertHeicToJpeg(file, (jpegFile) => {
                    if (jpegFile) {
                        processAndUploadImage(jpegFile);
                    } else {
                        alert('图片转换失败，请使用其他格式');
                    }
                });
                return;
            }

            // 处理并上传图片
            processAndUploadImage(file);
        };
    }

    // 增强视频上传函数
    if (typeof window.handleVideoUpload === 'function') {
        const originalVideoUpload = window.handleVideoUpload;

        window.handleVideoUpload = function (file) {
            // 检查文件类型
            if (!/^video\/(mp4|webm|quicktime|x-msvideo)$/i.test(file.type)) {
                alert('只支持MP4、WebM和MOV格式的视频');
                return;
            }

            // 检查文件大小
            if (file.size > 50 * 1024 * 1024) {
                alert('视频不能超过50MB!');
                return;
            }

            // 显示上传进度
            if (window.mediaUpload && typeof window.mediaUpload.uploadFile === 'function') {
                window.mediaUpload.uploadFile(file, 'video', (url, error) => {
                    if (url) {
                        // 成功获取URL后发送消息
                        if (window.chatUtils && typeof window.chatUtils.sendMessage === 'function') {
                            window.chatUtils.sendMessage('video', url);
                        } else if (typeof window.sendMessageToFirebase === 'function') {
                            window.sendMessageToFirebase('video', url);
                        }
                    } else {
                        alert('视频上传失败，请重试');
                    }
                });
            } else {
                // 使用原始函数
                originalVideoUpload(file);
            }
        };
    }
}

// 处理并上传图片
function processAndUploadImage(file) {
    // 检查文件大小
    if (file.size > 5 * 1024 * 1024) {
        alert('图片不能超过5MB!');
        return;
    }

    // 压缩和调整图片
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            // 压缩图片
            const canvas = document.createElement('canvas');
            const maxWidth = 1200; // 最大宽度
            const maxHeight = 1200; // 最大高度
            let width = img.width;
            let height = img.height;

            // 按比例调整尺寸
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
                // 使用增强的上传函数
                if (window.mediaUpload && typeof window.mediaUpload.uploadFile === 'function') {
                    window.mediaUpload.uploadFile(blob, 'image', (url, error) => {
                        if (url) {
                            // 成功获取URL后发送消息
                            if (window.chatUtils && typeof window.chatUtils.sendMessage === 'function') {
                                window.chatUtils.sendMessage('image', url);
                            } else if (typeof window.sendMessageToFirebase === 'function') {
                                window.sendMessageToFirebase('image', blob);
                            }
                        } else {
                            alert('图片上传失败，请重试');
                        }
                    });
                } else {
                    // 使用原始发送函数
                    if (typeof window.sendMessageToFirebase === 'function') {
                        window.sendMessageToFirebase('image', blob);
                    } else {
                        alert('无法发送图片，请刷新页面重试');
                    }
                }
            }, 'image/jpeg', 0.85); // JPEG格式，质量85%
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 转换HEIC/HEIF格式为JPEG
function convertHeicToJpeg(heicFile, callback) {
    // 检查是否有heic2any库
    if (!window.heic2any) {
        // 动态加载库
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.3/dist/heic2any.min.js';
        script.onload = function () {
            if (window.heic2any) {
                convertWithHeic2any(heicFile, callback);
            } else {
                callback(null);
            }
        };
        script.onerror = function () {
            callback(null);
        };
        document.head.appendChild(script);
    } else {
        convertWithHeic2any(heicFile, callback);
    }
}

// 使用heic2any库进行转换
function convertWithHeic2any(heicFile, callback) {
    window.heic2any({
        blob: heicFile,
        toType: 'image/jpeg',
        quality: 0.8
    })
        .then(jpegBlob => {
            // 给转换后的Blob添加文件名
            const jpegFile = new File(
                [jpegBlob],
                heicFile.name.replace(/\.(heic|heif)$/i, '.jpg'),
                { type: 'image/jpeg' }
            );
            callback(jpegFile);
        })
        .catch(err => {
            console.error('HEIC转换失败:', err);
            callback(null);
        });
} 