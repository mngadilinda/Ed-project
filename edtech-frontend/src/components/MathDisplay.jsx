// src/components/MathDisplay.jsx
import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const MathDisplay = ({ latex, displayMode = false }) => {
  const html = katex.renderToString(latex, {
    throwOnError: false,
    displayMode
  });

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

export default MathDisplay;