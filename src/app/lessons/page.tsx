"use client"
// ลบ imports ที่ไม่ได้ใช้
import LessonGrid from "../components/Lessongrid";
import { useRouter } from "next/navigation";
import { FaList } from "react-icons/fa6";
import "../css/lessons.css";
import { showConfirmPopup, removeExistingPopup } from "../components/Popup";
import { useState, useEffect } from "react";
import axiosInstance from "../axios";
import useAuthCheck from "../hooks/useAuthCheck";
import { jwtDecode } from "jwt-decode";

// สร้าง interface สำหรับ JWT payload
interface JwtPayload {
    id: string;
    email: string;
}

export default function Lessons() {
    const router = useRouter();
    const [show1, setshow1] = useState(false);
    const [show2, setshow2] = useState(false);
    const [show3, setshow3] = useState(false);
    const [show4, setshow4] = useState(false);
    const [show5, setshow5] = useState(false);
    const { loading, isAuthenticated } = useAuthCheck();

    const [userProgress, setUserProgress] = useState({
        lastCompletedChapter: 0,
        lastCompletedStage: 0,
    });

    useEffect(() => {
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

                const decoded = jwtDecode<JwtPayload>(token);
                console.log("User ID from token:", decoded.id);

                const userRes = await axiosInstance.get("/getdata");
                if (userRes.data.success) {
                    const progressRes = await axiosInstance.get(`/stage-progress/${decoded.id}`);
                    if (progressRes.data.success && progressRes.data.progress) {
                        setUserProgress({
                            lastCompletedChapter: progressRes.data.progress.lesson_id + 1,
                            lastCompletedStage: progressRes.data.progress.last_stage_id,
                        });
                    } else {
                        setUserProgress({
                            lastCompletedChapter: 1,
                            lastCompletedStage: 0,
                        });
                    }
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
                const error = err as { response?: { status?: number } };
                
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
                    setUserProgress({
                        lastCompletedChapter: 1,
                        lastCompletedStage: 0,
                    });
                } else {
                    setUserProgress({
                        lastCompletedChapter: 1,
                        lastCompletedStage: 0,
                    });
                }
            }
        };

        if (!loading && isAuthenticated) {
            fetchUserData();
        }
    }, [loading, isAuthenticated, router]);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            removeExistingPopup();
            showConfirmPopup(
                "ไม่สามารถเข้าใช้งานได้",
                "กรุณาเข้าสู่ระบบก่อนใช้งานฟีเจอร์นี้",
                () => {
                    router.push("/");
                }
            );
        }
    }, [loading, isAuthenticated, router]);

    const toggleGrid1 = () => setshow1(!show1);
    const toggleGrid2 = () => setshow2(!show2);
    const toggleGrid3 = () => setshow3(!show3);
    const toggleGrid4 = () => setshow4(!show4);
    const toggleGrid5 = () => setshow5(!show5);
    
    const handleStageClick = (chapterNumber: number, stageId: number) => {
        console.log(`เริ่มบทที่ ${chapterNumber} ด่านที่ ${stageId}`);
        router.push(`/lessons/chapter/stage${chapterNumber}/${stageId}`);
    }

    if (loading) {
        return (
            <main style={{
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
                    <p className="font_description">กำลังตรวจสอบสิทธิ์...</p>
                </div>
            </main>
        );
    }

    return (
        <main style={{display:"flex", minHeight:"100vh"}}>
            <div style={{ flex: 1, padding: "30px", display: "flex", flexDirection: "column", gap: "30px" }}>
                <div className="main_container">
                    <div className="main_component" style={{backgroundColor: show1 ? "var(--skyblue)" : "transparent"}}>
                        <button onClick={toggleGrid1} className="lesson_bar" >
                            <FaList size={25} />
                            <h1 className="font_main bold lesson_text">
                                บทที่ 1: การทักทายแนะนำตนเอง
                            </h1>
                        </button>
                        {show1 && (
                            <LessonGrid 
                                chapterNumber={1}
                                userProgress={userProgress}
                                onStageClick={(stageId) => handleStageClick(1, stageId)}/>
                        )}
                    </div>

                    <div className="main_component" style={{backgroundColor: show2 ? "var(--skyblue)" : "transparent"}}>
                        <button onClick={toggleGrid2} className="lesson_bar">
                            <FaList size={25} />
                            <h1 className="font_main bold lesson_text">
                                บทที่ 2: ตัวเลข
                            </h1>
                        </button>
                        {show2 && (
                            <LessonGrid 
                                chapterNumber={2}
                                userProgress={userProgress}
                                onStageClick={(stageId) => handleStageClick(2, stageId)}/>
                        )}
                    </div>

                    <div className="main_component" style={{backgroundColor: show3 ? "var(--skyblue)" : "transparent"}}>
                        <button onClick={toggleGrid3} className="lesson_bar">
                            <FaList size={25} />
                            <h1 className="font_main bold lesson_text">
                                บทที่ 3: พยัญชนะ
                            </h1>
                        </button>
                        {show3 && (
                            <LessonGrid 
                                chapterNumber={3}
                                userProgress={userProgress}
                                onStageClick={(stageId) => handleStageClick(3, stageId)}/>
                        )}
                    </div>

                    <div className="main_component" style={{backgroundColor: show4 ? "var(--skyblue)" : "transparent"}}>
                        <button onClick={toggleGrid4} className="lesson_bar">
                            <FaList size={25} />
                            <h1 className="font_main bold lesson_text">
                                บทที่ 4: สระ วรรณยุกต์
                            </h1>
                        </button>
                        {show4 && (
                            <LessonGrid 
                                chapterNumber={4}
                                userProgress={userProgress}
                                onStageClick={(stageId) => handleStageClick(4, stageId)}/>
                        )}
                    </div>

                    <div className="main_component" style={{backgroundColor: show5 ? "var(--skyblue)" : "transparent"}}>
                        <button onClick={toggleGrid5} className="lesson_bar">
                            <FaList size={25} />
                            <h1 className="font_main bold lesson_text">
                                บทที่ 5: วันและเวลา
                            </h1>
                        </button>
                        {show5 && (
                            <LessonGrid 
                                chapterNumber={5}
                                userProgress={userProgress}
                                onStageClick={(stageId) => handleStageClick(5, stageId)}/>
                        )}
                    </div>

                    <div className="main_component">
                        <button className="lesson_bar coming-soon">
                            <h1 className="font_main bold lesson_text">
                                Coming soon.....
                            </h1>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}