"use client";
import React from 'react';
import '../css/component.css';

interface NavButtonProps {
    path: string;
    currentPath: string;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}
  
const NavButton = ({ path, currentPath, onClick, icon, label }: NavButtonProps) => {
    const isActive = currentPath === path;
    
    return (
        <button 
            onClick={onClick}
            className="Lesson_Button"
            style={{
                backgroundColor: isActive ? "var(--boldskyblue)" : "var(--lightblue)",
                textAlign: "left" as const,
                transition: "all 0.3s ease",
                width: "100%"
            }}
            onMouseEnter={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = "var(--lightblue)";
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isActive ? "var(--boldskyblue)" : "var(--lightblue)";
            }}
        >
            {icon} <h1 className="font_description_white regular">{label}</h1>
        </button>
    );
};
  
export default NavButton;