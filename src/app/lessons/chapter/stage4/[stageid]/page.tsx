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
  { id: 1, question: "สระอิ", symbol: "ิ", hint: "สระอิ", image: "/chapter/stage4/43.png" },
  { id: 2, question: "สระอือ", symbol: "ื", hint: "สระอือ", image: "/chapter/stage4/44.png" },
  { id: 3, question: "สระโอ", symbol: "โ", hint: "สระโอ", image: "/chapter/stage4/45.png" },
  { id: 4, question: "สระมาลัย", symbol: "ไ", hint: "สระมาลัย", image: "/chapter/stage4/46.png" },
  { id: 5, question: "ไม้ม้วน", symbol: "ใ", hint: "ไม้ม้วน", image: "/chapter/stage4/47.png" },
  { id: 6, question: "ไม้ยมก", symbol: "ๆ", hint: "ไม้ยมก", image: "/chapter/stage4/48.png" },
  { id: 7, question: "ไม้ไต่คู้", symbol: "็", hint: "ไม้ไต่คู้", image: "/chapter/stage4/49.png" },
  { id: 8, question: "ไม้เอก", symbol: "่", hint: "ไม้เอก", image: "/chapter/stage4/50.png" },
  { id: 9, question: "สระอา", symbol: "า", hint: "สระอา", image: "/chapter/stage4/51.png" },
  { id: 10, question: "ไม้โท", symbol: "้", hint: "ไม้โท", image: "/chapter/stage4/52.png" },
  { id: 11, question: "สระอู", symbol: "ู", hint: "สระอู", image: "/chapter/stage4/53.png" },
  { id: 12, question: "ไม้ตรี", symbol: "๊", hint: "ไม้ตรี", image: "/chapter/stage4/54.png" },
  { id: 13, question: "สระแอ", symbol: "แ", hint: "สระแอ", image: "/chapter/stage4/55.png" },
  { id: 14, question: "ไม้จัตตวา", symbol: "๋", hint: "ไม้จัตตวา", image: "/chapter/stage4/56.png" },
  { id: 15, question: "ฤ", symbol: "ฤ", hint: "ฤ", image: "/chapter/stage4/57.png" },
  { id: 16, question: "ไม้หันอากาศ", symbol: "ฯ", hint: "ไม้หันอากาศ", image: "/chapter/stage4/58.png" },
  { id: 17, question: "ฯ", symbol: "ฯ", hint: "ฯ", image: "/chapter/stage4/59.png" },
  { id: 18, question: "สระอำ", symbol: "ำ", hint: "สระอำ", image: "/chapter/stage4/60.png" },
  { id: 19, question: "สระอะ", symbol: "ะ", hint: "สระอะ", image: "/chapter/stage4/61.png" },
  { id: 20, question: "สระอุ", symbol: "ุ", hint: "สระอุ", image: "/chapter/stage4/62.png" },
  { id: 21, question: "สระเอ", symbol: "เ", hint: "สระเอ", image: "/chapter/stage4/63.png" },
  { id: 22, question: "ไม้ทัณฑฆาต", symbol: "๎", hint: "ไม้ทัณฑฆาต", image: "/chapter/stage4/64.png" },
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