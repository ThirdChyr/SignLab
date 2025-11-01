"use client";
import { AiOutlineLeft } from "react-icons/ai";
import { useRouter } from "next/navigation"; 
import { useState } from "react";
import { showSuccessPopup, showErrorPopup, removeExistingPopup } from "../components/Popup";
import axios from "@/app/axios";
import "../css/component.css"; 
import "../css/container.css";

export default function Forgot() {
    const router = useRouter();
    const [email, setEmail] = useState("");
         
    const handleChangePassword = async () => {
        if (email !== "") {
            try {
                const registrationData = encodeURIComponent(JSON.stringify({ email }));
                await axios.post("/otp-forget", {
                    email,
                    purpose: "register",
                });

                removeExistingPopup();
                showSuccessPopup("ส่งสำเร็จ", "รหัส OTP ได้ถูกส่งไปยังอีเมลของคุณแล้ว");
                 
                router.push(`/otp-forget?data=${registrationData}`);
            } catch (err) {
                console.error("Resend OTP error", err);
                removeExistingPopup();
                showErrorPopup("ส่งไม่สำเร็จ", "ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่");
            }
        } else {
            showErrorPopup("กรุณากรอกอีเมล", "");
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleChangePassword();
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
                <h1 className="font_heading">กรุณากรอกอีเมล</h1>
            </div>
            <div className="forgot_container_form">
                <form onSubmit={handleSubmit}>
                    <input 
                        type="email" 
                        placeholder="email" 
                        className="input_button" 
                        style={{minWidth:"600px"}} 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit" className="first_button_getstart">
                        <h1 className="font_description_white normal">ขอรหัส OTP</h1>
                    </button>
                </form>
            </div>
        </main>
    );
}