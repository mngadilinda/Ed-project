const MathToolbar = ({ onInsert }) => {
    const symbols = [
      { label: 'Fraction', latex: '\\frac{a}{b}' },
      { label: 'Square Root', latex: '\\sqrt{a}' },
      { label: 'Exponent', latex: 'a^{b}' },
      { label: 'Subscript', latex: 'a_{b}' },
      { label: 'Greek α', latex: '\\alpha' },
      { label: 'Greek β', latex: '\\beta' },
      { label: 'Integral', latex: '\\int_{a}^{b}' },
    ];
    
    const validateStep = (step) => {
        try {
          katex.renderToString(step);
          return { valid: true };
        } catch (error) {
          return { 
            valid: false,
            message: error.message 
          };
        }
      };
  
    return (
      <div className="flex flex-wrap gap-2 mb-2">
        {symbols.map((symbol, index) => (
          <button
            key={index}
            onClick={() => onInsert(symbol.latex)}
            className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
            title={symbol.label}
          >
            {symbol.label}
          </button>
        ))}
      </div>
    );
  };