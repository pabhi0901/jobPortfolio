import React, { useState, useEffect } from 'react';

const TerminalPanel = ({ skill }) => {
  const [displayedCode, setDisplayedCode] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!skill) return;

    let isMounted = true;
    setDisplayedCode('');
    setShowOutput(false);
    setIsTyping(true);

    const code = skill.codeSnippet || '';
    let currentIndex = 0;
    const codeLength = code.length;
    
    if (codeLength === 0) {
      setIsTyping(false);
      setShowOutput(true);
      return;
    }

    const typeNextChar = () => {
      if (!isMounted) return;
      if (currentIndex < codeLength) {
        setDisplayedCode(code.substring(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeNextChar, 12);
      } else {
        setIsTyping(false);
        setTimeout(() => {
          if (isMounted) setShowOutput(true);
        }, 400);
      }
    };

    setTimeout(typeNextChar, 50); // start after brief delay

    return () => {
      isMounted = false;
    };
  }, [skill]);

  if (!skill) return null;

  return (
    <div className="terminal-panel">
      <div className="terminal-header">
        <div className="terminal-dots">
          <span></span><span></span><span></span>
        </div>
        <div className="terminal-title">{skill.fileName || 'script.js'}</div>
      </div>
      <div className="terminal-body">
        <pre className="terminal-code">
          <code>
            {displayedCode}
            {isTyping && <span className="terminal-cursor">&nbsp;</span>}
          </code>
        </pre>
        
        {showOutput && (
          <div className="terminal-output-wrapper animate-in">
            <div className="terminal-divider"></div>
            <div className="terminal-output-label">$ {skill.runCommand || 'node script.js'}</div>
            {skill.visualOutput ? (
              <div className="terminal-visual-preview" style={{ marginTop: '1rem' }}>
                {skill.visualOutput}
              </div>
            ) : skill.outputSnippet ? (
              <pre className="terminal-output">
                <code>{skill.outputSnippet}</code>
              </pre>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalPanel;
