import React from 'react';

function MessageBubble({ text, sender, timestamp }) {
  const isUser = sender === 'user';

  // Format timestamp more elegantly
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  // Enhanced text formatting with better markdown and structure parsing
  const formatText = (text) => {
    // Handle code blocks first
    if (text.includes('```')) {
      return text.split('```').map((part, index) => {
        if (index % 2 === 1) {
          return (
            <pre key={index} className="bg-gray-800 text-green-400 p-2 sm:p-3 rounded-lg mt-2 mb-2 text-xs sm:text-sm overflow-x-auto border border-gray-600">
              <code className="whitespace-pre-wrap">{part.trim()}</code>
            </pre>
          );
        }
        return formatStructuredText(part);
      });
    }
    
    return formatStructuredText(text);
  };

  // Format structured text with paragraphs, lists, and emphasis
  const formatStructuredText = (text) => {
    // Split into paragraphs
    const paragraphs = text.split(/\n\s*\n/);
    
    return paragraphs.map((paragraph, pIndex) => {
      if (!paragraph.trim()) return null;
      
      // Check if it's a list (starts with bullet points, numbers, or dashes)
      const listItems = paragraph.split('\n').filter(line => line.trim());
      const isList = listItems.some(item => 
        /^[\s]*[-•*]\s/.test(item) || 
        /^[\s]*\d+\.\s/.test(item) ||
        /^\*\*[^*]+\*\*/.test(item.trim())
      );
      
      if (isList && listItems.length > 1) {
        return (
          <div key={pIndex} className="mb-3">
            {listItems.map((item, iIndex) => {
              const trimmedItem = item.trim();
              
              // Handle numbered lists
              if (/^\d+\.\s/.test(trimmedItem)) {
                const content = trimmedItem.replace(/^\d+\.\s/, '');
                return (
                  <div key={iIndex} className="flex items-start mb-2">
                    <span className="text-blue-400 font-semibold mr-2 mt-0.5 text-xs sm:text-sm">
                      {trimmedItem.match(/^\d+/)[0]}.
                    </span>
                    <span className="flex-1">{formatInlineText(content)}</span>
                  </div>
                );
              }
              
              // Handle bullet points
              if (/^[-•*]\s/.test(trimmedItem)) {
                const content = trimmedItem.replace(/^[-•*]\s/, '');
                return (
                  <div key={iIndex} className="flex items-start mb-2">
                    <span className="text-blue-400 mr-2 mt-1">•</span>
                    <span className="flex-1">{formatInlineText(content)}</span>
                  </div>
                );
              }
              
              // Handle bold headings (lines that start with **)
              if (/^\*\*[^*]+\*\*/.test(trimmedItem)) {
                return (
                  <div key={iIndex} className="font-semibold text-blue-300 mb-2 mt-3">
                    {formatInlineText(trimmedItem)}
                  </div>
                );
              }
              
              // Regular text
              return (
                <div key={iIndex} className="mb-2">
                  {formatInlineText(trimmedItem)}
                </div>
              );
            })}
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <div key={pIndex} className="mb-3 last:mb-0">
          {formatInlineText(paragraph.trim())}
        </div>
      );
    }).filter(Boolean);
  };

  // Format inline text with bold, italic, and inline code
  const formatInlineText = (text) => {
    // Handle inline code first
    let parts = [text];
    
    // Inline code with backticks
    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return [part];
      return part.split('`').map((segment, index) => {
        if (index % 2 === 1) {
          return (
            <code key={`code-${index}`} className="bg-gray-800 text-green-400 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono border border-gray-600">
              {segment}
            </code>
          );
        }
        return segment;
      });
    });
    
    // Handle bold text **text**
    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return [part];
      return part.split(/(\*\*[^*]+\*\*)/).map((segment, index) => {
        if (segment.startsWith('**') && segment.endsWith('**')) {
          return (
            <strong key={`bold-${index}`} className="font-semibold text-blue-300">
              {segment.slice(2, -2)}
            </strong>
          );
        }
        return segment;
      });
    });
    
    // Handle italic text *text*
    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return [part];
      return part.split(/(\*[^*]+\*)/).map((segment, index) => {
        if (segment.startsWith('*') && segment.endsWith('*') && !segment.includes('**')) {
          return (
            <em key={`italic-${index}`} className="italic text-gray-300">
              {segment.slice(1, -1)}
            </em>
          );
        }
        return segment;
      });
    });
    
    return parts;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2 sm:mb-3 group px-1 sm:px-0`}>
      {/* Avatar for AI messages - Responsive size */}
      {!isUser && (
        <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 mr-2 mt-1">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold shadow-lg">
            🤖
          </div>
        </div>
      )}
      
      <div className="flex flex-col max-w-[85%] sm:max-w-[75%]">
        {/* Message content - Enhanced formatting */}
        <div
          className={`rounded-2xl px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm break-words shadow-lg transition-all duration-200 hover:shadow-xl ${
            isUser
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md ml-auto'
              : 'bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-bl-md'
          }`}
        >
          <div className="leading-relaxed">
            {formatText(text)}
          </div>
        </div>
        
        {/* Timestamp - Responsive and shows on hover or tap */}
        <div 
          className={`text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
            isUser ? 'text-right mr-2' : 'text-left ml-2'
          }`}
        >
          {formatTime(timestamp)}
        </div>
      </div>
      
      {/* Avatar for user messages - Responsive size */}
      {isUser && (
        <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 ml-2 mt-1">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold shadow-lg">
            👤
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageBubble;