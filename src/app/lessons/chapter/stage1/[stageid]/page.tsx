"use client"
import React, { useState, useEffect } from 'react';
import { useParams,useRouter } from 'next/navigation';

import { AiOutlineLeft } from 'react-icons/ai';
import { useNavigation } from '@/app/hooks/useNavigation';
import { ImCross } from "react-icons/im";
import { showLoadingPopup, showSuccessPopup, showErrorPopup, showConfirmPopup, removeExistingPopup } from '@/app/components/Popup';
import '@/app/css/component.css';
import '@/app/css/container.css';
import '@/app/css/stage.css';
import axios from "@/app/axios";
import { jwtDecode } from "jwt-decode";

export default function Stage() {
    const router = useRouter();
    const [showGate, setShowGate] = useState(true);
    const [progress, setProgress] = useState(0);
    const [progressstage, setProgressstage] = useState(0); 
    const [currentImageIndex, setCurrentImageIndex] = useState(0); 
    const [correctAnswer, setCorrectAnswer] = useState(''); // คำตอบที่ถูกต้อง
    const [currentChoices, setCurrentChoices] = useState<string[]>([]);
    const [currentRound, setCurrentRound] = useState(1); // รอบปัจจุบัน
    const [gameQuestions, setGameQuestions] = useState<any[]>([]); // เก็บคำถาม 5 รอบ
    const [life,setlife] = useState(5); // จำนวนชีวิตเริ่มต้น

    const params = useParams();
    const stageId = parseInt(params.stageid as string);
    const chapterNumber = 2; // เปลี่ยนเป็น 2 เพราะเป็น stage2
    console.log("Chapter:", chapterNumber);
    console.log("Stage ID:", stageId);

   const questionData = [
    {
        id: 1,
        question: "ฉัน",
        hint: "ตัวเอง",
        video: "/chapter/stage1/01.mp4",
    },
    {
        id: 2,
        question: "ขอโทษ",
        hint: "คำที่ใช้แสดงความรู้สึกผิด",
        video: "/chapter/stage1/02.mp4",
    },
    {
        id: 3,
        question: "ขอบคุณ",
        hint: "ใช้แสดงความรู้สึกขอบคุณ",
        video: "/chapter/stage1/03.mp4",
    },
    {
        id: 4,
        question: "สวัสดี",
        hint: "คำทักทาย",
        video: "/chapter/stage1/04.mp4",
    },
    {
        id: 5,
        question: "แนะนำ",
        hint: "แนะนำตัวหรือสิ่งของ",
        video: "/chapter/stage1/05.mp4",
    },
    {
        id: 6,
        question: "สบายดี",
        hint: "คำตอบเมื่อมีคนถามว่าสบายดีไหม",
        video: "/chapter/stage1/06.mp4",
    },
    {
        id: 7,
        question: "พบ (คนหนึ่งและอีกคนหนึ่งพบกัน)",
        hint: "คนหนึ่งและอีกคนหนึ่งพบกัน",
        video: "/chapter/stage1/07.mp4",
    },
    {
        id: 8,
        question: "พบ (คุณพบกับฉัน)",
        hint: "คุณพบกับฉัน",
        video: "/chapter/stage1/08.mp4",
    },
    {
        id: 9,
        question: "ชื่อภาษามือ",
        hint: "ชื่อของภาษามือ",
        video: "/chapter/stage1/09.mp4",
    },
    {
        id: 10,
        question: "ไม่เป็นไร",
        hint: "คำที่ใช้เมื่อให้อภัยหรือไม่ถือสา",
        video: "/chapter/stage1/10.mp4",
    },
    {
        id: 11,
        question: "ไม่สบาย",
        hint: "รู้สึกเจ็บป่วย",
        video: "/chapter/stage1/11.mp4",
    },
    {
        id: 12,
        question: "ใช่",
        hint: "คำยืนยัน",
        video: "/chapter/stage1/12.mp4",
    },
    {
        id: 13,
        question: "ไม่ใช่",
        hint: "คำปฏิเสธ",
        video: "/chapter/stage1/13.mp4",
    },
];

    // ฟังก์ชันสร้างตัวเลือก
    const generateChoices = (correctAnswer: string) => {
        const wrongAnswers = questionData
            .filter(item => item.question !== correctAnswer)
            .map(item => item.question);
        
        // สุ่มเลือก 3 คำตอบผิด
        const shuffledWrong = wrongAnswers.sort(() => Math.random() - 0.5);
        const selectedWrong = shuffledWrong.slice(0, 3);
        
        // รวมกับคำตอบถูก แล้วสุ่มลำดับ
        const allChoices = [...selectedWrong, correctAnswer];
        return allChoices.sort(() => Math.random() - 0.5);
    };

    // สุ่มคำถาม 5 รอบ - เปลี่ยน image เป็น video
    const generateGameQuestions = () => {
        const shuffledQuestions = [...questionData].sort(() => Math.random() - 0.5);
        const selected5Questions = shuffledQuestions.slice(0, 5);
        
        const gameData = selected5Questions.map((question, index) => ({
            round: index + 1,
            correctAnswer: question.question,
            hint: question.hint,
            video: question.video, // เปลี่ยนจาก image เป็น video
            choices: generateChoices(question.question)
        }));
        
        return gameData;
    };

    // เริ่มเกมใหม่
    const startNewGame = () => {
        const newGameQuestions = generateGameQuestions();
        setGameQuestions(newGameQuestions);
        setCurrentRound(1);
        setProgressstage(0);
        setlife(5); // รีเซ็ตชีวิต
        
        // ตั้งค่ารอบแรก
        if (newGameQuestions.length > 0) {
            const firstQuestion = newGameQuestions[0];
            setCorrectAnswer(firstQuestion.correctAnswer);
            setCurrentChoices(firstQuestion.choices);
            setCurrentImageIndex(0);
        }
    };

    // ไปรอบถัดไป
    const nextRound = () => {
        if (currentRound < 5 && currentRound < gameQuestions.length) {
            const nextRoundData = gameQuestions[currentRound];
            setCurrentRound(prev => prev + 1);
            setProgressstage(prev => prev + 1);
            setCorrectAnswer(nextRoundData.correctAnswer);
            setCurrentChoices(nextRoundData.choices);
        }
    };

    const checkAnswer = async (selectedAnswer: string) => {
        if (life === 1) {
            setTimeout(() => {
                showErrorPopup(`หัวใจคุณหมดแล้ว`);
                window.history.back();
            }, 100);
            return;
        }

        if (selectedAnswer === correctAnswer) {
            showSuccessPopup(`ถูกต้อง! คำตอบคือ: ${correctAnswer}`);

            if (currentRound < 5) {
                nextRound(); // ไปรอบถัดไป
            } else {
                setProgressstage(prev => prev + 1);

                try {
                    const token = localStorage.getItem("token");
                    if (!token) {
                        console.error("ไม่พบ token");
                        return;
                    }

                    const decoded: any = jwtDecode(token);
                    const userId = decoded.id;

                    const res = await axios.post("/update-progress", {
                        user_id: userId,
                        stage_id: stageId
                    });

                    if (res.data.success) {
                        console.log("อัปเดต progress สำเร็จ และเพิ่มแต้มแล้ว");
                    } else {
                        console.warn("ไม่อัปเดต:", res.data.message);
                    }
                } catch (error) {
                    console.error("เกิดข้อผิดพลาดในการอัปเดต progress:", error);
                }

                showSuccessPopup(`คุณผ่านด่านแล้ว`);

                setTimeout(() => {
                    window.history.back();
                }, 2000);
            }
        } else {
            showErrorPopup(`ผิด! ยังไม่ถูกต้อง`);
            setlife(prev => prev - 1); // ลดจำนวนชีวิต
        }
    };

    const calculateProgress = () => {
        return (progressstage / 5) * 100;
    };

    const reset = () => {
        startNewGame(); // เริ่มเกมใหม่
    };

    // เริ่มเกมเมื่อโหลดหน้า
    useEffect(() => {
        startNewGame();
    }, []);

    useEffect(() => {
        setProgress(calculateProgress());
    }, [progressstage]); 

    const currentQuestionData = gameQuestions[currentRound - 1] || gameQuestions[0];

    return (
        <main className='container_outer'>
           <div className="login_container_top" style={{display: 'flex',alignItems: 'center',gap: '50px'}}>
                <button onClick={() => window.history.back()} style={{ 
                    background: "transparent", 
                    border: "none", 
                    padding: 0, 
                    cursor: "pointer",
                    flexShrink: 0
                }}>
                    <AiOutlineLeft size={35} className="back-button" />
                </button>

                <div style={{
                    flex: 1,
                    height: '12px',
                    background: 'var(--lightgray)',
                    borderRadius: '10px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'var(--boldskyblue)',
                        borderRadius: '10px',
                        transition: 'width 0.3s ease'
                    }}></div>
                </div>

                <span style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    flexShrink: 0
                }}>
                    <h1 className='icon_size black'>{progressstage}/5</h1>
                </span>
            </div>

            <div className="progress-container" style={{
                 backgroundColor:"transparent", 
                padding: '20px', 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px'
            }}>
                {/* แสดงวิดีโอแทนรูป */}
                {currentQuestionData && (
                    <video
                        key={currentQuestionData.video} // บังคับให้ reload เมื่อเปลี่ยนวิดีโอ
                        src={currentQuestionData.video}
                        width={600}          // ขนาดเท่ากับรูปเดิม
                        height={350}         // ขนาดเท่ากับรูปเดิม
                        autoPlay             // เล่นอัตโนมัติ
                        loop                 // เล่นวนซ้ำ
                        muted                // ไม่มีเสียง
                        playsInline          // สำหรับมือถือ
                        controls={false}     // ไม่แสดงตัวควบคุม
                        preload="auto"       // โหลดล่วงหน้า
                        style={{ 
                            borderRadius: '10px', 
                            objectFit: 'cover',
                            backgroundColor: '#000' // พื้นหลังสีดำ
                        }}
                        onEnded={() => {
                            // เล่นใหม่เมื่อจบ
                            const video = document.querySelector('video') as HTMLVideoElement;
                            if (video) {
                                video.currentTime = 0;
                                video.play();
                            }
                        }}
                    >
                        <source src={currentQuestionData.video} type="video/mp4" />
                        เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
                    </video>
                )}

                {/* แสดงข้อมูลรอบปัจจุบัน */}
                <div style={{ textAlign: 'center', color: 'var(--foreground)' }}>
                    <h2>รอบที่ {currentRound} จาก 5</h2>
                    <h3>วิดีโอนี้คือสัญลักษณ์อะไร?</h3>
                    <h4 className='bold font_style' style={{color:"var(--red)"}} >สามารถตอบได้อีก {life}</h4>
                </div>

                {/* แสดงตัวเลือกของรอบปัจจุบัน */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '10px', 
                    width: '100%', 
                    maxWidth: '400px' 
                }}>
                    {currentChoices.map((choice, index) => (
                        <button
                            key={index}
                            style={{
                                padding: '15px',
                                background: 'var(--boldskyblue)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                            onClick={() => checkAnswer(choice)}
                        >
                            <p className="font-botton font-style" >{choice}</p>
                        </button>
                    ))}
                </div>

                {/* ปุ่มควบคุม */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => showSuccessPopup(`คำใบ้: ${currentQuestionData.hint}`)}
                        style={{
                            padding: '10px 20px',
                            background: 'var(--softorange)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        <p className ="font-botton font-style">คำใบ้</p>
                    </button>
                    {currentQuestionData && (
                         <button 
                        onClick={reset}
                        style={{
                            padding: '10px 20px',
                            background: 'var(--red)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        <p className ="font-botton font-style">เริ่มเกมใหม่</p>
                    </button>
                    )}
                </div>
            </div>
        </main>
    );
}