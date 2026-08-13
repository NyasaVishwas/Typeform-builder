"use client";

import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, hoverable = false, className = "", ...props }) => {
  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs transition-all duration-200 ${
        hoverable ? "hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
