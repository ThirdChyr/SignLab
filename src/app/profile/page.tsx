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
            <form className="profileForm">
                <input
                    type="text"
                    name="username"
                    value={profile.username}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`profileInput profileInputLarge${editMode ? " editable" : ""}`}
                />
                <div className="profileInputGroup">
                    <input
                        type="text"
                        name="name"  // เดิม firstname
                        value={profile.name}
                        onChange={handleChange}
                        disabled={!editMode}
                        className={`profileInput${editMode ? " editable" : ""}`}
                    />
                    <input
                        type="text"
                        name="surname"  // เดิม lastname
                        value={profile.surname}
                        onChange={handleChange}
                        disabled={!editMode}
                        className={`profileInput${editMode ? " editable" : ""}`}
                    />
                </div>
                <div className="profileInputGroup">
                    {editMode ? (
                        <>
                            <select
                                name="sex" // เดิม gender
                                value={profile.sex}
                                onChange={handleChange}
                                className="profileInput editable"
                                style={{ color: profile.sex ? "#333333" : "#888", fontFamily: 'Kanit' }}
                            >
                                <option value="male">ชาย</option>
                                <option value="female">หญิง</option>
                                <option value="other">อื่นๆ</option>
                            </select>
                            <ReactDatePicker
                                selected={profile.birthday ? new Date(profile.birthday) : null}
                                onChange={date =>
                                    setProfile({ ...profile, birthday: date ? date.toISOString().slice(0, 10) : "" })
                                }
                                dateFormat="dd/MM/yyyy"
                                className="profileInput editable"
                                wrapperClassName="profileInputDateWrapper"
                                placeholderText="เลือกวันเกิด"
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                            />
                        </>
                    ) : (
                        <>
                            <input
                                type="text"
                                name="gender"
                                value={profile.sex}
                                disabled
                                className="profileInput"
                                style={{ color: "#333333" }}
                            />
                            <input
                                type="text"
                                name="dob"
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
                                className="profileInput"
                                style={{ color: "#333333" }}
                            />
                        </>
                    )}
                </div>
                <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`profileInput${editMode ? " editable" : ""}`}
                />
                <input
                    type="password"
                    name="password"
                    value={profile.password}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`profileInput${editMode ? " editable" : ""}`}
                />
                <button
                    type="button"
                    onClick={editMode ? handleSave : handleEdit}
                    className="profileButton"
                >
                    {editMode ? "บันทึก" : "แก้ไข"}
                </button>
            </form>
        </div>
    );
}