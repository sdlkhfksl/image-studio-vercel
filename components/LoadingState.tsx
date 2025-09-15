
import React, { useState, useEffect } from 'react';

const SkeletonCard: React.FC = () => (
  <div className="aspect-video w-full bg-slate-200 rounded-2xl shadow-md animate-pulse"></div>
);

interface LoadingStateProps {
    title?: string;
    message?: string;
    messages?: string[];
}

export const LoadingState: React.FC<LoadingStateProps> = ({
    title = "正在为您生成图片...",
    message = "这可能需要一点时间，请稍候。",
    messages
}) => {
  // Fix: Add state to handle cycling messages
  const [displayedMessage, setDisplayedMessage] = useState(message);
  
  useEffect(() => {
    const effectiveMessages = messages && messages.length > 0 ? messages : null;

    if (effectiveMessages) {
      setDisplayedMessage(effectiveMessages[0]);
      if (effectiveMessages.length > 1) {
        let index = 0;
        const intervalId = setInterval(() => {
          index = (index + 1) % effectiveMessages.length;
          setDisplayedMessage(effectiveMessages[index]);
        }, 3000);
        return () => clearInterval(intervalId);
      }
    } else {
      setDisplayedMessage(message);
    }
  }, [messages, message]);

  return (
    <div>
        <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-slate-700">{title}</h3>
            <p className="text-slate-500 mt-2">{displayedMessage}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
        </div>
    </div>
  );
};
