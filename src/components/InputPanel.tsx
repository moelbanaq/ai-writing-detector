import React, { useState, useRef } from 'react';

interface InputPanelProps {
  onAnalyzeText: (text: string) => void;
  onAnalyzeFile: (content: string, filename: string, mimeType: string) => void;
  onClear: () => void;
  isLoading: boolean;
  initialText?: string;
}

export function InputPanel({
  onAnalyzeText,
  onAnalyzeFile,
  onClear,
  isLoading,
  initialText = '',
}: InputPanelProps) {
  const [text, setText] = useState(initialText);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (selectedFileName) setSelectedFileName(null);
  };

  const handleAnalyzeText = () => {
    if (text.trim()) {
      onAnalyzeText(text);
    }
  };

  const handleClear = () => {
    setText('');
    setSelectedFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClear();
  };

  const processFile = (file: File) => {
    setSelectedFileName(file.name);
    const lowerName = file.name.toLowerCase();

    const reader = new FileReader();

    if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc') || lowerName.endsWith('.pdf')) {
      // Read binary documents as Base64 Data URL
      reader.onload = (event) => {
        const base64Content = event.target?.result as string;
        onAnalyzeFile(base64Content, file.name, file.type || 'application/octet-stream');
      };
      reader.readAsDataURL(file);
    } else {
      // Plain text files (.txt, etc.)
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setText(content);
        onAnalyzeFile(content, file.name, file.type || 'text/plain');
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div
      className={`card input-panel ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: isDragging ? '2px dashed #38bdf8' : '1px solid #334155',
        transition: 'all 0.2s ease',
      }}
    >
      {/* File status badge if file was uploaded */}
      {selectedFileName && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#0f172a',
            padding: '8px 12px',
            borderRadius: '6px',
            marginBottom: '10px',
            border: '1px solid #334155',
            fontSize: '0.88rem',
            color: '#38bdf8',
          }}
        >
          <span>📄 Selected File: <strong>{selectedFileName}</strong></span>
          <button
            onClick={handleClear}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
            title="Remove file"
          >
            ✕
          </button>
        </div>
      )}

      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder="Paste your research paper, essay, or text here, or drag & drop a Word (.docx), PDF (.pdf), or Text (.txt) file..."
        rows={10}
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '12px',
          boxSizing: 'border-box',
          marginBottom: '10px',
          fontFamily: 'inherit',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          border: '1px solid #334155',
          borderRadius: '8px',
          fontSize: '0.95rem',
          lineHeight: '1.6',
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '15px',
          color: '#94a3b8',
          fontSize: '0.88rem',
        }}
      >
        <span>
          {wordCount} words | {charCount} characters
        </span>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Supports: Word (.docx), PDF (.pdf), Text (.txt)
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          className="btn btn-primary"
          onClick={handleAnalyzeText}
          disabled={!text.trim() || isLoading}
          style={{
            padding: '10px 22px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {isLoading ? '⏳ Analyzing Text...' : '🔍 Analyze Text Now'}
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          style={{
            padding: '10px 18px',
            backgroundColor: '#1e293b',
            color: '#38bdf8',
            border: '1px solid #38bdf8',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          📑 Upload Document (Word / PDF / TXT)
        </button>

        <input
          type="file"
          accept=".docx,.doc,.pdf,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <button
          className="btn btn-secondary"
          onClick={handleClear}
          disabled={isLoading || (!text && !selectedFileName)}
          style={{
            padding: '10px 16px',
            backgroundColor: '#334155',
            color: '#cbd5e1',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
