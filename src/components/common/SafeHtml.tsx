import React from 'react';
import DOMPurify from 'dompurify';

interface SafeHtmlProps {
  html: string;
  className?: string;
}

// Component for safely rendering HTML content
const SafeHtml: React.FC<SafeHtmlProps> = ({ html, className }) => {
  // Configure DOMPurify
  DOMPurify.addHook('afterSanitizeAttributes', function(node) {
    // Set all elements owning target to target=_blank
    if ('target' in node) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
    
    // Remove all event handlers
    if (node.hasAttribute('on')) {
      node.removeAttribute('on');
    }
    
    // Remove javascript: URLs
    if (
      node.hasAttribute('href') && 
      node.getAttribute('href')?.toLowerCase().indexOf('javascript:') === 0
    ) {
      node.removeAttribute('href');
    }
  });
  
  // Sanitize the HTML
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'ul', 'ol', 'li',
      'b', 'i', 'strong', 'em', 'a', 'img', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'style'
    ],
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    ALLOW_DATA_ATTR: false
  });
  
  return (
    <div 
      className={className} 
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default SafeHtml; 