"use client";
import React from 'react';
import '../css/lessons.css';

interface LessonData {
    id: number;
    globalStageId: number;
    isCompleted: boolean;
    isActive: boolean;
    isLocked: boolean;
}

interface UserProgress {
    lastCompletedChapter: number;
    lastCompletedStage: number;
}

interface LessonGridProps {
    chapterNumber: number;
    onStageClick?: (stageId: number) => void;
    userProgress?: UserProgress;
}

const LessonGrid = ({
    chapterNumber = 1,
    onStageClick,
    userProgress = { lastCompletedChapter: 0, lastCompletedStage: 0 }
}: LessonGridProps) => {
    const totalStagesInChapter = 5;

    const chaptersData = {
        1: { title: "การทักทายแนะนำ", description: "การทักทายพื้นฐาน", totalStages: 5 },
        2: { title: "ตัวเลข", description: "ตัวเลขในภาษาไทย", totalStages: 5 },
        3: { title: "พยัญชนะ", description: "พยัญชนะในภาษาไทย", totalStages: 5 },
        4: { title: "สระ วรรณยุกต์", description: "สระ วรรณยุกต์ในภาษาไทย", totalStages: 5 },
        5: { title: "วันและเวลา", description: "วันและเวลาในภาษาไทย", totalStages: 5 }
    };

    const generateLessons = (): LessonData[] => {
        const lessons: LessonData[] = [];

        for (let i = 1; i <= totalStagesInChapter; i++) {
            const globalStageId = (chapterNumber - 1) * totalStagesInChapter + i;

            lessons.push({
                id: i,
                globalStageId,
                isCompleted: globalStageId <= userProgress.lastCompletedStage,
                isActive: globalStageId === userProgress.lastCompletedStage + 1,
                isLocked: globalStageId > userProgress.lastCompletedStage + 1
            });
        }

        return lessons;
    };

    const getCompletedStagesCount = () => {
        const startId = (chapterNumber - 1) * totalStagesInChapter + 1;
        return Math.min(
            Math.max(userProgress.lastCompletedStage - startId + 1, 0),
            totalStagesInChapter
        );
    };

    const lessons = generateLessons();
    const currentChapter = chaptersData[chapterNumber as keyof typeof chaptersData];

    const handleLessonClick = (lesson: LessonData) => {
        if (lesson.isLocked) {
            alert("กรุณาทำด่านก่อนหน้าให้เสร็จก่อน");
            return;
        }

        if (onStageClick) {
            onStageClick(lesson.globalStageId);
        }
    };

    return (
        <div className="lesson-grid-container">
            <div className="lesson-grid-wrapper">
                <div className="lesson-grid">
                    {lessons.map((lesson) => (
                        <button
                            key={lesson.globalStageId}
                            onClick={() => handleLessonClick(lesson)}
                            className={`lesson-circle 
                                ${lesson.isActive ? 'active' : ''} 
                                ${lesson.isCompleted ? 'completed' : ''} 
                                ${lesson.isLocked ? 'locked' : ''}`}
                            disabled={lesson.isLocked}
                        >
                            {lesson.isLocked ? '🔒' : `${chapterNumber}.${lesson.id}`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="lesson-info-cards">
                <div className="info-card ranking-card">
                    <h3 className="card-title">{currentChapter.title}</h3>
                    <p className="card-subtitle">{currentChapter.description}</p>
                    <div className="progress-info">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{
                                    width: `${(getCompletedStagesCount() / totalStagesInChapter) * 100}%`,
                                    backgroundColor: "#FF9500"
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonGrid;