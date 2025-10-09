"use client";

import HTMLFlipBook from "react-pageflip";
import { FC, useEffect, useState, useRef } from "react";

        // Set minimum dimensions
        const minWidth = 849;
        const minHeight = 1200;

interface FlipbookProps {
  pages: string[];
  onFlip?: (e: { data: number }) => void;
  isFullscreen?: boolean;
  currentPage?: number;
  preloadPages?: number; // New prop to define how many next pages to preload
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
  preloadPages = 2, // Default preload next 2 pages
}) => {
  const [dimensions, setDimensions] = useState({ width: 500, height: 700 });
  const flipbookRef = useRef<PageFlip>(null);


  useEffect(() => {
 const updateDimensions = () => {
  try {
    const vw = window.innerWidth-10;
    const vh = window.innerHeight-10;

    const aspectRatio = minWidth / minHeight;
    let newWidth;
    let newHeight;

    if (isFullscreen) {
      const vwAspectRatio = vw / vh;

      if (vwAspectRatio > aspectRatio) {
        // Screen is wider → limit by height
        newHeight = vh * 0.95; // Increased margin for better safety
        newWidth = newHeight * aspectRatio;
      } else {
        // Screen is taller → limit by width
        newWidth = vw * 0.95; // Increased margin for better safety
        newHeight = newWidth / aspectRatio;
      }

      // Additional safety check to ensure it fits within viewport
      if (newWidth > vw) {
        newWidth = vw * 0.95;
        newHeight = newWidth / aspectRatio;
      }
      if (newHeight > vh) {
        newHeight = vh * 0.95;
        newWidth = newHeight * aspectRatio;
      }
    } else {
      // Default (non-fullscreen) responsive scaling
      if (vw < 480) {
        newWidth = vw * 0.95;
      } else if (vw < 640) {
        newWidth = vw * 0.92;
      } else if (vw < 768) {
        newWidth = vw * 0.85;
      } else if (vw < 1024) {
        newWidth = vw * 0.8;
      } else if (vw < 1280) {
        newWidth = Math.min(vw * 0.75, 900);
      } else {
        newWidth = Math.min(vw * 0.9, 800);
      }

      newHeight = newWidth * (7 / 5);
      newWidth = Math.min(newWidth, vw - 20);
      newHeight = Math.min(newHeight, vh - 20);

      // Enforce minimum only in normal mode (not fullscreen)
      newWidth = Math.max(newWidth, minWidth);
      newHeight = Math.max(newHeight, minHeight);
    }

    setDimensions({
      width: Math.floor(newWidth),
      height: Math.floor(newHeight),
    });
  } catch (error) {
    console.error("Error updating dimensions:", error);
    setDimensions({
      width: 800,
      height: 560,
    });
  }
};

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    // Reset flipbook state after fullscreen exit
    if (!isFullscreen && flipbookRef.current?.pageFlip) {
      const timeoutId = setTimeout(() => {
        const pageFlip = flipbookRef.current?.pageFlip();
        if (pageFlip) {
          pageFlip.update();
        }
      }, 5);
      return () => clearTimeout(timeoutId);
    }

    return () => window.removeEventListener("resize", updateDimensions);
  }, [isFullscreen, currentPage]);

  // Preload next few pages
  useEffect(() => {
    if (pages.length === 0) return;

    const start = currentPage + 1;
    const end = Math.min(currentPage + preloadPages, pages.length - 1);

    for (let i = start; i <= end; i++) {
      const img = new Image();
      img.src = pages[i];
    }
  }, [currentPage, pages, preloadPages]);

  return (
    <div
      className={`flex justify-center items-center w-full ${
        isFullscreen ? "h-screen" : "h-auto"
      }`}
    >
      <HTMLFlipBook
        style={{}}
        width={dimensions.width}
        height={dimensions.height}
        showCover={true}
        className="shadow-2xl rounded-lg border-4 border-black-900 animate-fade-in-up"
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
