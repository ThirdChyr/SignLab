"use client"
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { AiOutlineLeft } from 'react-icons/ai';
import Image from 'next/image';
import { showSuccessPopup, showErrorPopup } from '@/app/components/Popup';
import '@/app/css/component.css';
import '@/app/css/container.css';
import '@/app/css/stage.css';
import axiosInstance from "@/app/axios"; 
import { jwtDecode } from "jwt-decode";

interface QuestionData {
    id: number;
    question: string;
    hint: string;
    image: string;
}

interface GameQuestion {
    round: number;
    correctAnswer: string;
    hint: string;
    image: string;
    choices: string[];
}

interface JwtPayload {
    id: string;
    email: string;
}

const questionData: QuestionData[] = [
    { id: 1, question: "1", hint: "หนึ่ง", image: "/chapter/stage2/1.png" },
    { id: 2, question: "2", hint: "สอง", image: "/chapter/stage2/2.png" },
    { id: 3, question: "3", hint: "สาม", image: "/chapter/stage2/3.png" },
    { id: 4, question: "4", hint: "สี่", image: "/chapter/stage2/4.png" },
    { id: 5, question: "5", hint: "ห้า", image: "/chapter/stage2/5.png" },
    { id: 6, question: "6", hint: "หก", image: "/chapter/stage2/6.png" },
    { id: 7, question: "7", hint: "เจ็ด", image: "/chapter/stage2/7.png" },
    { id: 8, question: "8", hint: "แปด", image: "/chapter/stage2/8.png" },
    { id: 9, question: "9", hint: "เก้า", image: "/chapter/stage2/9.png" },
    { id: 10, question: "10", hint: "สิบ", image: "/chapter/stage2/10.png" },
];

const mqttToAnswerMap: { [key: string]: string } = {
    "one": "1",
    "two": "2", 
    "three": "3",
    "four": "4",
    "five": "5",
    "six": "6",
    "seven": "7",
    "eight": "8",
    "nine": "9",
    "ten": "10",
};

