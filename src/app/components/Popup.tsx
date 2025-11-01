"use client";

// ฟังก์ชันสำหรับแสดง Loading Popup
export const showLoadingPopup = (title: string = "กำลังโหลด", message: string = "กรุณารอสักครู่...") => {
    removeExistingPopup();
    
    const overlay = document.createElement('div');
    overlay.id = 'popup-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    const popup = document.createElement('div');
    popup.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 15px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        min-width: 300px;
        max-width: 400px;
    `;
    
    popup.innerHTML = `
        <div style="
            width: 50px;
            height: 50px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        "></div>
        <h2 style="color: #333; margin-bottom: 10px; font-family: inherit;">${title}</h2>
        <p style="color: #666; margin: 0; font-family: inherit;">${message}</p>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
};

// ฟังก์ชันสำหรับแสดง Success Popup
export const showSuccessPopup = (title: string = "สำเร็จ!", message: string = "ดำเนินการเสร็จสิ้น", callback?: () => void) => {
    removeExistingPopup();
    
    const overlay = document.createElement('div');
    overlay.id = 'popup-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    const popup = document.createElement('div');
    popup.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 15px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        min-width: 300px;
        max-width: 400px;
    `;
    
    popup.innerHTML = `
        <div style="color: #4CAF50; font-size: 60px; margin-bottom: 20px;">✅</div>
        <h2 style="color: #333; margin-bottom: 10px; font-family: inherit;">${title}</h2>
        <p style="color: #666; margin: 0; font-family: inherit;">${message}</p>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        removeExistingPopup();
        if (callback) callback();
    }, 1500);
};

// ฟังก์ชันสำหรับแสดง Error Popup
export const showErrorPopup = (title: string = "เกิดข้อผิดพลาด", message: string = "กรุณาลองใหม่อีกครั้ง", callback?: () => void) => {
    removeExistingPopup();
    
    const overlay = document.createElement('div');
    overlay.id = 'popup-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    const popup = document.createElement('div');
    popup.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 15px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        min-width: 300px;
        max-width: 400px;
    `;
    
    popup.innerHTML = `
        <div style="color: #f44336; font-size: 60px; margin-bottom: 20px;">❌</div>
        <h2 style="color: #333; margin-bottom: 10px; font-family: inherit;">${title}</h2>
        <p style="color: #666; margin-bottom: 20px; font-family: inherit;">${message}</p>
        <button id="error-popup-ok" style="
            background: #f44336;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-family: inherit;
        ">ตกลง</button>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    const okButton = document.getElementById('error-popup-ok');
    if (okButton) {
        okButton.addEventListener('click', () => {
            removeExistingPopup();
            if (callback) callback();
        });
    }
};

// ฟังก์ชันสำหรับแสดง Confirmation Popup
export const showConfirmPopup = (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
    removeExistingPopup();
    
    const overlay = document.createElement('div');
    overlay.id = 'popup-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    const popup = document.createElement('div');
    popup.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 15px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        min-width: 300px;
        max-width: 400px;
    `;
    
    popup.innerHTML = `
        <div style="color: #ff9800; font-size: 60px; margin-bottom: 20px;">❓</div>
        <h2 style="color: #333; margin-bottom: 10px; font-family: inherit;">${title}</h2>
        <p style="color: #666; margin-bottom: 30px; font-family: inherit;">${message}</p>
        <div style="display: flex; gap: 15px; justify-content: center;">
            <button id="confirm-popup-cancel" style="
                background: #ccc;
                color: #333;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                font-family: inherit;
            ">ยกเลิก</button>
            <button id="confirm-popup-ok" style="
                background: #4CAF50;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                font-family: inherit;
            ">ตกลง</button>
        </div>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    const okButton = document.getElementById('confirm-popup-ok');
    const cancelButton = document.getElementById('confirm-popup-cancel');
    
    if (okButton) {
        okButton.addEventListener('click', () => {
            removeExistingPopup();
            onConfirm();
        });
    }
    
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            removeExistingPopup();
            if (onCancel) onCancel();
        });
    }
};

export const removeExistingPopup = () => {
    const existingPopup = document.getElementById('popup-overlay');
    if (existingPopup) {
        existingPopup.remove();
    }
};

export const showCustomPopup = (content: string, duration?: number, callback?: () => void) => {
    removeExistingPopup();
    
    const overlay = document.createElement('div');
    overlay.id = 'popup-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    const popup = document.createElement('div');
    popup.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 15px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        min-width: 300px;
        max-width: 400px;
    `;
    
    popup.innerHTML = content;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    if (duration) {
        setTimeout(() => {
            removeExistingPopup();
            if (callback) callback();
        }, duration);
    }
};