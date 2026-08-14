import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toPng } from 'html-to-image';
import { Download, Upload, SlidersHorizontal, Image as ImageIcon, Palette, RotateCcw, Smartphone } from 'lucide-react';
import { Ticket } from './components/Ticket';

function getDominantColorCanvas(img: HTMLImageElement): string {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return 'rgb(156, 163, 175)';
  
  canvas.width = 100;
  canvas.height = 100;
  context.drawImage(img, 0, 0, 100, 100);
  const data = context.getImageData(0, 0, 100, 100).data;
  
  let maxCount = 0;
  let dominant = 'rgb(156, 163, 175)';
  const colorCounts: Record<string, number> = {};
  
  for (let i = 0; i < data.length; i += 4) {
    const r = Math.floor(data[i] / 32) * 32 + 16;
    const g = Math.floor(data[i+1] / 32) * 32 + 16;
    const b = Math.floor(data[i+2] / 32) * 32 + 16;
    
    // Ignore pure black/white to find more vibrant dominant colors
    if ((r < 40 && g < 40 && b < 40) || (r > 240 && g > 240 && b > 240)) continue;
    
    const key = `${r},${g},${b}`;
    colorCounts[key] = (colorCounts[key] || 0) + 1;
    if (colorCounts[key] > maxCount) {
      maxCount = colorCounts[key];
      dominant = `rgb(${r}, ${g}, ${b})`;
    }
  }
  
  if (maxCount === 0) {
      return `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
  }
  
  return dominant;
}

function rgbToHex(rgb: string) {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return '#9ca3af';
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

const generateRandomStr = (len: number) => Math.random().toString(36).substring(2, 2 + len).toUpperCase();
const generateBarcode = () => Math.floor(Math.random() * 1000000000000).toString();

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [dominantColor, setDominantColor] = useState<string>('rgb(26, 60, 52)'); 
  const [imageScale, setImageScale] = useState(1);
  const [aspectRatio, setAspectRatio] = useState(16/9);
  const [imageFit, setImageFit] = useState<'cover' | 'contain'>('cover');
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [destinationFontSize, setDestinationFontSize] = useState(30);
  const [includeBackground, setIncludeBackground] = useState(false);
  const [bgWidth, setBgWidth] = useState(1000);
  const [bgHeight, setBgHeight] = useState(600);
  const ticketRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLElement>(null);
  const [previewContainerSize, setPreviewContainerSize] = useState({ width: 0, height: 0 });
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsMobilePortrait(window.innerWidth < 768 && window.innerHeight > window.innerWidth);
      setIsCompact(window.innerWidth < 768 || window.innerHeight < 500);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  useEffect(() => {
    if (!previewContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setPreviewContainerSize({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height,
        });
      }
    });
    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, []);
  
  const isHorizontal = layout === 'horizontal';
  const imgWidth = isHorizontal ? 360 * aspectRatio : 360;
  const imgHeight = isHorizontal ? 360 : 360 * aspectRatio;
  const stubWidth = isHorizontal ? 320 : 360;
  const stubHeight = isHorizontal ? 360 : 200;
  const totalWidth = isHorizontal ? imgWidth + stubWidth : imgWidth;
  const totalHeight = isHorizontal ? 360 : imgHeight + stubHeight;
  
  const [resetKey, setResetKey] = useState(0);

  const [texts, setTexts] = useState({
    destination: 'Tokyo, Japan',
    year: '2026',
    month: '05',
    day: '14',
    ticketNo: '',
    barcode: '',
    watermark: 'SHOT ON IPHONE'
  });

  useEffect(() => {
    setTexts(prev => ({
      ...prev,
      ticketNo: `#${generateRandomStr(4)}-STUB-${generateRandomStr(2)}`,
      barcode: generateBarcode()
    }));
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setImage(url);
        setImageScale(1); 
        setAspectRatio(16/9);
        setResetKey(prev => prev + 1);
        setTexts(prev => ({
          ...prev,
          ticketNo: `#${generateRandomStr(4)}-STUB-${generateRandomStr(2)}`,
          barcode: generateBarcode()
        }));
        
        const img = new Image();
        img.src = url;
        img.onload = () => {
          try {
            const color = getDominantColorCanvas(img);
            setDominantColor(color);
          } catch (err) {
            console.error('Color extraction failed', err);
          }
        };
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  } as any);

  const handleExport = useCallback(() => {
    if (ticketRef.current === null) return;
    
    const prevResize = ticketRef.current.style.resize;
    ticketRef.current.style.resize = 'none';

    toPng(ticketRef.current, { cacheBust: true, pixelRatio: 3 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'ticket-stub.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Error exporting image', err);
      })
      .finally(() => {
        if (ticketRef.current) {
          ticketRef.current.style.resize = prevResize;
        }
      });
  }, [ticketRef]);

  return (
    <div className="h-screen bg-[#EAE8E4] flex flex-col font-sans overflow-hidden select-none">
      {/* Mobile Portrait Overlay */}
      {isMobilePortrait && (
        <div className="fixed inset-0 z-[100] bg-[#EAE8E4] flex flex-col items-center justify-center p-8 text-center text-black">
          <Smartphone className="w-16 h-16 opacity-50 mb-6 -rotate-90 transition-transform" />
          <h2 className="text-xl font-black uppercase tracking-widest mb-4">请横向握持手机</h2>
          <p className="text-sm font-bold opacity-60 leading-relaxed">
            为了确保拖拽操作和票根预览的最佳体验，<br/>请解除屏幕方向锁定，并将手机横过来使用。
          </p>
        </div>
      )}

      {/* Header Navigation */}
      <header className={`flex justify-between items-center border-b border-black/10 shrink-0 ${isCompact ? 'px-4 py-3' : 'px-10 py-6'}`}>
        <div className="flex items-center gap-2">
          <div className={`bg-black rounded-full flex items-center justify-center ${isCompact ? 'w-6 h-6' : 'w-8 h-8'}`}>
            <div className={`bg-white rotate-45 ${isCompact ? 'w-2 h-2' : 'w-3 h-3'}`}></div>
          </div>
          <span className={`font-black tracking-tighter uppercase ${isCompact ? 'text-lg' : 'text-xl'}`}>Stub Studio</span>
        </div>
        <div className={`flex items-center ${isCompact ? 'gap-2' : 'gap-4'}`}>
          <button 
            onClick={() => {
              setResetKey(prev => prev + 1);
              setImageScale(1);
              setAspectRatio(16/9);
              setBgWidth(1000);
              setBgHeight(600);
            }}
            className={`text-black font-bold uppercase tracking-widest rounded-full hover:bg-black/5 transition-colors cursor-pointer flex items-center ${isCompact ? 'px-3 py-1.5 text-[10px] gap-1' : 'px-4 py-2 text-xs gap-2'}`}
          >
            <RotateCcw className={isCompact ? 'w-3 h-3' : 'w-4 h-4'} /> 重置布局
          </button>
          <button 
            onClick={handleExport}
            className={`bg-black text-white font-bold uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-colors cursor-pointer flex items-center ${isCompact ? 'px-4 py-1.5 text-[10px] gap-1' : 'px-6 py-2 text-xs gap-2'}`}
          >
            <Download className={isCompact ? 'w-3 h-3' : 'w-4 h-4'} /> 保存票根
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className={`flex-1 flex overflow-hidden ${isCompact ? 'gap-4 p-4' : 'gap-12 p-12'}`}>
        {/* Editor Sidebar */}
        <aside className={`flex flex-col overflow-y-auto shrink-0 ${isCompact ? 'w-56 gap-4 pb-4' : 'w-72 gap-8 pb-8'}`}>
          <section>
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-black/40">定制选项</h3>
             <div className="space-y-4">
               {/* Upload */}
               <div 
                 {...getRootProps()} 
                 className={`p-4 bg-white border border-black/5 rounded-2xl shadow-sm cursor-pointer transition-all ${
                   isDragActive ? 'ring-2 ring-black' : 'hover:border-black/20'
                 }`}
               >
                  <input {...getInputProps()} />
                  <p className="text-xs font-bold mb-1">图片</p>
                  <p className="text-[10px] text-black/40 uppercase tracking-widest">{image ? '点击替换' : '点击上传，或者拖拽到这'}</p>
               </div>
               
               {/* Text Fields */}
               <div className="p-4 bg-white border border-black/5 rounded-2xl shadow-sm space-y-3">
                 <div>
                   <p className="text-xs font-bold mb-2">目的地</p>
                   <input type="text" value={texts.destination} onChange={e => setTexts({...texts, destination: e.target.value})} className="w-full text-xs p-2 bg-[#F5F4F2] border-none rounded-lg focus:ring-1 focus:ring-black outline-none font-bold" />
                 </div>
                 <div>
                   <p className="text-xs font-bold mb-2">日期 (YYYY / MM / DD)</p>
                   <div className="flex gap-2">
                     <input type="text" value={texts.year} onChange={e => setTexts({...texts, year: e.target.value})} className="w-1/3 text-xs p-2 bg-[#F5F4F2] border-none rounded-lg focus:ring-1 focus:ring-black outline-none font-bold text-center" placeholder="YYYY" />
                     <input type="text" value={texts.month} onChange={e => setTexts({...texts, month: e.target.value})} className="w-1/3 text-xs p-2 bg-[#F5F4F2] border-none rounded-lg focus:ring-1 focus:ring-black outline-none font-bold text-center" placeholder="MM" />
                     <input type="text" value={texts.day} onChange={e => setTexts({...texts, day: e.target.value})} className="w-1/3 text-xs p-2 bg-[#F5F4F2] border-none rounded-lg focus:ring-1 focus:ring-black outline-none font-bold text-center" placeholder="DD" />
                   </div>
                 </div>
                 <div>
                   <p className="text-xs font-bold mb-2">票号</p>
                   <input type="text" value={texts.ticketNo} onChange={e => setTexts({...texts, ticketNo: e.target.value})} className="w-full text-xs p-2 bg-[#F5F4F2] border-none rounded-lg focus:ring-1 focus:ring-black outline-none font-bold uppercase" />
                 </div>
                 <div>
                   <p className="text-xs font-bold mb-2">条形码</p>
                   <input type="text" value={texts.barcode} onChange={e => setTexts({...texts, barcode: e.target.value})} className="w-full text-xs p-2 bg-[#F5F4F2] border-none rounded-lg focus:ring-1 focus:ring-black outline-none font-bold uppercase" />
                 </div>
                 <div>
                   <p className="text-xs font-bold mb-2">水印</p>
                   <input type="text" value={texts.watermark} onChange={e => setTexts({...texts, watermark: e.target.value})} className="w-full text-xs p-2 bg-[#F5F4F2] border-none rounded-lg focus:ring-1 focus:ring-black outline-none font-bold" />
                 </div>
               </div>
               
               {/* Controls */}
               <div className="p-4 bg-white border border-black/5 rounded-2xl shadow-sm space-y-5">
                 <div>
                   <p className="text-xs font-bold mb-2">布局</p>
                   <div className="flex gap-2">
                     <button 
                       className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${layout === 'horizontal' ? 'bg-black text-white' : 'bg-[#F5F4F2] text-black hover:bg-black/10'}`}
                       onClick={() => setLayout('horizontal')}
                     >
                       横向
                     </button>
                     <button 
                       className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${layout === 'vertical' ? 'bg-black text-white' : 'bg-[#F5F4F2] text-black hover:bg-black/10'}`}
                       onClick={() => setLayout('vertical')}
                     >
                       竖向
                     </button>
                   </div>
                 </div>
                  <div>
                    <p className="text-xs font-bold mb-2">图片填充模式</p>
                    <div className="flex gap-2">
                      <button 
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${imageFit === "cover" ? "bg-black text-white" : "bg-[#F5F4F2] text-black hover:bg-black/10"}`}
                        onClick={() => setImageFit("cover")}
                      >
                        覆盖
                      </button>
                      <button 
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${imageFit === "contain" ? "bg-black text-white" : "bg-[#F5F4F2] text-black hover:bg-black/10"}`}
                        onClick={() => setImageFit("contain")}
                      >
                        包含
                      </button>
                    </div>
                  </div>
                 <div>
                   <div className="flex justify-between items-center mb-2">
                     <p className="text-xs font-bold">图片比例</p>
                     <span className="text-[10px] text-black/40 font-mono">{(aspectRatio).toFixed(2)}</span>
                   </div>
                   <input 
                     type="range" min="0.8" max="2.5" step="0.1" value={aspectRatio} 
                     onChange={e => setAspectRatio(parseFloat(e.target.value))} 
                     className="w-full accent-black" 
                   />
                 </div>
                 <div>
                   <div className="flex justify-between items-center mb-2">
                     <p className="text-xs font-bold">图片缩放</p>
                     <span className="text-[10px] text-black/40 font-mono">{imageScale.toFixed(2)}x</span>
                   </div>
                   <input 
                     type="range" min="0.5" max="3" step="0.05" value={imageScale} 
                     onChange={e => setImageScale(parseFloat(e.target.value))} 
                     className="w-full accent-black" 
                   />
                 </div>
                 <div>
                   <div className="flex justify-between items-center mb-2">
                     <p className="text-xs font-bold">目的地字体大小</p>
                     <span className="text-[10px] text-black/40 font-mono">{destinationFontSize}px</span>
                   </div>
                   <input 
                     type="range" min="16" max="72" step="1" value={destinationFontSize} 
                     onChange={e => setDestinationFontSize(parseInt(e.target.value))} 
                     className="w-full accent-black" 
                   />
                 </div>
                 <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-bold">票根背景色</p>
                    </div>
                    <div className="flex gap-2 items-center mb-4">
                       <input 
                         type="color" 
                         value={rgbToHex(dominantColor)} 
                         onChange={e => setDominantColor(hexToRgb(e.target.value))} 
                         className="w-6 h-6 rounded cursor-pointer border-0 p-0 overflow-hidden" 
                       />
                       <span className="text-[10px] text-black/40 uppercase tracking-widest flex-1">自动提取</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold">显示背景</p>
                      <input type="checkbox" checked={includeBackground} onChange={e => setIncludeBackground(e.target.checked)} className="accent-black w-4 h-4 cursor-pointer" />
                    </div>
                    {includeBackground && (
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-xs font-bold">背景宽度</p>
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                value={bgWidth} 
                                onChange={e => setBgWidth(parseInt(e.target.value) || 0)} 
                                className="w-14 text-[10px] p-1 bg-[#F5F4F2] border-none rounded focus:ring-1 focus:ring-black outline-none font-mono text-center" 
                              />
                              <span className="text-[10px] text-black/40">px</span>
                            </div>
                          </div>
                          <input 
                            type="range" min="400" max="3000" step="10" value={bgWidth} 
                            onChange={e => setBgWidth(parseInt(e.target.value))} 
                            className="w-full accent-black" 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-xs font-bold">背景高度</p>
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                value={bgHeight} 
                                onChange={e => setBgHeight(parseInt(e.target.value) || 0)} 
                                className="w-14 text-[10px] p-1 bg-[#F5F4F2] border-none rounded focus:ring-1 focus:ring-black outline-none font-mono text-center" 
                              />
                              <span className="text-[10px] text-black/40">px</span>
                            </div>
                          </div>
                          <input 
                            type="range" min="400" max="3000" step="10" value={bgHeight} 
                            onChange={e => setBgHeight(parseInt(e.target.value))} 
                            className="w-full accent-black" 
                          />
                        </div>
                      </div>
                    )}
                 </div>
               </div>
             </div>
          </section>
        </aside>

        {/* Preview Area */}
        <section ref={previewContainerRef} className="flex-1 overflow-hidden flex bg-[#F5F4F2]/50 relative">
          {(() => {
            const contentWidth = includeBackground ? bgWidth : totalWidth;
            const contentHeight = includeBackground ? bgHeight : totalHeight;
            let previewScale = 1;
            if (previewContainerSize.width > 0 && previewContainerSize.height > 0) {
              const paddingX = window.innerHeight < 500 || window.innerWidth < 768 ? 32 : 128; 
              const paddingY = window.innerHeight < 500 || window.innerWidth < 768 ? 32 : 128; 
              const scaleX = (previewContainerSize.width - paddingX) / contentWidth;
              const scaleY = (previewContainerSize.height - paddingY) / contentHeight;
              previewScale = Math.min(scaleX, scaleY, 1);
            }

            return (
              <div 
                className="m-auto relative group"
                style={{
                  width: contentWidth * previewScale,
                  height: contentHeight * previewScale
                }}
              >
                <div
                  style={{
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top left',
                    width: contentWidth,
                    height: contentHeight,
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                  className="flex justify-center items-center"
                >
                  {/* The ticket uses resetKey to fully remount and reset drag positions when the user clicks Reset */}
                  <div 
                    ref={ticketRef} 
                    className="shrink-0 flex justify-center items-center"
                    style={{
                      background: includeBackground ? `linear-gradient(135deg, ${dominantColor.replace('rgb', 'rgba').replace(')', ', 0.3)')}, ${dominantColor.replace('rgb', 'rgba').replace(')', ', 0.8)')})` : 'transparent',
                      width: includeBackground ? bgWidth : undefined,
                      height: includeBackground ? bgHeight : undefined,
                      padding: includeBackground ? '0px' : '0px',
                      borderRadius: includeBackground ? '16px' : '0px',
                      overflow: includeBackground ? 'hidden' : 'visible',
                    }}
                  >
                    <Ticket 
                      key={resetKey}
                      image={image} 
                      dominantColor={dominantColor} 
                      texts={texts} 
                      imageScale={imageScale} 
                      aspectRatio={aspectRatio}
                      layout={layout}
                      destinationFontSize={destinationFontSize}
                      imageFit={imageFit}
                    />
                  </div>
                </div>
                
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  <div className="px-5 py-3 rounded-2xl shadow-lg border border-black/5 bg-white text-xs font-bold uppercase tracking-wider text-black whitespace-nowrap">
                    Drag text & image to reposition
                  </div>
                </div>
              </div>
            );
          })()}
        </section>
      </main>
    </div>
  );
}
