'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import './css/notfound.css';

const NotFound = () => {
    const router = useRouter();
    const handleGoHome = () =>
    {
        router.push('/lessons');
    }
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h1 className="font_main">ไม่พบหน้านี้</h1>
        <p className="font_description ">
          ขออภัย หน้าเพจทีกำลังค้นหาไม่พบหรือถูกย้ายไปแล้ว
        </p>
       <button type= "submit" className="first_button_getstart" onClick={handleGoHome}>
            <h1 className="font_description_white normal">กลับสู่หน้าหลัก</h1>
       </button>
      </div>
    </div>
  );
};

export default NotFound;