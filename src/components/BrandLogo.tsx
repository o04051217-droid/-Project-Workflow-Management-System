import React from 'react';

export function BrandLogo({ className = "h-10" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Precision Geometric AK Vector Emblem rendered via high-fidelity inline SVG */}
      <svg 
        viewBox="0 0 260 110" 
        className="h-full w-auto" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Navy Blue Left Shape "A" Leg & Peak */}
        <polygon 
          points="20,100 105,20 128,20 128,100 105,100 105,52 61,100" 
          fill="#132247" 
        />
        
        {/* Vibrant Warm Orange Top Right Shape of "K" */}
        <polygon 
          points="136,20 235,20 136,100" 
          fill="#F77F35" 
        />
        
        {/* Sleek Steel Gray-Blue Bottom Right Shape of "K" */}
        <polygon 
          points="148,100 200,52 248,100" 
          fill="#82939E" 
        />
      </svg>

      {/* Corporate Brand Typography */}
      <div className="flex flex-col justify-center">
        <span className="text-sm font-black tracking-widest text-[#132247] font-sans flex items-center gap-1 leading-none">
          群恆新世代
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F77F35]/15 text-[#F77F35] tracking-normal leading-none">
            企業社
          </span>
        </span>
        <span className="text-[9px] text-[#8C857E] font-medium tracking-wide block mt-1">
          智慧專案全流程管研系統
        </span>
      </div>
    </div>
  );
}
