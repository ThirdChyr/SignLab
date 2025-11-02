"use client";
import { AiOutlineLeft } from "react-icons/ai";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useRef } from "react";
import { showSuccessPopup, showErrorPopup } from "../components/Popup";
import axios from "@/app/axios";
import "../css/component.css";
import "../css/container.css";

function ChangePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasProcessedParams = useRef(false);

  // ✅ แก้ไข useEffect ป้องกัน infinite loop
  useEffect(() => {
    if (hasProcessedParams.current) return;
    
    const processParams = () => {
      try {
        const data = searchParams.get("data");
        
        if (!data) {
          console.error("ไม่พบ query data");
          setIsLoading(false);
          hasProcessedParams.current = true;
          
          setTimeout(() => {
            showErrorPopup("ข้อผิดพลาด", "ไม่พบข้อมูลการยืนยัน", () => {
              router.replace("/forgot-password");
            });
          }, 100);
          return;
        }

        const decoded = decodeURIComponent(data);
        const parsed = JSON.parse(decoded);
        
        if (parsed.email) {
          setEmail(parsed.email);
          setIsLoading(false);
          hasProcessedParams.current = true;
        } else {
          throw new Error("No email in data");
        }
        
      } catch (error) {
        console.error("ไม่สามารถ parse data:", error);
        setIsLoading(false);
        hasProcessedParams.current = true;
        
        setTimeout(() => {
          showErrorPopup("ข้อผิดพลาด", "ข้อมูลไม่ถูกต้อง", () => {
            router.replace("/forgot-password");
          });
        }, 100);
      }
    };

    processParams();
  }, [searchParams, router]);

  const handleChangePassword = async () => {
    if (!email) {
      showErrorPopup("ข้อผิดพลาด", "ไม่พบข้อมูลอีเมล");
      return;
    }

    if (password === "") {
      showErrorPopup("ข้อมูลไม่ถูกต้อง", "กรุณากรอกรหัสผ่าน");
      return;
    }

    if (confirmPassword === "") {
      showErrorPopup("ข้อมูลไม่ถูกต้อง", "กรุณากรอกยืนยันรหัสผ่าน");
      return;
    }

    if (password !== confirmPassword) {
      showErrorPopup("ข้อมูลไม่ตรงกัน", "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    try {
      const res = await axios.post("/forget-password", {
        email: email,
        newPassword: password,
        confirmPassword: confirmPassword,
      });

      if (res.data.success) {
        showSuccessPopup("เปลี่ยนรหัสผ่านสำเร็จ", "กรุณาเข้าสู่ระบบใหม่", () => {
          router.replace("/login");
        });
      } else {
        showErrorPopup(
          "ไม่สำเร็จ",
          res.data.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้"
        );
      }
    } catch (error) {
      console.error("เปลี่ยนรหัสผ่านล้มเหลว:", error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showErrorPopup(
        "เกิดข้อผิดพลาด",
        axiosError.response?.data?.message || "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้"
      );
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleChangePassword();
  };

  // ✅ แสดง loading ขณะตรวจสอบข้อมูล
  if (isLoading) {
    return (
      <main className="container_outer">
        <div style={{
          display: "flex", 
          minHeight: "100vh", 
          alignItems: "center", 
          justifyContent: "center"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #3498db",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px"
            }}></div>
            <p className="font_description">กำลังตรวจสอบข้อมูล...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container_outer">
      <div className="login_container_top">
        <button
          onClick={() => window.history.back()}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          <AiOutlineLeft size={45} className="back-button" />
        </button>
        <h1 className="font_heading">เปลี่ยนรหัสผ่าน</h1>
      </div>
      <div className="forgot_container_form">
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="รหัสผ่าน"
            className="input_button"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="ยืนยันรหัสผ่าน"
            className="input_button"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type="submit" className="first_button_getstart">
            <h1 className="font_description_white normal">ตกลง</h1>
          </button>
        </form>
      </div>
    </main>
  );
}

export default function Forgot() {
  return (
    <Suspense fallback={
      <main className="container_outer">
        <div style={{
          display: "flex", 
          minHeight: "100vh", 
          alignItems: "center", 
          justifyContent: "center"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #3498db",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px"
            }}></div>
            <p className="font_description">กำลังโหลด...</p>
          </div>
        </div>
      </main>
    }>
      <ChangePasswordContent />
    </Suspense>
  );
}