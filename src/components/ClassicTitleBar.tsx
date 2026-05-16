import React from 'react';

export const ClassicTitleBar = ({ title }: { title?: string }) => (
  <div className="h-[22px] border-b-[2px] border-black bg-[#ffffff] flex items-center w-full px-[4px] relative pointer-events-none select-none">
    {/* Left close box */}
    <div className="w-[12px] h-[12px] border-[2px] border-black bg-white flex-shrink-0 ml-[2px]"></div>
    
    {/* Lines and Title */}
    <div className="flex-1 mx-[6px] relative flex items-center justify-center h-[14px]">
      <div className="absolute inset-0 flex flex-col justify-between w-full h-full py-[1px]">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-full h-[1px] bg-black"></div>
        ))}
      </div>
      {title && (
        <div className="bg-white px-[10px] font-bold text-black z-10 whitespace-nowrap md:text-[11px] text-[10px]" 
             style={{ 
               fontFamily: '"Chicago", "SF Pro Rounded", "VT323", "Courier New", monospace',
               lineHeight: '14px'
              }}>
          {title}
        </div>
      )}
    </div>

    {/* Right resize/zoom box (disabled visualization since we drag the window) */}
    <div className="w-[12px] h-[12px] flex-shrink-0 relative"></div>
  </div>
);

