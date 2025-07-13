import React, { useState, useEffect, useRef } from 'react';

const highlightMatch = (text, term) => {
  if (!term) return text;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="bg-orange-200 text-orange-800 font-bold rounded px-0.5">{text.slice(idx, idx + term.length)}</span>
      {text.slice(idx + term.length)}
    </>
  );
};

const SearchSuggestions = ({ searchTerm, foods, vendors, categories, onSelectSuggestion, visible }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const suggestions = [];
  const term = searchTerm.trim().toLowerCase();

  // Food suggestions
  if (term) {
    foods.filter(f => f.name && f.name.toLowerCase().includes(term)).slice(0, 5).forEach(f => {
      suggestions.push({ type: 'food', label: f.name, id: f._id });
    });
    // Vendor suggestions
    vendors.filter(v => v.name && v.name.toLowerCase().includes(term)).slice(0, 3).forEach(v => {
      suggestions.push({ type: 'vendor', label: v.name, id: v._id });
    });
    // Category suggestions
    categories.filter(c => c.toLowerCase().includes(term)).forEach(c => {
      suggestions.push({ type: 'category', label: c });
    });
  }

  const listRef = useRef();

  useEffect(() => {
    setActiveIndex(0);
  }, [searchTerm]);

  const handleKeyDown = (e) => {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') {
      setActiveIndex(i => (i + 1) % suggestions.length);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setActiveIndex(i => (i - 1 + suggestions.length) % suggestions.length);
      e.preventDefault();
    } else if (e.key === 'Enter') {
      onSelectSuggestion(suggestions[activeIndex]);
      e.preventDefault();
    } else if (e.key === 'Escape') {
      onSelectSuggestion(null); // Hide suggestions
    }
  };

  if (!visible || !term || !suggestions.length) return null;

  return (
    <ul
      className="absolute z-20 w-full bg-white border border-orange-200 rounded-lg shadow-lg mt-1 max-h-64 overflow-y-auto animate-fade-in-down"
      tabIndex={-1}
      ref={listRef}
      onKeyDown={handleKeyDown}
    >
      {suggestions.map((s, i) => (
        <li
          key={s.type + '-' + s.id + '-' + s.label}
          className={`px-4 py-2 cursor-pointer flex items-center gap-2 ${i === activeIndex ? 'bg-orange-100' : ''}`}
          onMouseDown={() => onSelectSuggestion(s)}
        >
          <span className="text-xs font-semibold text-orange-500 uppercase">{s.type}</span>
          <span className="text-gray-800">{highlightMatch(s.label, term)}</span>
        </li>
      ))}
    </ul>
  );
};

export default SearchSuggestions; 