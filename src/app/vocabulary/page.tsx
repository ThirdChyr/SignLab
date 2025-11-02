"use client";
import "./vocabulary.css";
import { useState, useEffect, useCallback } from "react";
import axios from "../axios";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { showConfirmPopup, removeExistingPopup } from "../components/Popup";
import Image from 'next/image';

interface JwtPayload {
  id: string;
}

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

interface VocabItem {
  id: number;
  question: string;
  video?: string;
  image?: string;
}

// Stage 1: ทักทาย (video)
const greetData: VocabItem[] = [
  { id: 1, question:"ฉัน", video: "/chapter/stage1/01.mp4" },
  { id: 2, question: "ขอโทษ", video: "/chapter/stage1/02.mp4" },
  { id: 3, question: "ขอบคุณ", video: "/chapter/stage1/03.mp4" },
  { id: 4, question: "สวัสดี", video: "/chapter/stage1/04.mp4" },
  { id: 5, question: "แนะนำ", video: "/chapter/stage1/05.mp4" },
  { id: 6, question: "สบายดี", video: "/chapter/stage1/06.mp4" },
  { id: 7, question: "พบ (คนหนึ่งและอีกคนหนึ่งพบกัน)", video: "/chapter/stage1/07.mp4" },
  { id: 8, question: "พบ (คุณพบกับฉัน)", video: "/chapter/stage1/08.mp4" },
  { id: 9, question: "ชื่อภาษามือ", video: "/chapter/stage1/09.mp4" },
  { id: 10, question: "ไม่เป็นไร", video: "/chapter/stage1/10.mp4" },
  { id: 11, question: "ไม่สบาย", video: "/chapter/stage1/11.mp4" },
  { id:12, question: "ใช่", video: "/chapter/stage1/12.mp4" },
  { id: 13, question: "ไม่ใช่", video: "/chapter/stage1/13.mp4" },
];

// Stage 2: ตัวเลข (image)
const numberData: VocabItem[] = [
  { id: 1, question: "1", image: "/chapter/stage2/1.png" },
  { id: 2, question: "2", image: "/chapter/stage2/2.png" },
  { id: 3, question: "3", image: "/chapter/stage2/3.png" },
  { id: 4, question: "4", image: "/chapter/stage2/4.png" },
  { id: 5, question: "5", image: "/chapter/stage2/5.png" },
  { id: 6, question: "6", image: "/chapter/stage2/6.png" },
  { id: 7, question: "7", image: "/chapter/stage2/7.png" },
  { id: 8, question: "8", image: "/chapter/stage2/8.png" },
  { id: 9, question: "9", image: "/chapter/stage2/9.png" },
  { id: 10, question: "10", image: "/chapter/stage2/10.png" },
  { id: 11, question: "11", image: "/chapter/stage2/11.png" },
  { id: 12, question: "12", image: "/chapter/stage2/12.png" },
  { id: 13, question: "13", image: "/chapter/stage2/13.png" },
  { id: 14, question: "14", image: "/chapter/stage2/14.png" },
  { id: 15, question: "15", image: "/chapter/stage2/15.png" },
  { id: 16, question: "16", image: "/chapter/stage2/16.png" },
  { id: 17, question: "17", image: "/chapter/stage2/17.png" },
  { id: 18, question: "18", image: "/chapter/stage2/18.png" },
  { id: 19, question: "19", image: "/chapter/stage2/19.png" },
  { id: 20, question: "20", image: "/chapter/stage2/20.png" },
  { id: 21, question: "30", image: "/chapter/stage2/21.png" },
  { id: 22, question: "40", image: "/chapter/stage2/22.png" },
  { id: 23, question: "50", image: "/chapter/stage2/23.png" },
  { id: 24, question: "60", image: "/chapter/stage2/24.png" },
  { id: 25, question: "70", image: "/chapter/stage2/25.png" },
  { id: 26, question: "80", image: "/chapter/stage2/26.png" },
  { id: 27, question: "90", image: "/chapter/stage2/27.png" },
  { id: 28, question: "100", image: "/chapter/stage2/28.png" },
  { id: 29, question: "1,000", image: "/chapter/stage2/29.png" },
  { id: 30, question: "10,000", image: "/chapter/stage2/30.png" },
  { id: 31, question: "100,000", image: "/chapter/stage2/31.png" },
  { id: 32, question: "1,000,000", image: "/chapter/stage2/32.png" },
  { id: 33, question: "10,000,000", image: "/chapter/stage2/33.png" },
  { id: 34, question: "100,000,000", image: "/chapter/stage2/34.png" },
];

