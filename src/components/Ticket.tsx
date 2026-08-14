import React from 'react';
import { motion } from 'framer-motion';
import Barcode from 'react-barcode';

export function getBrightness(rgbString: string) {
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return 0;
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

interface TicketProps {
  image: string | null;
  dominantColor: string;
  texts: {
    destination: string;
    year: string;
    month: string;
    day: string;
    ticketNo: string;
    barcode: string;
    watermark: string;
  };
  imageScale: number;
  aspectRatio: number;
  layout: 'horizontal' | 'vertical';
  destinationFontSize?: number;
  imageFit?: 'cover' | 'contain';
}

export const Ticket: React.FC<TicketProps> = ({ image, dominantColor, texts, imageScale, aspectRatio, layout = 'horizontal', destinationFontSize = 36, imageFit = 'cover' }) => {
  const isLight = getBrightness(dominantColor) > 128;
  const textColor = isLight ? '#000000' : '#ffffff';
  
  const isHorizontal = layout === 'horizontal';
  
  const imgWidth = isHorizontal ? 360 * aspectRatio : 360;
  const imgHeight = isHorizontal ? 360 : 360 * aspectRatio;
  
  const stubWidth = isHorizontal ? 320 : 360;
  const stubHeight = isHorizontal ? 360 : 200;

  const totalWidth = isHorizontal ? imgWidth + stubWidth : imgWidth;
  const totalHeight = isHorizontal ? 360 : imgHeight + stubHeight;

  return (
    <div 
      className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} bg-white rounded-2xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] relative`}
      style={{ width: totalWidth, height: totalHeight }}
    >
      {/* Left/Top Area - Image */}
      <div 
        className={`relative shrink-0 group/img cursor-move overflow-hidden ${isHorizontal ? 'rounded-l-2xl' : 'rounded-t-2xl'}`} 
        style={{ width: imgWidth, height: imgHeight }}
      >
        {image ? (
          <motion.img 
            src={image}
            draggable={false}
            drag
            dragMomentum={false}
            className="absolute origin-center cursor-move max-w-none grayscale-[20%]"
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: imageFit,
              scale: imageScale 
            }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-black/40 font-bold text-xs uppercase tracking-widest bg-gray-100">
            Upload an image
          </div>
        )}
        
        {/* Watermark */}
        <motion.div 
          drag 
          dragMomentum={false}
          className="absolute bottom-1 left-1 flex items-center gap-2 cursor-move z-10"
        >
          <div className="p-1 hover:outline hover:outline-dashed hover:outline-2 hover:outline-white/50 rounded-md">
            <p className="text-xs font-bold text-white tracking-[0.1em] uppercase">
              {texts.watermark}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Perforation Line */}
      {isHorizontal ? (
        <div className="absolute top-0 bottom-0 z-20 pointer-events-none flex justify-center" style={{ left: imgWidth, width: 5 }}>
          <div className="h-full w-0 border-l-[5px] border-dashed" style={{ borderColor: 'rgba(0,0,0,0.3)' }}></div>
        </div>
      ) : (
        <div className="absolute left-0 right-0 z-20 pointer-events-none flex flex-col justify-center" style={{ top: imgHeight, height: 5 }}>
          <div className="w-full h-0 border-t-[5px] border-dashed" style={{ borderColor: 'rgba(0,0,0,0.3)' }}></div>
        </div>
      )}

      {/* Right/Bottom Area - Ticket Info */}
      <div 
        className={`p-4 md:p-8 shrink-0 flex flex-col justify-between relative cursor-move group/info ${isHorizontal ? 'rounded-r-2xl' : 'rounded-b-2xl'}`}
        style={{ width: stubWidth, height: stubHeight, backgroundColor: dominantColor, color: textColor }}
      >
        <div className={`flex flex-col flex-1 ${isHorizontal ? 'gap-4' : 'gap-1'}`}>
          {isHorizontal ? (
            <>
              <motion.div drag dragMomentum={false} className="cursor-move hover:bg-black/10 p-2 rounded -ml-2 -mt-2">
                 <p className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold opacity-50 mb-1">目的地</p>
                 <h2 className="font-black tracking-tight leading-none uppercase break-words whitespace-normal" style={{ fontSize: `${destinationFontSize}px` }}>{texts.destination}</h2>
              </motion.div>

              <div className="flex flex-col gap-1">
                <p className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold opacity-50">日期</p>
                <motion.div drag dragMomentum={false} className="cursor-move flex gap-2">
                  <div className="border-2 border-current rounded-md px-2 py-1 md:px-3 md:py-1.5 flex items-center justify-center hover:bg-black/10 transition-colors">
                    <span className="text-xl md:text-3xl font-black">{texts.year}</span>
                  </div>
                  <div className="border-2 border-current rounded-md px-2 py-1 md:px-3 md:py-1.5 flex items-center justify-center hover:bg-black/10 transition-colors">
                    <span className="text-xl md:text-3xl font-black">{texts.month}</span>
                  </div>
                  <div className="border-2 border-current rounded-md px-2 py-1 md:px-3 md:py-1.5 flex items-center justify-center hover:bg-black/10 transition-colors">
                    <span className="text-xl md:text-3xl font-black">{texts.day}</span>
                  </div>
                </motion.div>
              </div>

              <motion.div drag dragMomentum={false} className="cursor-move hover:bg-black/10 p-2 rounded -ml-2">
                <p className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold opacity-50 mb-1">票号</p>
                <p className="text-xl md:text-2xl font-black uppercase">{texts.ticketNo}</p>
              </motion.div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-start gap-2 w-full">
                <motion.div drag dragMomentum={false} className="cursor-move hover:bg-black/10 p-2 rounded -ml-2 -mt-6 flex-1 min-w-0">
                   <p className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold opacity-50 mb-1">目的地</p>
                   <h2 className="font-black tracking-tight leading-none uppercase break-words whitespace-normal" style={{ fontSize: `${destinationFontSize}px` }}>{texts.destination}</h2>
                </motion.div>

                <motion.div drag dragMomentum={false} className="cursor-move hover:bg-black/10 p-2 rounded -mr-2 -mt-6 shrink-0 flex flex-col items-end">
                  <p className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold opacity-50 mb-1">日期</p>
                  <div className="flex flex-col items-end">
                    <span className="font-black leading-none" style={{ fontSize: `${destinationFontSize}px` }}>{texts.year}</span>
                    <span className="font-black leading-none mt-1" style={{ fontSize: `${destinationFontSize}px` }}>{texts.month}/{texts.day}</span>
                  </div>
                </motion.div>
              </div>

              <div className="flex justify-between items-end gap-2 w-full -mt-6">
                <motion.div drag dragMomentum={false} className="cursor-move hover:bg-black/10 p-2 rounded -ml-2">
                  <p className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold opacity-50 mb-1">票号</p>
                  <p className="text-lg font-black uppercase">{texts.ticketNo}</p>
                </motion.div>
                
                <motion.div drag dragMomentum={false} className="cursor-move hover:bg-black/10 p-2 rounded -mr-2 flex flex-col items-end shrink-0">
                  <div className="w-full flex justify-end opacity-80 pointer-events-none" style={{ mixBlendMode: isLight ? 'multiply' : 'screen' }}>
                     <Barcode 
                        value={texts.barcode || '000000'} 
                        width={1.5} 
                        height={40} 
                        displayValue={false} 
                        background="transparent" 
                        lineColor={textColor} 
                        margin={0}
                     />
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </div>

        {isHorizontal && (
          <motion.div drag dragMomentum={false} className="cursor-move hover:bg-black/10 p-2 rounded -ml-2 mt-auto flex flex-col items-center gap-1.5">
            <div className="w-full flex justify-center opacity-80 pointer-events-none" style={{ mixBlendMode: isLight ? 'multiply' : 'screen' }}>
               <Barcode 
                  value={texts.barcode || '000000'} 
                  width={2} 
                  height={50} 
                  displayValue={false} 
                  background="transparent" 
                  lineColor={textColor} 
                  margin={0}
               />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

