import React, { Suspense } from 'react';
import { motion, useTransform, MotionValue, useDragControls } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { MacModel } from './MacModel';
import { ClassicTitleBar } from './ClassicTitleBar';

const formatContent = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={index} className="text-[#F5F5F7] font-semibold tracking-tight">{part.slice(2, -2)}</span>;
    }
    return <span key={index} className="text-[#A1A1A6] font-light">{part}</span>;
  });
};

export const Slide = ({ 
  section, 
  direction, 
  mouseX, 
  mouseY 
}: { 
  section: any, 
  direction: number,
  mouseX: MotionValue<number>,
  mouseY: MotionValue<number>,
}) => {

  const xOffset = useTransform(mouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 1000], [12, -12]);
  const yOffset = useTransform(mouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 1000], [12, -12]);
  
  const rotateX = useTransform(mouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 1000], [4, -4]);
  const rotateY = useTransform(mouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 1000], [-4, 4]);
  
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1, 
      y: 0, 
      transition: { delay: 0.2 + custom * 0.1, duration: 1, ease: [0.25, 1, 0.5, 1] as const }
    })
  };

  const layout = section.layout || (section.images?.length > 0 ? 'split-right' : 'center');

  const [topIndex, setTopIndex] = React.useState(0);
  const dragControls = useDragControls();

  // Renders the textual content block
  const renderContent = (align: 'left' | 'center' | 'bottom') => {
    let classes = "flex flex-col z-20 w-full pointer-events-none ";
    let innerClasses = "";

    if (align === 'center') {
      classes += "justify-center items-center text-center h-full max-w-4xl mx-auto px-6";
      innerClasses = "flex flex-col items-center text-center pointer-events-none";
    } else if (align === 'left') {
      classes += "justify-center h-full md:w-1/2 lg:w-5/12 px-8 md:pl-24 md:pr-16";
      innerClasses = "max-w-xl pointer-events-none";
    } else if (align === 'bottom') {
      classes += "justify-end h-full px-8 pb-32 md:px-24 md:pb-40 max-w-5xl mx-auto";
      innerClasses = "max-w-2xl pointer-events-none";
    }

    return (
      <div 
        className={classes}
        style={{ perspective: 1000 }}
      >
        <motion.div className={innerClasses} style={{ x: xOffset, y: yOffset, rotateX, rotateY, transformStyle: "preserve-3d" }}>
          {section.subtitle && (
            <motion.p 
              custom={0}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              style={{ transform: "translateZ(30px)" }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-600 uppercase tracking-[0.4em] text-[10px] md:text-xs mb-6 font-semibold"
            >
              {section.subtitle}
            </motion.p>
          )}
          
          <motion.h2 
            custom={1}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            style={{ transform: "translateZ(60px)" }}
            className={`font-medium tracking-tight text-[#F5F5F7] mb-8 leading-[1.05] drop-shadow-2xl ${align === 'center' ? 'text-5xl md:text-7xl lg:text-[6rem]' : 'text-4xl md:text-6xl lg:text-[5rem]'}`}
          >
            {section.title}
          </motion.h2>

          <div className={`space-y-6 text-base sm:text-lg md:text-xl leading-[1.6] text-[#A1A1A6] ${align === 'center' ? 'max-w-3xl' : ''}`}>
            {section.content.split('\n\n').map((paragraph: string, idx: number) => (
              <motion.p 
                key={idx}
                custom={2 + idx}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                style={{ transform: "translateZ(40px)" }}
              >
                {formatContent(paragraph)}
              </motion.p>
            ))}
          </div>
        </motion.div>
      </div>
    );
  };

  // Renders media depending on layout
  const renderMedia = () => {
    switch (layout) {
      case 'split-right':
      case 'split-left':
        return (
          <div className="w-full md:w-1/2 lg:w-7/12 h-[50vh] md:h-full relative flex items-center justify-center p-8 md:p-16">
            {section.images.slice(0, 2).map((img: string, idx: number) => {
              const isTop = topIndex === idx;
              const zIndex = isTop ? 30 : 10 + idx;
              
              return (
                <motion.div
                  key={idx}
                  onPointerDown={() => setTopIndex(idx)}
                  drag
                  dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
                  whileDrag={{ scale: 1.05, zIndex: 40, cursor: 'grabbing' }}
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  animate={{ 
                    opacity: 1, 
                    scale: isTop ? 1 : 0.85, 
                    y: isTop ? 0 : 20,
                    rotate: isTop ? 0 : (idx === 0 ? -4 : 4),
                    zIndex: zIndex
                  }}
                  transition={{ 
                    type: "spring", stiffness: 300, damping: 25,
                    opacity: { duration: 0.6 }
                  }}
                  className={`pointer-events-auto flex flex-col cursor-grab overflow-hidden border-2 ${isTop ? 'border-black' : 'border-zinc-500'} shadow-[4px_4px_0_rgba(0,0,0,1)] bg-white absolute ${
                    section.images.length === 1 
                      ? 'w-[85%] h-[75%] md:h-[85%] md:w-[75%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' 
                      : idx === 0 
                        ? 'w-[65%] h-[55%] md:w-[70%] md:h-[60%] top-[10%] md:top-[15%] right-[5%] md:right-[10%]' 
                        : 'w-[65%] h-[55%] md:w-[70%] md:h-[60%] bottom-[10%] md:bottom-[15%] left-[5%] md:left-[10%]'
                  }`}
                  style={{ transformOrigin: "center" }}
                >
                  <ClassicTitleBar title={section.title || "Image Viewer"} />
                  <div className="flex-1 min-h-0 w-full relative overflow-hidden bg-white">
                    <img src={img} alt="media" className={`w-full h-full object-cover transition-transform duration-700 pointer-events-none ${isTop ? 'scale-100' : 'scale-95'}`} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        );
      
      case 'model-right':
        return (
          <div className="w-full md:w-1/2 lg:w-7/12 h-[50vh] md:h-full relative pointer-events-auto">
            <div className="absolute inset-0 bg-gradient-radial from-white/10 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none" />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 2 }}
              className="w-full h-full"
            >
              <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[-5, 5, 5]} intensity={0.5} color="#ffffff" />
                <directionalLight position={[5, 2, 5]} intensity={0.2} color="#f0f0f0" />
                <Suspense fallback={null}>
                  <MacModel />
                  <Environment preset="studio" />
                  <ContactShadows position={[0, -1.2, 0]} opacity={0.3} scale={10} blur={2.5} far={4} />
                </Suspense>
              </Canvas>
            </motion.div>
            {/* Show the YouTube commercial */}
            {section.video && (
               <div className="absolute top-1/2 -translate-y-1/2 left-0 w-64 md:w-80 lg:w-96 z-50 pointer-events-auto">
                 <motion.div
                   initial={{ opacity: 0, x: -50, rotate: -3 }}
                   animate={{ opacity: 1, x: 0, rotate: -3 }}
                   transition={{ delay: 1.2, duration: 1 }}
                   className="rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
                   whileHover={{ scale: 1.05, rotate: 0, zIndex: 60 }}
                 >
                   <iframe 
                     width="100%" 
                     height="auto" 
                     className="aspect-video pointer-events-auto"
                     src={`https://www.youtube.com/embed/${section.video}?autoplay=0&controls=1&modestbranding=1`} 
                     title="YouTube video player" 
                     frameBorder="0" 
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                     allowFullScreen
                   ></iframe>
                 </motion.div>
               </div>
            )}
          </div>
        );

      case 'hero-gallery':
        return (
          <div className="absolute inset-0 w-full h-full overflow-hidden flex flex-wrap gap-2 md:gap-4 p-4 pointer-events-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
            
            {/* Render images in a scattered background layout */}
            {section.images.map((img: string, idx: number) => {
               const pos = [
                 { top: '10%', left: '5%', width: '25%', height: '35%' },
                 { top: '25%', right: '5%', width: '30%', height: '40%' },
                 { bottom: '5%', left: '20%', width: '25%', height: '30%' }
               ][idx % 3];
               const rot = [-5, 5, -2][idx % 3];
               
               return (
                  <motion.div
                    key={idx}
                    drag
                    dragConstraints={{ left: -400, right: 400, top: -400, bottom: 400 }}
                    whileDrag={{ scale: 1.1, zIndex: 60, cursor: 'grabbing' }}
                    whileHover={{ scale: 1.05, zIndex: 50, cursor: 'grab' }}
                    initial={{ opacity: 0, scale: 0.8, y: 100, rotate: rot * 2 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotate: rot }}
                    transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.3 + idx * 0.1 }}
                    className="absolute flex flex-col overflow-hidden shadow-[4px_4px_0_rgba(0,0,0,1)] border-2 border-black bg-white pointer-events-auto cursor-grab active:cursor-grabbing"
                    style={{ ...pos, zIndex: 10 + idx }}
                  >
                    <ClassicTitleBar title={`Image ${idx + 1}`} />
                    <div className="flex-1 relative w-full overflow-hidden bg-white">
                      <img src={img} alt="gallery" className="w-full h-full object-cover pointer-events-none" />
                    </div>
                  </motion.div>
               );
            })}
            
            {section.video && (
                 <motion.div
                   drag
                   dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
                   initial={{ opacity: 0, y: 50, scale: 0.9 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   transition={{ type: "spring", delay: 1.2, duration: 1.5, bounce: 0.4 }}
                   className="absolute top-[35%] md:top-[15%] right-[5%] w-[80vw] max-w-[500px] z-[60] overflow-hidden shadow-[6px_6px_0_rgba(0,0,0,1)] border-[2px] border-black bg-white backdrop-blur-xl pointer-events-auto cursor-grab active:cursor-grabbing"
                   whileDrag={{ scale: 1.05 }}
                 >
                   {/* MacOS like title bar */}
                    <div className="w-full border-b-[2px] border-black bg-white">
                      <ClassicTitleBar title="YouTube - Apple 1984" />
                    </div>
                   <div className="relative w-full">
                     <iframe 
                       width="100%" 
                       height="auto" 
                       className="aspect-video"
                       src={`https://www.youtube.com/embed/${section.video}?autoplay=0&controls=1&modestbranding=1`} 
                       title="YouTube video player" 
                       frameBorder="0" 
                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                       allowFullScreen
                     ></iframe>
                   </div>
                 </motion.div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02, transition: { duration: 0.8, ease: "easeInOut" } }}
      transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
    >
      {/* Background Image for Intro Section */}
      {section.id === 'intro' && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none grayscale opacity-[0.08]"
          style={{
            backgroundImage: `url('https://www.annahstretton.co.nz/cdn/shop/articles/steve-jobs-750x750.jpg?v=1534809273')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-zinc-900/40 to-black opacity-60" />

      {layout === 'center' && (
        <div className="absolute inset-0">
          {renderContent('center')}
        </div>
      )}

      {layout === 'split-left' && (
        <div className="absolute inset-0 flex flex-col md:flex-row-reverse">
          {renderContent('left')}
          {renderMedia()}
        </div>
      )}

      {layout === 'split-right' && (
        <div className="absolute inset-0 flex flex-col md:flex-row shadow-[inset_200px_0_100px_rgba(0,0,0,0.8)]">
          {renderContent('left')}
          {renderMedia()}
        </div>
      )}

      {layout === 'model-right' && (
        <div className="absolute inset-0 flex flex-col md:flex-row">
          {renderContent('left')}
          {renderMedia()}
        </div>
      )}

      {layout === 'hero-gallery' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {renderMedia()}
          {renderContent('center')}
        </div>
      )}

    </motion.div>
  );
};
