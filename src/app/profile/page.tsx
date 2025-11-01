"use client"
import { useState, useEffect } from "react";
import "./../css/profile.css";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from '../axios';


export default function Profile() {
    const [editMode, setEditMode] = useState(false);
    const [profile, setProfile] = useState({
        username: "",
        name: "",
        surname: "",
        tel: "",
        sex: "",
        birthday: "",
        email: "",
        password: "******"
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await axios.get("/getdata");
                if (res.data.success) {
                    const user = res.data.user;
                    const birthday = new Date(user.birthday).toISOString().split("T")[0];
                    setProfile({
                        username: user.username,
                        name: user.name,
                        surname: user.surname,
                        tel: user.tel,
                        sex: user.sex,
                        birthday,
                        email: user.email,
                        password: "*******"
                    });
                }
            } catch (err) {
                console.error("Error loading profile:", err);
            }
        };

        fetchUserProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleEdit = () => setEditMode(true);
const handleSave = async () => {
  try {
    // คัดลอกข้อมูล profile
    const dataToSend = { ...profile };

    // ถ้า password ยังเป็น "*******" แปลว่ายังไม่ได้แก้ไข → ไม่ต้องส่งไป
    if (dataToSend.password === "*******") {
      delete dataToSend.password;
    }

    const res = await axios.put("/updateprofile", dataToSend);

    if (res.data.success) {
      alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
      setEditMode(false);

      // reset password field เป็น "*******" หลังบันทึก
      setProfile(prev => ({ ...prev, password: "*******" }));

    } else {
      alert("อัปเดตไม่สำเร็จ");
    }
  } catch (err) {
    console.error("Error saving profile:", err);
    alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
  }
};
    return (
        <div className="profileContainer">
            <div className="profileAvatar">
                <div className="profileAvatarCircle">
                    <svg width="90" height="90" fill="#fff">
                        <circle cx="45" cy="33" r="22" />
                        <ellipse cx="45" cy="70" rx="36" ry="22" />
                    </svg>
                </div>
            </div>
            <form className="profileForm" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input
                    type="text"
                    name="username"
                    placeholder="ชื่อผู้ใช้"
                    value={profile.username}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`input_button${editMode ? " editable" : ""}`}
                    style={{ width: "100%" }}
                />
                <div style={{ display: "flex", gap: "20px" }}>
                    <input
                        type="text"
                        name="name"
                        placeholder="ชื่อ"
                        value={profile.name}
                        onChange={handleChange}
                        disabled={!editMode}
                        className={`input_button${editMode ? " editable" : ""}`}
                        style={{ flex: 1, minWidth: 0 }}
                    />
                    <input
                        type="text"
                        name="surname"
                        placeholder="นามสกุล"
                        value={profile.surname}
                        onChange={handleChange}
                        disabled={!editMode}
                        className={`input_button${editMode ? " editable" : ""}`}
                        style={{ flex: 1, minWidth: 0 }}
                    />
                </div>

                <div style={{ display: "flex", gap: "20px" }}>
                    {editMode ? (
                        <>
                            <select
                                name="sex"
                                className="input_button dropdown_only editable"
                                value={profile.sex}
                                onChange={handleChange}
                                style={{ flex: 1, minWidth: 0 }}
                            >
                                <option value="" disabled hidden>เพศ</option>
                                <option value="female">หญิง</option>
                                <option value="male">ชาย</option>
                                <option value="other">ไม่ระบุ</option>
                            </select>
                            <div className="datepicker_container" style={{ flex: 1, minWidth: 0 }}>
                                <ReactDatePicker
                                    selected={profile.birthday ? new Date(profile.birthday) : null}
                                    onChange={(date) => setProfile({ ...profile, birthday: date ? date.toISOString().split("T")[0] : "" })}
                                    dateFormat="dd / MM / yyyy"
                                    placeholderText="วัน / เดือน / ปี เกิด"
                                    className="input_button"
                                    maxDate={new Date()}
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                            />
                            </div>
                        </>
                    ) : (
                        <>
                            <input
                                type="text"
                                name="sex"
                                placeholder="เพศ"
                                value={profile.sex === "male" ? "ชาย" : profile.sex === "female" ? "หญิง" : "ไม่ระบุ"}
                                disabled
                                className="input_button"
                                style={{ flex: 1, minWidth: 0 }}
                            />
                            <input
                                type="text"
                                name="birthday"
                                placeholder="วันเกิด"
                                value={
                                    profile.birthday
                                        ? new Date(profile.birthday).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric"
                                        })
                                        : ""
                                }
                                disabled
                                className="input_button"
                                style={{ flex: 1, minWidth: 0 }}
                            />
                        </>
                    )}
                </div>

                {/* อีเมล */}
                <input
                    type="email"
                    name="email"
                    placeholder="อีเมล"
                    value={profile.email}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`input_button${editMode ? " editable" : ""}`}
                    style={{ width: "100%" }}
                />

                <input
                    type="tel"
                    name="tel"
                    placeholder="เบอร์โทร"
                    value={profile.tel}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`input_button${editMode ? " editable" : ""}`}
                    style={{ width: "100%" }}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="รหัสผ่าน"
                    value={profile.password}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`input_button${editMode ? " editable" : ""}`}
                    style={{ width: "100%" }}
                />

                <div style={{ display: "flex", justifyContent: "center" }}>
                    <button
                        type="button"
                        onClick={editMode ? handleSave : handleEdit}
                        className="first_button_getstart"
                        style={{ marginTop: 12 }}
                    >
                        <h1 className="font_description_white normal">
                            {editMode ? "บันทึก" : "แก้ไข"}
                        </h1>
                    </button>
                </div>
            </form>
        </div>
    );
}