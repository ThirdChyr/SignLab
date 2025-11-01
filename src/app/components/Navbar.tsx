"use client"

import { ReactNode } from 'react';
import { useNavigation } from '../hooks/useNavigation';
import { useRouter } from 'next/navigation';
import Navbar from './Navcomponent';
import { CgProfile } from "react-icons/cg";
import { FaBook } from "react-icons/fa6";
import { MdWebAsset } from "react-icons/md";

import { IoPersonSharp } from "react-icons/io5";
import { FaRankingStar } from "react-icons/fa6";
import { GiNotebook } from "react-icons/gi";
import { useState, useEffect } from 'react'; // ← เพิ่ม useEffect
import '../css/container.css';
import '../css/component.css';
import axiosInstance from '../axios'; // ← เพิ่ม import axios
import { showLoadingPopup, showSuccessPopup, showErrorPopup, showConfirmPopup, removeExistingPopup } from "../components/Popup";


interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { pathname, isAtHome, isAuthPage } = useNavigation();
  const [name, setName] = useState("กำลังโหลด..."); // ← เปลี่ยนค่าเริ่มต้น
  const router = useRouter();

  // ← เพิ่ม useEffect เรียก API ดึงชื่อผู้ใช้
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await axiosInstance.get("/getdata");
        if (response.data.success) {
          const userData = response.data.user;
          // ใช้ชื่อจริง หรือ username ถ้าไม่มีชื่อจริง
          const displayName = userData.name 
            ? `${userData.name} ${userData.surname || ''}`.trim()
            : userData.username || "ผู้ใช้";
          
          setName(displayName);
        } else {
          
          setName("ผู้ใช้");
        }
      } catch (error:any) {
        console.error("Error fetching user data:", error);
        
        // ถ้า error 401 (unauthorized) ให้ redirect ไป login
        if (error.response?.status === 401) {

          router.push("/login");
        } else {
          setName("ผู้ใช้");
        }
      }
    };

    // เรียก API เฉพาะเมื่ออยู่ใน home pages
    if (isAtHome) {
      fetchUserName();
    }
  }, [isAtHome, router]);

  console.log('Current page:', pathname);
  console.log('Is at /home:', isAtHome);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const logouthandler = async () => {
    try {
      // ล้าง token จาก storage
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('token');

      // ลบ key ใด ๆ ที่มีคำว่า "token"
      Object.keys(localStorage).forEach((key) => {
        if (key.toLowerCase().includes('token')) localStorage.removeItem(key);
      });

      // ล้าง cookie ทั้งหมด (ตั้งหมดอายุเป็นอดีต)
      document.cookie.split(';').forEach((c) => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
      });

      removeExistingPopup();
      showSuccessPopup('ลงชื่อออกเรียบร้อย');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      router.push('/');
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {isAtHome && (
        <aside className='Nav_bar' style={{ display: "flex", flexDirection: "column", height: "auto" }}>
          <div>
            <h1 className="font_heading background">Sign Lab</h1>
            <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Navbar 
                path="/lessons" 
                currentPath={pathname} 
                onClick={() => handleNavigation("/lessons")}
                icon={<GiNotebook size={25}/>}
                label="บทเรียน"
              />
              <Navbar 
                path="/chapter-camera" 
                currentPath={pathname} 
                onClick={() => handleNavigation("/chapter-camera")}
                icon={<MdWebAsset size={25} />}
                label="เรียนรู้คำศัพท์"
              />
              <Navbar 
                path="/vocabulary" 
                currentPath={pathname} 
                onClick={() => handleNavigation("/vocabulary")}
                icon={<FaBook size={20} />}
                label="คลังคำศัพท์"
              />
              <Navbar 
                path="/ranking" 
                currentPath={pathname} 
                onClick={() => handleNavigation("/ranking")}
                icon={<FaRankingStar size={20} />}
                label="ตารางคะแนน"
              />
              <Navbar 
                path="/profile" 
                currentPath={pathname} 
                onClick={() => handleNavigation("/profile")}
                icon={<IoPersonSharp size={20} />}
                label="โปรไฟล์ของฉัน"
              />
              <button className='Lesson_Button' style={{backgroundColor:"var(--red)"}} onClick={() => logouthandler()}><h1 className = "font_description_white regular">ลงชื่อออก</h1></button>
            </nav>
          </div>
          
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "left" }}>
            <h1 className="font_description_white bold Lesson_Button_name" style={{backgroundColor:"var(--coolgray)"}} >{name}</h1>
          </div>
        </aside>
      )}
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}