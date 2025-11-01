"use client";
import "./ranking.css";
import { FaUser } from "react-icons/fa";

import { useEffect, useState } from "react";
import axios from "../axios";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { showLoadingPopup, showSuccessPopup, showErrorPopup, showConfirmPopup, removeExistingPopup } from "../components/Popup";

interface UserRank {
  id: number;
  username: string;
  point: number;
  rank: number | string;
}

export default function Ranking() {
  const [leaderboard, setLeaderboard] = useState<UserRank[]>([]);
  const [currentUser, setCurrentUser] = useState<UserRank | null>(null);
  const router = useRouter();

  const fetchUserData = async () => {
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

      // ตั้ง header ให้ axios ส่ง token
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // decode token (ตรวจสอบรูปแบบก่อนใช้งาน)
      let decoded: any;
      try {
        decoded = jwtDecode(token);
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

      // ตรวจสอบว่า endpoint /getdata ตอบกลับสำเร็จ
      const userRes = await axios.get("/getdata");
      if (!userRes.data?.success) {
        throw new Error("Failed to fetch user data");
      }

      // ถ้าต้องการใช้ข้อมูลผู้ใช้ สามารถนำไปใช้ที่นี่
      console.log("User data fetched:", userRes.data.user);

    } catch (err: any) {
      console.error("Error fetching user data:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        removeExistingPopup();
        showConfirmPopup(
          "เซสชันหมดอายุ",
          "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
          () => {
            router.push("/");
          }
        );
      } else if (err.response?.status === 403) {
        // 403 Forbidden - ไม่แจ้งเตือนและไม่ redirect
        console.warn("Access forbidden (403) - No redirect");
      } else {
        removeExistingPopup();
        showConfirmPopup(
          "ไม่สามารถดึงข้อมูลผู้ใช้ได้",
          "กรุณาลองใหม่อีกครั้ง",
          () => {

          }
        );
      }
    }
  };

  useEffect(() => {
    // เรียกเช็คผู้ใช้เมื่อเข้าหน้านี้ (mount)
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get("/leaderboard");
        if (res.data.success) {
          setLeaderboard(res.data.leaderboard);
          setCurrentUser(res.data.current_user);
        }
      } catch (err) {
        console.error("Error loading leaderboard:", err);
      }
    };

    fetchLeaderboard();
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="ranking-bg">
      <div className="ranking-top3-box">
        {top3.map((user, index) => (
          <div key={user.id} className={`ranking-top ranking-top${index + 1}`}>
            <div className="ranking-avatar">
              <FaUser size={65} color="#333" />
            </div>
            <div className="ranking-label">#{user.rank} {user.username}</div>
          </div>
        ))}
      </div>

      <div className="ranking-table-container">
        <div className="ranking-table">
          {others.map((user) => (
            <div key={user.id} className="ranking-row">
              #{user.rank} {user.username}
            </div>
          ))}
        </div>
      </div>

      {currentUser && (
        <div className="ranking-fixed-your">
          Your Rank #{currentUser.rank} {currentUser.username}
        </div>
      )}
    </div>
  );
}