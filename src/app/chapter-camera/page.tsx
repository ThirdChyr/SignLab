"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AiOutlineLeft } from 'react-icons/ai';
import { showSuccessPopup, showConfirmPopup, removeExistingPopup } from "../components/Popup";
import '@/app/css/component.css';
import '@/app/css/container.css';
import '@/app/css/stage.css';

interface Question {
    id: number;
    question: string;
    answer: string;
    hint: string;
    video: string;
}

interface CurrentQuestion {
    correctAnswer: string;
    question: string;
    hint: string;
    video: string;
}

interface GestureResponse {
    gesture?: string;
}

// ✅ ย้าย questionData ออกนอก component
const questionData: Question[] = [
    {
        id: 1,
        question: "ฉัน",
        answer: "me",
        hint: "ตัวเอง",
        video: "/chapter/stage1/01.mp4",
    },
    {
        id: 2,
        question: "ขอโทษ",
        answer: "sorry",
        hint: "คำที่ใช้แสดงความรู้สึกผิด",
        video: "/chapter/stage1/02.mp4",
    },
    {
        id: 3,
        question: "ขอบคุณ",
        answer: "thank",
        hint: "ใช้แสดงความรู้สึกขอบคุณ",
        video: "/chapter/stage1/03.mp4",
    },
    {
        id: 4,
        question: "สวัสดี",
        answer: "hello",
        hint: "คำทักทาย",
        video: "/chapter/stage1/04.mp4",
    },
    {
        id: 5,
        question: "แนะนำ",
        answer: "introduce",
        hint: "แนะนำตัวหรือสิ่งของ",
        video: "/chapter/stage1/05.mp4",
    },
    {
        id: 6,
        question: "สบายดี",
        answer: "fine",
        hint: "คำตอบเมื่อมีคนถามว่าสบายดีไหม",
        video: "/chapter/stage1/06.mp4",
    },
    {
        id: 7,
        question: "พบ (คนหนึ่งและอีกคนหนึ่งพบกัน)",
        answer: "meet",
        hint: "คนหนึ่งและอีกคนหนึ่งพบกัน",
        video: "/chapter/stage1/07.mp4",
    },
    {
        id: 8,
        question: "พบ (คุณพบกับฉัน)",
        answer: "meet",
        hint: "คุณพบกับฉัน",
        video: "/chapter/stage1/08.mp4",
    },
    {
        id: 9,
        question: "ชื่อภาษามือ",
        answer: "signname",
        hint: "ชื่อของภาษามือ",
        video: "/chapter/stage1/09.mp4",
    },
    {
        id: 10,
        question: "ไม่เป็นไร",
        answer: "noproblem",
        hint: "คำที่ใช้เมื่อให้อภัยหรือไม่ถือสา",
        video: "/chapter/stage1/10.mp4",
    },
    {
        id: 11,
        question: "ไม่สบาย",
        answer: "unwell",
        hint: "รู้สึกเจ็บป่วย",
        video: "/chapter/stage1/11.mp4",
    },
    {
        id: 12,
        question: "ใช่",
        answer: "yes",
        hint: "คำยืนยัน",
        video: "/chapter/stage1/12.mp4",
    },
    {
        id: 13,
        question: "ไม่ใช่",
        answer: "no",
        hint: "คำปฏิเสธ",
        video: "/chapter/stage1/13.mp4",
    },
];

