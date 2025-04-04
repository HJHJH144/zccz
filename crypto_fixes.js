/**
 * 加密功能修复脚本
 * 修复消息加密解密功能
 */

(function () {
    console.log('加密功能修复脚本已加载');

    // 在DOM加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixCryptoFunctions);
    } else {
        fixCryptoFunctions();
    }

    /**
     * 修复加密解密功能
     */
    function fixCryptoFunctions() {
        console.log('正在修复加密解密功能...');

        // 检查CryptoJS是否已加载
        if (typeof CryptoJS === 'undefined') {
            console.error('CryptoJS未加载，正在尝试加载');
            loadCryptoJS();
            return;
        }

        // 修复加密函数
        fixEncryptFunction();

        // 修复解密函数
        fixDecryptFunction();

        // 测试加密功能
        testEncryption();
    }

    /**
     * 加载CryptoJS库
     */
    function loadCryptoJS() {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js';
        script.async = false;
        script.onload = function () {
            console.log('CryptoJS加载成功，继续修复加密功能');
            fixCryptoFunctions();
        };
        script.onerror = function () {
            console.error('CryptoJS加载失败，无法修复加密功能');
            // 尝试备用CDN
            const backupScript = document.createElement('script');
            backupScript.src = 'https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js';
            backupScript.async = false;
            backupScript.onload = function () {
                console.log('CryptoJS从备用CDN加载成功');
                fixCryptoFunctions();
            };
            backupScript.onerror = function () {
                console.error('CryptoJS备用CDN加载失败，将使用弱加密');
                implementWeakEncryption();
            };
            document.head.appendChild(backupScript);
        };
        document.head.appendChild(script);
    }

    /**
     * 修复加密函数
     */
    function fixEncryptFunction() {
        // 检查现有加密函数
        const originalEncrypt = window.encryptMessage;

        // 替换加密函数
        window.encryptMessage = async function (message) {
            if (!message) return '';

            // 确保加密密钥存在
            if (typeof window.encryptionKey === 'undefined' || !window.encryptionKey) {
                console.warn('加密密钥缺失，使用简单加密');
                return simpleEncrypt(message);
            }

            try {
                // 先尝试使用Web Crypto API (如果支持)
                if (window.crypto && window.crypto.subtle) {
                    try {
                        return await modernEncrypt(message);
                    } catch (err) {
                        console.warn('现代加密方法失败，回退到CryptoJS', err);
                    }
                }

                // 使用CryptoJS进行加密
                return 'cryptojs:' + CryptoJS.AES.encrypt(message, window.encryptionKey).toString();
            } catch (error) {
                console.error('加密失败:', error);
                return simpleEncrypt(message);
            }
        };

        console.log('加密函数已修复');
    }

    /**
     * 修复解密函数
     */
    function fixDecryptFunction() {
        // 检查现有解密函数
        const originalDecrypt = window.decryptMessage;

        // 替换解密函数
        window.decryptMessage = async function (encrypted) {
            if (!encrypted) return '';

            // 确保加密密钥存在
            if (typeof window.encryptionKey === 'undefined' || !window.encryptionKey) {
                console.warn('解密密钥缺失，使用简单解密');
                return simpleDecrypt(encrypted);
            }

            try {
                // 检查加密前缀
                if (encrypted.startsWith('cryptojs:')) {
                    // 使用CryptoJS解密
                    const ciphertext = encrypted.substring(9);
                    const bytes = CryptoJS.AES.decrypt(ciphertext, window.encryptionKey);
                    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

                    if (!decrypted) {
                        throw new Error('CryptoJS解密结果为空');
                    }

                    return decrypted;
                } else if (encrypted.startsWith('simple:')) {
                    // 使用简单解密
                    return simpleDecrypt(encrypted);
                } else if (encrypted.startsWith('modern:')) {
                    // 使用现代解密
                    return await modernDecrypt(encrypted);
                } else if (encrypted.startsWith('fallback:')) {
                    // 使用原始方法的后备解密
                    const fallbackData = encrypted.substring(9);
                    const bytes = CryptoJS.AES.decrypt(fallbackData, window.encryptionKey);
                    return bytes.toString(CryptoJS.enc.Utf8);
                } else {
                    // 尝试使用原有方法解密
                    if (typeof originalDecrypt === 'function') {
                        try {
                            return await originalDecrypt(encrypted);
                        } catch (err) {
                            console.warn('原始解密方法失败，尝试其他方法');
                        }
                    }

                    // 最后尝试直接用CryptoJS解密
                    try {
                        const bytes = CryptoJS.AES.decrypt(encrypted, window.encryptionKey);
                        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

                        if (decrypted) {
                            return decrypted;
                        }
                    } catch (err) {
                        console.warn('直接CryptoJS解密失败');
                    }

                    return '[无法解密的消息]';
                }
            } catch (error) {
                console.error('解密失败:', error);
                return '[解密失败]';
            }
        };

        console.log('解密函数已修复');
    }

    /**
     * 简单加密方法（用于不支持高级加密的场景）
     */
    function simpleEncrypt(message) {
        const key = window.encryptionKey || 'default_key';
        let result = '';

        for (let i = 0; i < message.length; i++) {
            let charCode = message.charCodeAt(i);
            let keyChar = key.charCodeAt(i % key.length);
            let encryptedChar = String.fromCharCode(charCode ^ keyChar);
            result += encryptedChar;
        }

        // Base64编码
        return 'simple:' + btoa(result);
    }

    /**
     * 简单解密方法
     */
    function simpleDecrypt(encrypted) {
        if (!encrypted.startsWith('simple:')) {
            return encrypted;
        }

        const key = window.encryptionKey || 'default_key';
        let encoded = encrypted.substring(7); // 移除'simple:'前缀

        try {
            let decoded = atob(encoded);
            let result = '';

            for (let i = 0; i < decoded.length; i++) {
                let charCode = decoded.charCodeAt(i);
                let keyChar = key.charCodeAt(i % key.length);
                let decryptedChar = String.fromCharCode(charCode ^ keyChar);
                result += decryptedChar;
            }

            return result;
        } catch (e) {
            console.error('简单解密失败:', e);
            return '[解密失败]';
        }
    }

    /**
     * 现代加密方法（使用Web Crypto API）
     */
    async function modernEncrypt(message) {
        // 创建从密码派生的加密密钥
        const encoder = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(window.encryptionKey),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );

        // 使用当前会话ID作为盐值
        const salt = encoder.encode('zc_lcz_secure_' + (window.sessionId || Date.now().toString()));

        // 派生AES-GCM密钥
        const key = await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 1000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt']
        );

        // 生成随机IV
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
        return 'modern:' + btoa(String.fromCharCode.apply(null, result));
    }

    /**
     * 现代解密方法
     */
    async function modernDecrypt(encrypted) {
        if (!encrypted.startsWith('modern:')) {
            return encrypted;
        }

        try {
            // 提取密文
            const encryptedBase64 = encrypted.substring(7); // 移除'modern:'前缀

            // 解析Base64字符串
            const encryptedArray = new Uint8Array(
                atob(encryptedBase64).split('').map(char => char.charCodeAt(0))
            );

            // 提取IV和加密数据
            const iv = encryptedArray.slice(0, 12);
            const encryptedData = encryptedArray.slice(12);

            // 创建从密码派生的解密密钥
            const encoder = new TextEncoder();
            const keyMaterial = await window.crypto.subtle.importKey(
                'raw',
                encoder.encode(window.encryptionKey),
                { name: 'PBKDF2' },
                false,
                ['deriveBits', 'deriveKey']
            );

            // 使用和加密相同的盐值
            const salt = encoder.encode('zc_lcz_secure_' + (window.sessionId || Date.now().toString()));

            // 派生AES-GCM密钥
            const key = await window.crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
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
            console.error('现代解密方法失败:', error);
            return '[解密失败]';
        }
    }

    /**
     * 实现弱加密（当CryptoJS和Web Crypto API都不可用时）
     */
    function implementWeakEncryption() {
        console.warn('实现弱加密作为最后手段');

        window.encryptMessage = function (message) {
            return simpleEncrypt(message);
        };

        window.decryptMessage = function (encrypted) {
            return simpleDecrypt(encrypted);
        };
    }

    /**
     * 测试加密功能
     */
    function testEncryption() {
        if (!window.encryptionKey) {
            window.encryptionKey = 'test_key_' + Math.random();
        }

        const testMessage = '测试消息' + Date.now();

        // 异步测试
        (async function () {
            try {
                const encrypted = await window.encryptMessage(testMessage);
                console.log('加密测试 - 加密结果:', encrypted.substring(0, 20) + '...');

                const decrypted = await window.decryptMessage(encrypted);
                console.log('加密测试 - 解密结果:', decrypted);

                if (decrypted === testMessage) {
                    console.log('✓ 加密功能测试通过');
                    window.cryptoFixesApplied = true;
                } else {
                    console.error('✗ 加密功能测试失败 - 解密结果与原文不符');
                    window.cryptoFixesApplied = false;
                }
            } catch (err) {
                console.error('✗ 加密功能测试异常:', err);
                window.cryptoFixesApplied = false;
            }
        })();
    }
})(); 