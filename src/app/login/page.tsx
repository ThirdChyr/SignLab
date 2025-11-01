"use client";
import { AiOutlineLeft } from "react-icons/ai";
import { useRouter } from "next/navigation"; 
import { useState } from "react";
import Image from "next/image";
import { showLoadingPopup, showSuccessPopup, showErrorPopup, removeExistingPopup } from "../components/Popup";
import "../css/component.css"; 
import "../css/container.css";
import axios from '../axios';

// เพิ่ม interface สำหรับ error type
interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
      [key: string]: unknown;
    };
  };
  message?: string;
}

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      showLoadingPopup("กำลังเข้าสู่ระบบ", "กรุณารอสักครู่...");

      const response = await axios.post('/login', {
        username,
        password
      });

      removeExistingPopup();

      if (response.data?.success) {
        const token = response.data.token;
        
        // เก็บ token ใน localStorage
        localStorage.setItem("token", token);

        // เก็บข้อมูล user ด้วยถ้าต้องใช้
        localStorage.setItem("user", JSON.stringify(response.data.user));

        showSuccessPopup("เข้าสู่ระบบสำเร็จ", "ยินดีต้อนรับเข้าสู่ระบบ");
        
        setTimeout(() => {
          router.push('/lessons');
        }, 1500);
      } else {
        showErrorPopup("เข้าสู่ระบบล้มเหลว", response.data?.message || "ไม่สามารถเข้าสู่ระบบได้");
      }

    } catch (error) {
      removeExistingPopup();
      
      const err = error as ApiError;
      
      if (err.response?.status === 401) {
        showErrorPopup("เข้าสู่ระบบล้มเหลว", "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      } else if (err.response?.status === 500) {
        showErrorPopup("ข้อผิดพลาดของเซิร์ฟเวอร์", "กรุณาลองใหม่อีกครั้ง");
      } else {
        showErrorPopup("ข้อผิดพลาด", err.message || "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
      }
    }
  };

  return (
    <main className="container_outer">
      <div className="login_container_top">
        <button 
          onClick={() => window.history.back()} 
          style={{ 
            background: "transparent", 
            border: "none", 
            padding: 0, 
            cursor: "pointer" 
          }}
        >
          <AiOutlineLeft size={45} className="back-button" />
        </button>
        <h1 className="font_heading">เข้าสู่ระบบ</h1>
      </div>

      <div className="login_container_outer">
        <div className="login_container_inner">
          <Image 
            src="/picintro.png" 
            alt="Introduction" 
            width={400}
            height={300}
            style={{ objectFit: 'contain' }}
          />
          <div className="login_container_inner_right">
            <form onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder="ชื่อผู้ใช้"
                className="input_button"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="รหัสผ่าน"
                className="input_button"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div style={{ 
                justifyContent: "center", 
                alignItems: "center", 
                display: "flex", 
                flexDirection: "column" 
              }}>
                <button
                  type="submit"
                  className="first_button_getstart"
                  onClick={handleLogin}
                  disabled={!username || !password}
                >
                  <h1 className="font_description_white normal">เข้าสู่ระบบ</h1>
                </button>

                <h1 className="font_description">
                  <a href="/forgot-password" className="otp_resend_link">
                    ลืมรหัสผ่าน?
                  </a>
                </h1>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}