import React, { useEffect, useState, useMemo } from 'react';

interface TypewriterRevealProps {
  x: number;
  y: number;
  documentTitle: string;
  documentContent: string[];
  classificationLevel?: 'UNCLASSIFIED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET';
  typingSpeed?: number;
  reducedMotion?: boolean;
  onComplete?: () => void;
}

const TypewriterReveal: React.FC<TypewriterRevealProps> = ({
  x,
  y,
  documentTitle,
  documentContent,
  classificationLevel = 'SECRET',
  typingSpeed = 50,
  reducedMotion = false,
  onComplete
}) => {
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [visibleText, setVisibleText] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setVisibleText(documentContent);
      setIsComplete(true);
      setTimeout(onComplete, 1000);
      return;
    }

    const typeNextChar = () => {
      if (currentLine >= documentContent.length) {
        setIsComplete(true);
        setTimeout(onComplete, 2000);
        return;
      }

      const currentLineText = documentContent[currentLine];
      
      if (currentChar >= currentLineText.length) {
        // Move to next line
        setCurrentLine(prev => prev + 1);
        setCurrentChar(0);
        return;
      }

      // Type current character
      setVisibleText(prev => {
        const newText = [...prev];
        if (!newText[currentLine]) {
          newText[currentLine] = '';
        }
        newText[currentLine] = currentLineText.substring(0, currentChar + 1);
        return newText;
      });

      setCurrentChar(prev => prev + 1);
    };

    const timer = setTimeout(typeNextChar, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentLine, currentChar, documentContent, typingSpeed, reducedMotion, onComplete]);

  const documentStyle = useMemo(() => ({
    '--document-x': `${x}px`,
    '--document-y': `${y}px`,
  }) as React.CSSProperties, [x, y]);

  const redactedWords = useMemo(() => {
    return ['SUBJECT', 'LOCATION', 'OPERATION', 'AGENT', 'DATE', 'TIME'];
  }, []);

  const processTextWithRedactions = (text: string) => {
    let processedText = text;
    redactedWords.forEach(word => {
      if (Math.random() > 0.7) { // 30% chance to redact
        const redaction = '█'.repeat(word.length);
        processedText = processedText.replace(new RegExp(`\\b${word}\\b`, 'gi'), redaction);
      }
    });
    return processedText;
  };

  const getClassificationColor = () => {
    switch (classificationLevel) {
      case 'UNCLASSIFIED': return '#22c55e';
      case 'CONFIDENTIAL': return '#3b82f6';
      case 'SECRET': return '#f59e0b';
      case 'TOP SECRET': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div
      className={`typewriter-document ${reducedMotion ? 'reduced-motion' : ''}`}
      style={documentStyle}
      role="document"
      aria-live="polite"
    >
      <div className="document-container">
        <div className="document-header">
          <div 
            className="classification-stamp"
            style={{ color: getClassificationColor() }}
          >
            {classificationLevel}
          </div>
          <div className="document-number">
            DOC-{Math.random().toString(36).substr(2, 9).toUpperCase()}
          </div>
        </div>

        <div className="document-title">
          <h3>{documentTitle}</h3>
          <div className="title-underline" />
        </div>

        <div className="document-body">
          {visibleText.map((line, index) => (
            <div key={index} className="document-line">
              {processTextWithRedactions(line)}
              {index === currentLine && !isComplete && (
                <span className="typewriter-cursor">█</span>
              )}
            </div>
          ))}
        </div>

        <div className="document-footer">
          <div className="document-metadata">
            <span>DECLASSIFIED: {new Date().toLocaleDateString()}</span>
            <span>REF: PROJ-SHADOW-{Math.floor(Math.random() * 9999)}</span>
          </div>
        </div>

        {!reducedMotion && (
          <>
            <div className="paper-texture" />
            <div className="typewriter-keys-sound" />
          </>
        )}
      </div>
    </div>
  );
};

export default TypewriterReveal;