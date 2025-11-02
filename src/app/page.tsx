"use client";
import "./css/container.css";
import "./css/component.css";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  
  const handleClick = useCallback((command: string) => {
    router.push(`/${command}`);
  }, [router]);

  return (
    <main className="container_outer">
      <div className="container_top">
        <h1 className="font_heading bold">Sign Lab</h1>
        <button 
          type="button"
          className="first_button_register" 
          onClick={() => handleClick("login")}
          aria-label="ไปยังหน้าเข้าสู่ระบบ"
        >
          <h1 className="font_description normal">ฉันมีบัญชีอยู่แล้ว</h1>
        </button>
      </div>
      <div className="container_bottom">
        <Image 
          src="/picintro.png" 
          alt="Introduction to Sign Lab" 
          width={500}
          height={500}
          priority
        />
        <div className="first_container_bottom_left">
          <h1 className="font_heading_Skyblue">เรียนภาษามือง่าย ๆ ได้ทุกที่ ทุกเวลา</h1>
          <button 
            type="button"
            className="first_button_getstart" 
            onClick={() => handleClick("register")}
            aria-label="ไปยังหน้าสมัครสมาชิก"
          >
            <h1 className="font_description_white normal">มาเริ่มกันเลย</h1>
          </button>
        </div>
      </div>
    </main>
  );
}