export default function Stage() {
    const [progress, setProgress] = useState(0);
    const [progressstage, setProgressstage] = useState(0); 
    const [correctAnswer, setCorrectAnswer] = useState(''); 
    const [currentChoices, setCurrentChoices] = useState<string[]>([]);
    const [currentRound, setCurrentRound] = useState(1); 
    const [gameQuestions, setGameQuestions] = useState<GameQuestion[]>([]); 
    const [life, setLife] = useState(5); 
    const [isListening, setIsListening] = useState(false);
    const [mqttData, setMqttData] = useState<string>('');

    const params = useParams();
    const stageId = Array.isArray(params.stageid) ? parseInt(params.stageid[0]) : parseInt(params.stageid as string);

    const generateChoices = useCallback((correctAnswer: string) => {
        const wrongAnswers = questionData
            .filter(item => item.question !== correctAnswer)
            .map(item => item.question);
        
        const shuffledWrong = wrongAnswers.sort(() => Math.random() - 0.5);
        const selectedWrong = shuffledWrong.slice(0, 3);
        
        const allChoices = [...selectedWrong, correctAnswer];
        return allChoices.sort(() => Math.random() - 0.5);
    }, []);

    const generateGameQuestions = useCallback(() => {
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
    }, [generateChoices]);

    const startNewGame = useCallback(() => {
        const newGameQuestions = generateGameQuestions();
        setGameQuestions(newGameQuestions);
        setCurrentRound(1);
        setProgressstage(0);
        setLife(5);
        
        if (newGameQuestions.length > 0) {
            const firstQuestion = newGameQuestions[0];
            setCorrectAnswer(firstQuestion.correctAnswer);
            setCurrentChoices(firstQuestion.choices);
        }
    }, [generateGameQuestions]);

    const nextRound = useCallback(() => {
        if (currentRound < 5 && currentRound < gameQuestions.length) {
            const nextRoundData = gameQuestions[currentRound];
            setCurrentRound(prev => prev + 1);
            setProgressstage(prev => prev + 1);
            setCorrectAnswer(nextRoundData.correctAnswer);
            setCurrentChoices(nextRoundData.choices);
        }
    }, [currentRound, gameQuestions]);

    const checkAnswer = useCallback(async (selectedAnswer: string) => {
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
                nextRound();
            } else {
                setProgressstage(prev => prev + 1);

                try {
                    const token = localStorage.getItem("token");
                    if (!token) {
                        console.error("ไม่พบ token");
                        return;
                    }

                    const decoded = jwtDecode<JwtPayload>(token);
                    const userId = decoded.id;

                    const response = await axiosInstance.post("/update-progress", {
                        user_id: userId,
                        stage_id: stageId
                    });

                    if (response.data.success) {
                        console.log("อัปเดต progress สำเร็จ และเพิ่มแต้มแล้ว");
                    } else {
                        console.warn("ไม่อัปเดต:", response.data.message);
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
            setLife(prev => prev - 1);
        }
    }, [life, correctAnswer, currentRound, nextRound, stageId]);

    const fetchMqttData = useCallback(async () => {
        try {
            const response = await fetch('http://130.33.96.46:3000/api/mqtt/answer');
            const data = await response.json();
            
            if (data && data.data) {
                setMqttData(data.data);
                console.log("MQTT Data received:", data.data);
                
                const mappedAnswer = mqttToAnswerMap[data.data.toLowerCase()];
                if (mappedAnswer && mappedAnswer === correctAnswer) {
                    console.log("MQTT Answer matched! Auto-advancing...");
                    checkAnswer(mappedAnswer);
                }
            } else {
                setMqttData('ไม่มีข้อมูล');
            }
        } catch (error) {
            console.error("Error fetching MQTT data:", error);
            setMqttData('ไม่สามารถเชื่อมต่อ API ได้');
        }
    }, [correctAnswer, checkAnswer]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        if (isListening) {
            fetchMqttData();
            interval = setInterval(() => {
                fetchMqttData();
            }, 2000);
        } else {
            setMqttData('');
        }
        
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isListening, fetchMqttData]);

    const calculateProgress = useCallback(() => {
        return (progressstage / 5) * 100;
    }, [progressstage]);

    const toggleMqttListening = () => {
        setIsListening(prev => !prev);
        if (!isListening) {
            showSuccessPopup("เริ่มเชื่อมต่อกับถุงมือ");
        } else {
            showSuccessPopup("หยุดเชื่อมต่อกับถุงมือ");
        }
    };

    useEffect(() => {
        startNewGame();
    }, [startNewGame]);

    useEffect(() => {
        setProgress(calculateProgress());
    }, [calculateProgress]); 

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
                {currentQuestionData && (
                    <Image
                        src={currentQuestionData.image}
                        alt={`รอบที่ ${currentRound}`}
                        width={600}          
                        height={350}        
                        style={{ borderRadius: '10px', objectFit: 'cover' }}
                    />
                )}

                <div style={{ textAlign: 'center', color: 'var(--foreground)' }}>
                    <h2>รอบที่ {currentRound} จาก 5</h2>
                    <h3>รูปนี้คือสัญลักษณ์อะไร?</h3>
                    <h4 className='bold font_style' style={{color:"var(--red)"}} >สามารถตอบได้อีก {life} ครั้ง</h4>
                    
                    {isListening && (
                        <p style={{
                            color: 'var(--foreground)', 
                            fontSize: '14px',
                            margin: '10px 0',
                            padding: '5px',
                            background: 'rgba(0,0,0,0.1)',
                            borderRadius: '5px'
                        }}>
                            <strong>ข้อมูลจากถุงมือ:</strong> {mqttData || 'ไม่มีข้อมูล'}
                        </p>
                    )}
                </div>

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

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button 
                        onClick={toggleMqttListening}
                        style={{
                            padding: '10px 20px',
                            background: isListening ? 'var(--red)' : '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        <p className="font-botton font-style">
                            {isListening ? ' หยุดเชื่อมต่อถุงมือ' : ' เชื่อมต่อถุงมือ'}
                        </p>
                    </button>
                    
                    <button 
                        onClick={() => showSuccessPopup(`คำใบ้: ${currentQuestionData?.hint || ''}`)}
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
                        onClick={startNewGame}
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