"use client";
import { AiOutlineLeft } from "react-icons/ai";
import { useRouter, useSearchParams } from "next/navigation"; 
import { useState, useEffect, useCallback, Suspense } from "react";
import { showLoadingPopup, showSuccessPopup, showErrorPopup, showConfirmPopup, removeExistingPopup } from "../components/Popup";
import "./../css/component.css"; 
import "./../css/container.css"; 
import axios from "../axios";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

interface ParsedData {
  email: string;
}

function OtpForgetContent() {
    const router = useRouter();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [registrationData, setRegistrationData] = useState("");

    useEffect(() => {
        const data = searchParams.get("data");
        if (!data) {
            console.error("ไม่พบ query data");
            return;
        }

        try {
            const decoded = decodeURIComponent(data);
            const parsed: ParsedData = JSON.parse(decoded);
            setEmail(parsed.email);
            setRegistrationData(data);
        } catch (err) {
            console.error("Failed to parse data", err);
        }
    }, [searchParams]);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length <= 1) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            
            if (value && index < 5) {
                const nextInput = document.getElementById(`otp-${index + 1}`);
                nextInput?.focus();
            }
        }
    };

    const handleResendOtp = useCallback(async () => {
        showConfirmPopup(
            "ส่ง OTP ใหม่",
            "ต้องการส่งรหัส OTP ใหม่หรือไม่?",
            async () => {
                showLoadingPopup("กำลังส่ง OTP", "กรุณารอสักครู่...");
                try {
                    await axios.post("/otp-forget", {
                        email,
                        purpose: "reset"
                    });

                    removeExistingPopup();
                    showSuccessPopup("ส่งสำเร็จ", "รหัส OTP ได้ถูกส่งไปยังอีเมลของคุณแล้ว");
                } catch (err) {
                    console.error("Resend OTP error", err);
                    removeExistingPopup();
                    showErrorPopup("ส่งไม่สำเร็จ", "ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่");
                }
            }
        );
    }, [email]);

    const handleSubmit = useCallback(async () => {
        const otpCode = otp.join("");

        if (otpCode.length === 6) {
            showLoadingPopup("กำลังตรวจสอบ", "กรุณารอสักครู่...");

            try {
                await axios.post("/verify-otp", {
                    email,
                    otp: otpCode
                });

                removeExistingPopup();
                showSuccessPopup("สำเร็จ", "กรุณาเปลี่ยนรหัสผ่าน", () => {
                    router.push(`/change-password?data=${registrationData}`);
                });

            } catch (err) {
                const error = err as ApiError;
                console.error("ERROR:", error.response?.data || error.message);
                removeExistingPopup();

                const msg = error?.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่";
                showErrorPopup("ไม่สำเร็จ", msg);
            }
        } else {
            showErrorPopup("ข้อมูลไม่ถูกต้อง", "กรุณากรอก OTP ให้ครบ 6 หลัก");
        }
    }, [otp, email, registrationData, router]);

    return (
        <main className="container_outer">
            <div className="login_container_top">
                <button onClick={() => window.history.back()} style={{background: "transparent", border: "none", padding: 0, cursor: "pointer"}}>
                    <AiOutlineLeft size={45} className="back-button" />
                </button>
            </div>
            <div className="otp_container_center">
                <div className="otp_white_box">
                    <div>
                        <h1 className="font_heading">กรอกรหัส OTP</h1>
                        <p className="font_description">รหัสผ่านได้ถูกส่งไปยังอีเมล <strong>{email}</strong></p>
                    </div>
                    <div className="otp_inputs_container">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                maxLength={1}
                                className="otp_input"
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Backspace' && !digit && index > 0) {
                                        const prevInput = document.getElementById(`otp-${index - 1}`);
                                        prevInput?.focus();
                                    }
                                }}
                            />
                        ))}
                    </div>
                    
                    <h1 className="font_description">
                        ไม่ได้รับรหัส OTP? <button 
                            onClick={handleResendOtp}
                            className="otp_resend_link"
                            style={{background: 'none', border: 'none', padding: 0, cursor: 'pointer'}}
                        >
                            <span className="otp_resend_link bold">ส่งอีกครั้ง</span>
                        </button>
                    </h1>
                    <div>
                        <button className="first_button_getstart" onClick={handleSubmit}>
                            <span className="font_description_white normal">ยืนยัน</span>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function OtpForgetPage() {
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
            <OtpForgetContent />
        </Suspense>
    );
}