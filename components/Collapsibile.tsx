"use client"
import React, { useState, useRef } from 'react';

export default function Collapsible({ 
    title, 
    children, 
    isNested = false,
    defaultExpanded = false,
    maxHeight = "400px" // Default max height for content
  }){
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const contentRef = useRef(null);
    
    const toggleExpand = () => {
      setIsExpanded(!isExpanded);
    };
  
    return (
      <div className={`border-b ${isNested ? 'mt-2 border rounded-lg overflow-hidden' : ''}`}>
        <button
          onClick={toggleExpand}
          className={`w-full flex items-center justify-between transition-colors
            ${isNested 
              ? 'p-3 bg-gray-50 hover:bg-gray-100' 
              : 'p-4 hover:bg-gray-50'
            }`}
        >
          <span className={`${isNested ? 'font-medium' : 'text-lg font-medium'}`}>
            {title}
          </span>
          <div className={`transform transition-transform duration-200 ease-in-out ${isExpanded ? 'rotate-90' : ''}`}>
            <ChevronRight className={`${isNested ? 'h-4 w-4' : 'h-5 w-5'} text-gray-500`} />
          </div>
        </button>
        <div
          ref={contentRef}
          className={`transition-all duration-200 ease-in-out overflow-hidden`}
          style={{
            maxHeight: isExpanded ? maxHeight : '0',
            opacity: isExpanded ? 1 : 0,
          }}
        >
          <div className={`${isNested ? 'p-3' : 'pl-6 pr-4 pb-4'} overflow-y-auto`} 
               style={{ maxHeight }}>
            {children}
          </div>
        </div>
      </div>
    );
  }

const ChevronRight = ({ className }) => (
  <svg 
    className={className}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);