"use client";

import HTMLFlipBook from "react-pageflip";
import { FC, useEffect, useState, useRef } from "react";
import ImageLoader from "@components/ImageLoader";

// Set minimum dimensions
const minWidth = 849;
const minHeight = 1200;

interface FlipbookProps {
  pages: string[];
  onFlip?: (e: { data: number }) => void;
  isFullscreen?: boolean;
  currentPage?: number;
  onImageLoad?: (pageIndex: number) => void;
  onImageError?: (pageIndex: number) => void;
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
  onImageLoad,
  onImageError,
}) => {
  const [dimensions, setDimensions] = useState({ width: 500, height: 700 });
  const flipbookRef = useRef<PageFlip>(null);

  useEffect(() => {
    const updateDimensions = () => {
      try {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const aspectRatio = minWidth / minHeight;
        let newWidth;
        let newHeight;

        if (isFullscreen) {
          const viewportAspectRatio = vw / vh;

          if (viewportAspectRatio > aspectRatio) {
            // Viewport is wider than book aspect ratio - fit to height with small margin
            newHeight = vh; // 98% of viewport height
            newWidth = newHeight * aspectRatio;
          } else {
            // Viewport is taller than book aspect ratio - fit to width with small margin
            newWidth = vw; // 98% of viewport width
            newHeight = newWidth / aspectRatio;
          }

          // Additional safety margin to ensure no cutting
          if (newWidth > vw) {
            newWidth = vw;
            newHeight = newWidth / aspectRatio;
          }
          if (newHeight > vh) {
            newHeight = vh;
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

          newHeight = newWidth * (minHeight / minWidth);
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

    // Ensure internal layout refresh on any mode change
    const timeoutId = setTimeout(() => {
      const pageFlip = flipbookRef.current?.pageFlip();
      if (pageFlip) {
        pageFlip.update();
      }
    }, 5);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateDimensions);
    };
  }, [isFullscreen, currentPage]);

  return (
    <div
      className={`flex justify-center items-center w-full ${
        isFullscreen ? "" : "h-auto"
      }`}
    >
      <HTMLFlipBook
        key={`${dimensions.width}x${dimensions.height}-${isFullscreen}`}
        style={{}}
        width={dimensions.width}
        height={dimensions.height}
        showCover={true}
        className="shadow-2xl rounded-lg border-4 border-black-900 animate-fade-in-up"
        startPage={currentPage}
        size="stretch"
        minWidth={280}
        maxWidth={isFullscreen ? dimensions.width : 1200} // Allow full width in fullscreen
        minHeight={360}
        maxHeight={isFullscreen ? dimensions.height : 1600} // Allow full height in fullscreen
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
            <ImageLoader
              src={page}
              alt={`Magazine page ${i + 1}`}
              className="w-full h-full"
              onLoad={() => onImageLoad?.(i)}
              onError={() => onImageError?.(i)}
              showProgress={i === currentPage || i === currentPage + 1}
            />
            {/* {isFullscreen && (
              <div className="absolute bottom-2 right-2 bg-black-900 text-yellow-400 px-2 py-1 rounded text-sm">
                {i + 1}
              </div>
            )} */}
          </div>
        ))}
      </HTMLFlipBook>
    </div>
  );
};

export default Flipbook;