export default function Stage() {
    const router = useRouter();
    const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestion | null>(null);
    const [mqttData, setMqttData] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [lastMqttData, setLastMqttData] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isFirstConnection, setIsFirstConnection] = useState(true);
    const [hasCheckedConnection, setHasCheckedConnection] = useState(false);
    
    // ✅ ใช้ useRef สำหรับ interval และ timeout
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialized = useRef(false);

    // ✅ ตรวจสอบ token แค่ครั้งเดียว
    useEffect(() => {
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
        }
    }, [router]);

    // ✅ ลบ dependencies ที่ทำให้เกิด loop
    const getQuestionFromAnswer = useCallback((answer: string) => {
        const foundQuestion = questionData.find(item => 
            item.answer.toLowerCase() === answer.toLowerCase()
        );
        return foundQuestion ? foundQuestion.question : answer;
    }, []);

    const generateRandomQuestion = useCallback((): CurrentQuestion => {
        const randomIndex = Math.floor(Math.random() * questionData.length);
        const selectedQuestion = questionData[randomIndex];
        
        return {
            correctAnswer: selectedQuestion.answer,
            question: selectedQuestion.question,
            hint: selectedQuestion.hint,
            video: selectedQuestion.video
        };
    }, []);

    const startNewQuestion = useCallback(() => {
        const newQuestion = generateRandomQuestion();
        setCurrentQuestion(newQuestion);
        setIsCorrect(false);
        setMqttData('');
        setLastMqttData('');
    }, [generateRandomQuestion]);

    // ✅ แก้ไข fetchMqttData ป้องกัน loop
    const fetchMqttData = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5050/gesture');
            const data: GestureResponse = await response.json();
            
            if (!isConnected) {
                setIsConnected(true);
                setHasCheckedConnection(true);
                if (isFirstConnection) {
                    setIsFirstConnection(false);
                    showSuccessPopup('🎉 เชื่อมต่อ API สำเร็จ!');
                }
            }
            
            if (data && data.gesture) {
                const receivedAnswer = data.gesture.trim().toLowerCase();
                
                if (receivedAnswer !== lastMqttData && receivedAnswer !== '') {     
                    setMqttData(receivedAnswer);
                    setLastMqttData(receivedAnswer);
                    
                    if (currentQuestion && receivedAnswer === currentQuestion.correctAnswer.toLowerCase()) {
                        setIsCorrect(true);
                        showSuccessPopup(`ถูกต้อง! คำตอบคือ: ${currentQuestion.correctAnswer}`);
                        
                        setTimeout(() => {
                            startNewQuestion();
                            setIsCorrect(false);
                        }, 2000);
                    } 
                }
            } else {
                if (mqttData !== 'ไม่มีข้อมูล' && isConnected) {
                    setMqttData('ไม่มีข้อมูล');
                }
            }
        } catch (error) {
            console.error('API Connection Error:', error);
            
            if (!hasCheckedConnection) {
                setHasCheckedConnection(true);
            }
            
            if (isConnected) {
                setIsConnected(false);
                setMqttData('ไม่สามารถเชื่อมต่อ API ได้');
                
                if (retryTimeoutRef.current) {
                    clearTimeout(retryTimeoutRef.current);
                }
                
                retryTimeoutRef.current = setTimeout(() => {
                    fetchMqttData();
                }, 5000);
            }
        }
    }, [currentQuestion, lastMqttData, mqttData, isConnected, hasCheckedConnection, isFirstConnection, startNewQuestion]);

    // ✅ แยก useEffect สำหรับ initialization
    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;
            startNewQuestion();
            fetchMqttData();
        }
    }, [startNewQuestion, fetchMqttData]);

    // ✅ แยก useEffect สำหรับ interval
    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        
        if (isConnected) {
            intervalRef.current = setInterval(() => {
                fetchMqttData();
            }, 1000);
        }
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [isConnected, fetchMqttData]);

    return (
        <main className='container_outer'>
            <div className="login_container_top" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '50px'
            }}>
                <button 
                    onClick={() => router.back()} 
                    style={{ 
                        background: "transparent", 
                        border: "none", 
                        padding: 0, 
                        cursor: "pointer",
                        flexShrink: 0
                    }}
                >
                    <AiOutlineLeft size={35} className="back-button" />
                </button>

                <div style={{ width: '35px' }}></div>
            </div>

            <div className="progress-container" style={{
                backgroundColor: "transparent", 
                padding: '20px', 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    marginBottom: '20px'
                }}>
                    {currentQuestion && (
                        <div style={{ textAlign: 'center' }}>
                            <video
                                key={currentQuestion.video}
                                src={currentQuestion.video}
                                width={450}          
                                height={350}         
                                autoPlay             
                                loop                 
                                muted                
                                playsInline          
                                controls={false}     
                                preload="auto"       
                                style={{ 
                                    borderRadius: '15px', 
                                    objectFit: 'cover',
                                    backgroundColor: '#000',
                                    border: `3px solid ${isCorrect ? 'var(--green)' : 'var(--lightgray)'}`,
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                }}
                                onError={(e) => {
                                    console.error('Video loading error:', e);
                                }}
                            >
                                <source src={currentQuestion.video} type="video/mp4" />
                                เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
                            </video>
                        </div>
                    )}
                </div>

                <div style={{ textAlign: 'center', color: 'var(--foreground)', marginBottom: '20px' }}>
                    <h2 style={{ 
                        fontSize: '36px', 
                        fontWeight: 'bold',
                        color: isCorrect ? 'var(--green)' : 'var(--boldskyblue)',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        {currentQuestion?.question || 'กำลังโหลด...'}
                    </h2>
                    <h3 style={{ 
                        fontSize: '20px',
                        color: 'var(--lightgray)',
                        fontStyle: 'italic'
                    }}>
                        ({currentQuestion?.hint || ''})
                    </h3>
                    
                    <div style={{
                        padding: '10px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '8px',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                        marginTop: '15px'
                    }}>
                        <p style={{
                            color: 'var(--foreground)', 
                            fontSize: '16px',
                            margin: '0',
                            fontWeight: 'bold'
                        }}>
                            คำตอบล่าสุด : {mqttData ? getQuestionFromAnswer(mqttData) : 'รอข้อมูล...'}
                        </p>
                    </div>

                    {hasCheckedConnection && !isConnected && (
                        <div style={{
                            padding: '15px',
                            background: 'rgba(251, 191, 36, 0.1)',
                            borderRadius: '8px',
                            border: '2px solid #fbbf24',
                            marginTop: '15px',
                            animation: 'fadeIn 0.5s ease-in'
                        }}>
                            <p style={{
                                color: '#f59e0b',
                                fontSize: '16px',
                                margin: '0 0 10px 0',
                                fontWeight: 'bold'
                            }}>
                                ⚠️ ไม่สามารถเชื่อมต่อ API ได้
                            </p>
                            <p style={{
                                color: 'var(--foreground)',
                                fontSize: '14px',
                                margin: '0 0 10px 0'
                            }}>
                                หากต้องการใช้งานฟีเจอร์นี้ กรุณาดาวน์โหลดและรันโปรแกรม
                                <br/>
                            </p>
                            <p style={{color: 'var(--red)',fontSize: '14px',margin: '0 0 10px 0' ,fontWeight:'bold'}}>
                                วิธีติดตั้ง
                                <br/>
                                1. Download ตามปุ่มข้างล่าง
                                <br/>
                                2. รันโปรแกรม Signlab.exe (อาจจะใช้เวลาในการทำงาน)
                                <br />
                                3. หากโปรแกรมเปิดทำงานแล้วให้รีหน้าใหม่เพื่อเชื่อมต่อ
                            </p>
                            
                            <a 
                                href="https://github.com/Sign-Labs/Machine-Learning-Full/releases/download/sign/Signlab.exe"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-block',
                                    padding: '10px 20px',
                                    background: 'var(--boldskyblue)',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = '#1e40af';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'var(--boldskyblue)';
                                }}
                            >
                                📥 ดาวน์โหลด Signlab.exe
                            </a>
                        </div>
                    )}
                </div>

                <div style={{ 
                    display: 'flex', 
                    gap: '15px', 
                    flexWrap: 'wrap', 
                    justifyContent: 'center',
                    marginBottom: '20px'
                }}>
                    <button 
                        onClick={startNewQuestion}
                        style={{
                            padding: '18px 35px',
                            background: 'var(--boldskyblue)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                            transition: 'all 0.3s ease',
                            minWidth: '200px'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                        }}
                    >
                        <h4 className='font_description_white'>สุ่มคำถามใหม่</h4>
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </main>
    );
}