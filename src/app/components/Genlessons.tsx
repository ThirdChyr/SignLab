"use client";
import React, { useState } from 'react';
import '../css/component.css'
import '../css/lessons.css'

interface NavButtonProps {
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}
  
const Genlessons = ({ onClick, icon, label }: NavButtonProps) => {
    const [show, setShow] = useState(false);
    
    const handleClick = () => {
      setShow(!show);
      onClick();
    }

    return (
        <div className="main_container">
          <button onClick={handleClick} className="lesson_bar">
                {icon} <h1 className="font_main bold lesson_text">{label}</h1>
          </button>
        </div>
    );
};
  
export default Genlessons;