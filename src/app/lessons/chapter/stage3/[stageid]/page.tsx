"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AiOutlineLeft } from 'react-icons/ai';
import { useNavigation } from '@/app/hooks/useNavigation';
import { ImCross } from "react-icons/im";
import Image from 'next/image';
import { showLoadingPopup, showSuccessPopup, showErrorPopup, showConfirmPopup, removeExistingPopup } from '@/app/components/Popup';
import '@/app/css/component.css';
import '@/app/css/container.css';
import '@/app/css/stage.css';
import axiosInstance from "@/app/axios"; // ← แก้ไข import
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
    const [life, setlife] = useState(5); // จำนวนชีวิตเริ่มต้น

    const params = useParams();
    const stageId = Array.isArray(params.stageid) ? parseInt(params.stageid[0]) : parseInt(params.stageid as string); // ← แก้ไข type
    const chapterNumber = 2; // ← แก้ไขให้ตรงกับ folder stage2
    
    console.log("Chapter:", chapterNumber); // 2
    console.log("Stage ID:", stageId);

    const questionData = [
    { id: 1, question: "ก", hint: "ก", image: "/chapter/stage3/1.png" },
    { id: 2, question: "ข", hint: "ข", image: "/chapter/stage3/2.png" },
    { id: 3, question: "ค", hint: "ค", image: "/chapter/stage3/3.png" },
    { id: 4, question: "ฆ", hint: "ฆ", image: "/chapter/stage3/4.png" },

    { id: 5, question: "ต", hint: "ต", image: "/chapter/stage3/5.png" },
    { id: 6, question: "ถ", hint: "ถ", image: "/chapter/stage3/6.png" },
    { id: 7, question: "ฐ", hint: "ฐ", image: "/chapter/stage3/7.png" },
    { id: 8, question: "ฒ", hint: "ฒ", image: "/chapter/stage3/8.png" },
    { id: 9, question: "ฑ", hint: "ฑ", image: "/chapter/stage3/9.png" },
    { id: 10, question: "ฏ", hint: "ฏ", image: "/chapter/stage3/10.png" },

    { id: 11, question: "ส", hint: "ส", image: "/chapter/stage3/11.png" },
    { id: 12, question: "ศ", hint: "ศ", image: "/chapter/stage3/12.png" },
    { id: 13, question: "ษ", hint: "ษ", image: "/chapter/stage3/13.png" },
    { id: 14, question: "ซ", hint: "ซ", image: "/chapter/stage3/14.png" },

    { id: 15, question: "พ", hint: "พ", image: "/chapter/stage3/15.png" },
    { id: 16, question: "ป", hint: "ป", image: "/chapter/stage3/16.png" },
    { id: 17, question: "ผ", hint: "ผ", image: "/chapter/stage3/17.png" },
    { id: 18, question: "ภ", hint: "ภ", image: "/chapter/stage3/18.png" },
    { id: 19, question: "ห", hint: "ห", image: "/chapter/stage3/19.png" },
    { id: 20, question: "ฮ", hint: "ฮ", image: "/chapter/stage3/20.png" },

    { id: 21, question: "บ", hint: "บ", image: "/chapter/stage3/21.png" },
    { id: 22, question: "ร", hint: "ร", image: "/chapter/stage3/22.png" },
    { id: 23, question: "ว", hint: "ว", image: "/chapter/stage3/23.png" },
    { id: 24, question: "ด", hint: "ด", image: "/chapter/stage3/24.png" },
    { id: 25, question: "ฎ", hint: "ฎ", image: "/chapter/stage3/25.png" },

    { id: 26, question: "ฟ", hint: "ฟ", image: "/chapter/stage3/26.png" },
    { id: 27, question: "ฝ", hint: "ฝ", image: "/chapter/stage3/27.png" },
    { id: 28, question: "ล", hint: "ล", image: "/chapter/stage3/28.png" },
    { id: 29, question: "ฬ", hint: "ฬ", image: "/chapter/stage3/29.png" },
    { id: 30, question: "จ", hint: "จ", image: "/chapter/stage3/30.png" },

    { id: 31, question: "ย", hint: "ย", image: "/chapter/stage3/31.png" },
    { id: 32, question: "ญ", hint: "ญ", image: "/chapter/stage3/32.png" },
    { id: 33, question: "ม", hint: "ม", image: "/chapter/stage3/33.png" },
    { id: 34, question: "น", hint: "น", image: "/chapter/stage3/34.png" },
    { id: 35, question: "ณ", hint: "ณ", image: "/chapter/stage3/35.png" },
    { id: 36, question: "ง", hint: "ง", image: "/chapter/stage3/36.png" },

    { id: 37, question: "ท", hint: "ท", image: "/chapter/stage3/37.png" },
    { id: 38, question: "ธ", hint: "ธ", image: "/chapter/stage3/38.png" },
    { id: 39, question: "ฉ", hint: "ฉ", image: "/chapter/stage3/39.png" },
    { id: 40, question: "ช", hint: "ช", image: "/chapter/stage3/40.png" },
    { id: 41, question: "ฌ", hint: "ฌ", image: "/chapter/stage3/41.png" },
    { id: 42, question: "อ", hint: "อ", image: "/chapter/stage3/42.png" },
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

    // สุ่มคำถาม 5 รอบ
    const generateGameQuestions = () => {
        const shuffledQuestions = [...questionData].sort(() => Math.random() - 0.5);
        const selected5Questions = shuffledQuestions.slice(0, 5);
        
        const gameData = selected5Questions.map((question, index) => ({
            round: index + 1,
            correctAnswer: question.question,
            hint: question.hint,
            image: question.image,
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
        setlife(5); // ← รีเซ็ตชีวิต
        
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
            const nextRoundData = gameQuestions[currentRound]; // currentRound เป็น 0-based
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

                    const res = await axiosInstance.post("/update-progress", { // ← ใช้ axiosInstance
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
                {/* แสดงรูปของรอบปัจจุบัน */}
                {currentQuestionData && (
                    <Image
                        src={currentQuestionData.image}
                        alt={`รอบที่ ${currentRound}`}
                        width={600}          
                        height={350}        
                        style={{ borderRadius: '10px', objectFit: 'cover' }}
                    />
                )}

                {/* แสดงข้อมูลรอบปัจจุบัน */}
                <div style={{ textAlign: 'center', color: 'var(--foreground)' }}>
                    <h2>รอบที่ {currentRound} จาก 5</h2>
                    <h3>รูปนี้คือสัญลักษณ์อะไร?</h3>
                    <h4 className='bold font_style' style={{color:"var(--red)"}} >สามารถตอบได้อีก {life} ครั้ง</h4>
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
                        onClick={() => showSuccessPopup(`คำใบ้: ${currentQuestionData?.hint || ''}`)} // ← เพิ่ม optional chaining
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
                </div>
            </div>
        </main>
    );
}