// Stage 5: วันและเวลา (video)
const timeData: VocabItem[] = [
  { id: 1, question: "วัน", video: "/chapter/stage5/01.mp4" },
  { id: 2, question: "สัปดาห์", video: "/chapter/stage5/02.mp4" },
  { id: 3, question: "เดือน", video: "/chapter/stage5/03.mp4" },
  { id: 4, question: "ปี", video: "/chapter/stage5/04.mp4" },
  { id: 5, question: "ชั่วโมง", video: "/chapter/stage5/05.mp4" },
  { id: 6, question: "นาที", video: "/chapter/stage5/06.mp4" },
  { id: 7, question: "วินาที", video: "/chapter/stage5/07.mp4" },
  { id: 8, question: "ขณะนี้", video: "/chapter/stage5/08.mp4" },
  { id: 9, question: "เมื่อวานนี้", video: "/chapter/stage5/09.mp4" },
  { id: 10, question: "มะรืนนี้", video: "/chapter/stage5/10.mp4" },
  { id: 11, question: "เมื่อวานซืน", video: "/chapter/stage5/11.mp4" },
  { id: 12, question: "วันจันทร์", video: "/chapter/stage5/12.mp4" },
  { id: 13, question: "วันอังคาร", video: "/chapter/stage5/13.mp4" },
  { id: 14, question: "วันพุธ", video: "/chapter/stage5/14.mp4" },
  { id: 15, question: "วันพฤหัสบดี", video: "/chapter/stage5/15.mp4" },
  { id: 16, question: "วันศุกร์", video: "/chapter/stage5/16.mp4" },
  { id: 17, question: "วันเสาร์", video: "/chapter/stage5/17.mp4" },
  { id: 18, question: "วันอาทิตย์", video: "/chapter/stage5/18.mp4" },
  { id: 19, question: "มกราคม", video: "/chapter/stage5/19.mp4" },
  { id: 20, question: "กุมภาพันธ์", video: "/chapter/stage5/20.mp4" },
  { id: 21, question: "มีนาคม", video: "/chapter/stage5/21.mp4" },
  { id: 22, question: "เมษายน", video: "/chapter/stage5/22.mp4" },
  { id: 23, question: "พฤษภาคม", video: "/chapter/stage5/23.mp4" },
  { id: 24, question: "มิถุนายน", video: "/chapter/stage5/24.mp4" },
  { id: 25, question: "กรกฎาคม", video: "/chapter/stage5/25.mp4" },
  { id: 26, question: "สิงหาคม", video: "/chapter/stage5/26.mp4" },
  { id: 27, question: "กันยายน", video: "/chapter/stage5/27.mp4" },
  { id: 28, question: "ตุลาคม", video: "/chapter/stage5/28.mp4" },
  { id: 29, question: "พฤศจิกายน", video: "/chapter/stage5/29.mp4" },
  { id: 30, question: "ธันวาคม", video: "/chapter/stage5/30.mp4" },
];

export default function Vocabulary() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupData, setPopupData] = useState<VocabItem | null>(null);
  const router = useRouter();

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        removeExistingPopup();
        showConfirmPopup(
          "ไม่พบข้อมูลการเข้าสู่ระบบ",
          "กรุณาเข้าสู่ระบบเพื่อใช้งานฟีเจอร์นี้",
          () => {
            router.push("/");
          }
        );
        return;
      }

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        const decoded = jwtDecode<JwtPayload>(token);
        console.log("User ID from token:", decoded.id);
      } catch (e) {
        console.warn("Invalid token format:", e);
        localStorage.removeItem("token");
        removeExistingPopup();
        showConfirmPopup(
          "ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง",
          "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
          () => {
            router.push("/");
          }
        );
        return;
      }

      const userRes = await axios.get("/getdata");
      if (!userRes.data?.success) {
        throw new Error("Failed to fetch user data");
      }

      console.log("User data fetched:", userRes.data.user);

    } catch (err) {
      const error = err as ApiError;
      console.error("Error fetching user data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        removeExistingPopup();
        showConfirmPopup(
          "เซสชันหมดอายุ",
          "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
          () => {
            router.push("/");
          }
        );
      } else if (error.response?.status === 403) {
        console.warn("Access forbidden (403) - No redirect");
      } else {
        removeExistingPopup();
        showConfirmPopup(
          "ไม่สามารถดึงข้อมูลผู้ใช้ได้",
          "กรุณาลองใหม่อีกครั้ง",
          () => {}
        );
      }
    }
  }, [router]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handlePopup = useCallback((data: VocabItem) => {
    setPopupData(data);
    setPopupOpen(true);
  }, []);

  const closePopup = useCallback(() => {
    setPopupOpen(false);
  }, []);

  const renderPopupMedia = useCallback(() => {
    if (!popupData) return null;
    if (popupData.video) {
      return (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <video
            src={popupData.video}
            controls
            width={320}
            style={{ borderRadius: 12, background: "#000" }}
            preload="auto"
          />
        </div>
      );
    }
    if (popupData.image) {
      return (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <Image 
            src={popupData.image} 
            alt={popupData.question} 
            width={320} 
            height={320}
            style={{ borderRadius: 12 }} 
          />
        </div>
      );
    }
    return null;
  }, [popupData]);

  return (
    <div className="vocab-bg">
      <div className="vocab-section">
        <div className="vocab-title">การทักทายแนะนำตนเอง</div>
        <div className="vocab-grid">
          {greetData.map(item => (
            <button className="vocab-card" key={item.id} onClick={() => handlePopup(item)}>
              {item.question}
            </button>
          ))}
        </div>
      </div>
      <div className="vocab-section">
        <div className="vocab-title">ตัวเลข</div>
        <div className="vocab-grid">
          {numberData.map(item => (
            <button className="vocab-card" key={item.id} onClick={() => handlePopup(item)}>
              {item.question}
            </button>
          ))}
        </div>
      </div>
      <div className="vocab-section">
        <div className="vocab-title">วันและเวลา</div>
        <div className="vocab-grid">
          {timeData.map(item => (
            <button className="vocab-card" key={item.id} onClick={() => handlePopup(item)}>
              {item.question}
            </button>
          ))}
        </div>
      </div>
      {popupOpen && popupData && (
        <div className="vocab-popup-bg" onClick={closePopup}>
          <div className="vocab-popup" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: "2rem", marginBottom: "16px" }}>{popupData.question}</div>
            {renderPopupMedia()}
            <button className="vocab-popup-close" onClick={closePopup}>ปิด</button>
          </div>
        </div>
      )}
    </div>
  );
}