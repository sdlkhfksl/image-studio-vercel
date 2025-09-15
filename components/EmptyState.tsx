
import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = "🤔", 
  title = "还没有生成任何卡片", 
  message = "在上方输入您想了解的概念，点击“生成图解”来创建图文卡片" 
}) => {
  return (
    <div className="text-center py-16 px-6">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-semibold text-slate-700">{title}</h3>
      <p className="text-slate-500 mt-2 max-w-md mx-auto">
        {message}
      </p>
    </div>
  );
};
