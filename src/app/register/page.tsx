"use client";
import { AiOutlineLeft } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { showLoadingPopup, showSuccessPopup, showErrorPopup, removeExistingPopup } from "../components/Popup";
import "../css/component.css";
import "../css/container.css";
import axios from "../axios";
import Image from 'next/image';

interface ApiError {
    response?: {
        status?: number;
        data?: {
            conflicts?: {
                username?: string;
                email?: string;
            };
            message?: string;
        };
    };
}

export default function Register() {
    const router = useRouter();
    const [form, setForm] = useState({
        username: "",
        firstname: "",
        lastname: "",
        sex: "",
        birthday: "",
        email: "",
        password: "",
        confirmPassword: "",
        tel: ""
    });
    const [birthday, setDob] = useState<Date | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCheckUser = async () => {
        try {
            const res = await axios.post("/check-user", {
                username: form.username,
                email: form.email
            });
            return res.data.success === true;
        } catch (err) {
            const error = err as ApiError;
            if (error.response?.status === 409) {
                const conflict = error.response.data?.conflicts;
                if (conflict?.username) showErrorPopup("ชื่อผู้ใช้นี้ถูกใช้แล้ว", conflict.username);
                if (conflict?.email) showErrorPopup("อีเมลนี้ถูกใช้แล้ว", conflict.email);
            } else {
                showErrorPopup("เกิดข้อผิดพลาด", "ไม่สามารถตรวจสอบชื่อผู้ใช้ได้");
            }
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.username.trim()) {
            showErrorPopup("ข้อมูลไม่ครบถ้วน", "กรุณากรอกชื่อผู้ใช้");
            return;
        }
        if (!form.firstname.trim()) {
            showErrorPopup("ข้อมูลไม่ครบถ้วน", "กรุณากรอกชื่อ");
            return;
        }
        if (!form.lastname.trim()) {
            showErrorPopup("ข้อมูลไม่ครบถ้วน", "กรุณากรอกนามสกุล");
            return;
        }
        if (!form.sex) {
            showErrorPopup("ข้อมูลไม่ครบถ้วน", "กรุณาเลือกเพศ");
            return;
        }
        if (!form.birthday || !birthday) {
            showErrorPopup("ข้อมูลไม่ครบถ้วน", "กรุณาเลือกวันเกิด");
            return;
        }
        if (!form.email.trim()) {
            showErrorPopup("ข้อมูลไม่ครบถ้วน", "กรุณากรอกอีเมล");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            showErrorPopup("รูปแบบอีเมลไม่ถูกต้อง", "กรุณากรอกอีเมลให้ถูกต้อง");
            return;
        }
        if (!form.password) {
            showErrorPopup("ข้อมูลไม่ครบถ้วน", "กรุณากรอกรหัสผ่าน");
            return;
        }
        if (form.password.length < 6) {
            showErrorPopup("รหัสผ่านไม่ถูกต้อง", "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
            return;
        }
        if (!form.confirmPassword) {
            showErrorPopup("ข้อมูลไม่ครบถ้วน", "กรุณายืนยันรหัสผ่าน");
            return;
        }
        if (form.password !== form.confirmPassword) {
            showErrorPopup("รหัสผ่านไม่ตรงกัน", "กรุณากรอกรหัสผ่านและยืนยันรหัสผ่านให้ตรงกัน");
            return;
        }

        const valid = await handleCheckUser();
        if (!valid) return;

        showLoadingPopup("กำลังส่ง OTP", "กรุณารอสักครู่...");

        try {
            const otpRes = await axios.post("send-otp", {
                email: form.email,
                purpose: "register"
            });

            if (otpRes.data.success) {
                removeExistingPopup();
                showSuccessPopup("ส่งรหัส OTP สำเร็จ", "กรุณาตรวจสอบอีเมลของคุณ", () => {
                    const registrationData = encodeURIComponent(JSON.stringify({
                        username: form.username,
                        name: form.firstname,
                        surname: form.lastname,
                        sex: form.sex,
                        birthday: form.birthday,
                        email: form.email,
                        password: form.password,
                        tel: form.tel
                    }));
                    router.push(`/otp?type=register&data=${registrationData}`);
                });
            } else {
                removeExistingPopup();
                showErrorPopup("ส่งรหัส OTP ล้มเหลว", otpRes.data.message || "ไม่สามารถส่งอีเมลได้");
            }
        } catch (err) {
            console.error("OTP error", err);
            removeExistingPopup();
            showErrorPopup("เกิดข้อผิดพลาด", "ไม่สามารถส่งรหัส OTP ได้");
        }
    };

    return (
        <main>
            <div className="login_container_top">
                <button onClick={() => window.history.back()} style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}>
                    <AiOutlineLeft size={45} className="back-button" />
                </button>
                <h1 className="font_heading">ยินดีต้อนรับสู่ Sign Lab</h1>
            </div>
            <div className="login_container_outer">
                <div className="login_container_inner">
                    <Image 
                        src="/picintro.png" 
                        alt="Introduction" 
                        width={400}
                        height={400}
                        priority
                    />
                    <div className="login_container_inner_right" style={{ justifyContent: "space-between", flex: 1 }}>
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <input
                                name="username"
                                type="text"
                                placeholder="ชื่อผู้ใช้"
                                className="input_button"
                                value={form.username}
                                onChange={handleChange}
                                style={{ width: "100%" }}
                            />
                            <div style={{ display: "flex", gap: "20px" }}>
                                <input
                                    name="firstname"
                                    type="text"
                                    placeholder="ชื่อ"
                                    className="input_button"
                                    value={form.firstname}
                                    onChange={handleChange}
                                    style={{ flex: 1, minWidth: 0 }}
                                />
                                <input
                                    name="lastname"
                                    type="text"
                                    placeholder="นามสกุล"
                                    className="input_button"
                                    value={form.lastname}
                                    onChange={handleChange}
                                    style={{ flex: 1, minWidth: 0 }}
                                />
                            </div>
                            <div style={{ display: "flex", gap: "20px" }}>
                                <select
                                    name="sex"
                                    className="input_button dropdown_only"
                                    value={form.sex}
                                    onChange={handleChange}
                                    id="dropdown"
                                >
                                    <option value="" disabled hidden>เพศ</option>
                                    <option value="female">หญิง</option>
                                    <option value="male">ชาย</option>
                                    <option value="other">ไม่ระบุ</option>
                                </select>
                                <div className="datepicker_container">
                                    <ReactDatePicker
                                        selected={birthday}
                                        onChange={(date) => {
                                            setDob(date);
                                            setForm({ ...form, birthday: date ? date.toISOString().split("T")[0] : "" });
                                        }}
                                        dateFormat="dd / MM / yyyy"
                                        placeholderText="วัน / เดือน / ปี เกิด"
                                        className="input_button"
                                        maxDate={new Date()}
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                    />
                                </div>
                            </div>

                            <input
                                name="email"
                                type="email"
                                placeholder="อีเมล"
                                className="input_button"
                                value={form.email}
                                onChange={handleChange}
                                style={{ width: "100%" }}
                            />
                            <input
                                name="tel"
                                type="tel"
                                placeholder="เบอร์โทร"
                                className="input_button"
                                value={form.tel}
                                onChange={handleChange}
                                style={{ width: "100%" }}
                            />

                            <div style={{ position: "relative" }}>
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="รหัสผ่าน"
                                    className="input_button"
                                    value={form.password}
                                    onChange={handleChange}
                                    style={{ width: "100%" }}
                                />
                            </div>
                            <div style={{ position: "relative" }}>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="ยืนยันรหัสผ่าน"
                                    className="input_button"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    style={{ width: "100%" }}
                                />
                            </div>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <button type="submit" className="first_button_getstart" style={{ marginTop: 12 }}>
                                    <h1 className="font_description_white normal">รับรหัส OTP</h1>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}