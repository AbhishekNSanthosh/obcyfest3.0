"use client";

import HTMLFlipBook from "react-pageflip";
import { FC, useEffect, useState, useRef } from "react";

interface FlipbookProps {
  pages: string[];
  onFlip?: (e: { data: number }) => void;
  isFullscreen?: boolean;
  currentPage?: number;
}

// Define a minimal type for the flipbook ref
interface PageFlip {
  pageFlip: () => {
    update: () => void;
  };
}

const Flipbook: FC<FlipbookProps> = ({
  pages,
  onFlip,
  isFullscreen = false,
  currentPage = 0,
}) => {
  const [dimensions, setDimensions] = useState({ width: 500, height: 700 });
  const flipbookRef = useRef<PageFlip>(null);

  useEffect(() => {
    const updateDimensions = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let newWidth = Math.min(vw * 0.9, 800);
      let newHeight = newWidth * (7 / 5);

      if (vw < 640) {
        newWidth = vw * 0.95;
        newHeight = vh * 0.6;
      } else if (vw < 1024) {
        newWidth = vw * 0.8;
        newHeight = newWidth * (7 / 5);
      }

      if (isFullscreen) {
        newWidth = vw * 0.98;
        newHeight = vh * 0.98;
      }

      setDimensions({
        width: Math.floor(newWidth),
        height: Math.floor(newHeight),
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    // Reset flipbook state after fullscreen exit with delay
    if (!isFullscreen && flipbookRef.current?.pageFlip) {
      const timeoutId = setTimeout(() => {
        const pageFlip = flipbookRef.current?.pageFlip();
        if (pageFlip) {
          console.log("PageFlip instance:", pageFlip); // Debug the instance
          pageFlip.update();
        }
      }, 500); // Increased delay for safety

      return () => clearTimeout(timeoutId);
    }

    return () => window.removeEventListener("resize", updateDimensions);
  }, [isFullscreen, currentPage]);

  return (
    <div
      className={`flex justify-center items-center w-full ${
        isFullscreen ? "h-full" : "h-auto"
      }`}
    >
      <HTMLFlipBook
        width={dimensions.width}
        height={dimensions.height}
        showCover={true}
        className="shadow-2xl rounded-lg border-4 border-black-900 animate-fade-in-up"
        style={{}}
        startPage={currentPage}
        size="stretch"
        minWidth={280}
        maxWidth={1200}
        minHeight={360}
        maxHeight={1600}
        drawShadow={true}
        flippingTime={600}
        useMouseEvents={true}
        usePortrait={true}
        startZIndex={0}
        autoSize={true}
        clickEventForward={true}
        swipeDistance={30}
        showPageCorners={true}
        disableFlipByClick={false}
        maxShadowOpacity={0.3}
        mobileScrollSupport={true}
        onFlip={onFlip}
        ref={flipbookRef}
      >
        {pages.map((page, i) => (
          <div key={i} className="bg-white relative">
            <img
              src={page}
              alt={`Magazine page ${i + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {isFullscreen && (
              <div className="absolute bottom-2 right-2 bg-black-900 text-yellow-400 px-2 py-1 rounded text-sm">
                {i + 1}
              </div>
            )}
          </div>
        ))}
      </HTMLFlipBook>
    </div>
  );
};

export default Flipbook;
