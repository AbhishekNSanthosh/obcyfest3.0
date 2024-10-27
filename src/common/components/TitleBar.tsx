import React from "react";
interface TitleBarProps {
  title: string;
  className:string;
}
export default function TitleBar({ title,className }: TitleBarProps) {
  return (
    <div className="w-full flex items-center justify-start">
        <span className={className}>{title}</span>
    </div>
  )
}