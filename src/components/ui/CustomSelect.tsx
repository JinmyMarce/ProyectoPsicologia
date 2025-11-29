import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  error?: boolean;
  disabled?: boolean;
  openDirection?: 'top' | 'bottom' | 'auto';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar',
  className = '',
  error = false,
  disabled = false,
  openDirection = 'auto'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>(openDirection === 'top' ? 'top' : 'bottom');
  const selectRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Calcular posición del dropdown para evitar que se salga del viewport
  useEffect(() => {
    if (isOpen && selectRef.current) {
      // Si la dirección está forzada, usar esa
      if (openDirection === 'top') {
        setDropdownPosition('top');
        return;
      }
      if (openDirection === 'bottom') {
        setDropdownPosition('bottom');
        return;
      }

      // Solo calcular automáticamente si es 'auto'
      const rect = selectRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = Math.min(240, options.length * 42 + 16); // max-h-60 aproximado

      // Si no hay espacio suficiente abajo pero sí arriba, mostrar arriba
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [isOpen, options.length, openDirection]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Manejar teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) {
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
          event.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : options.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < options.length) {
            onChange(options[highlightedIndex].value);
            setIsOpen(false);
            setHighlightedIndex(-1);
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, highlightedIndex, options, onChange]);

  // Scroll a la opción seleccionada cuando se abre
  useEffect(() => {
    if (isOpen && optionsRef.current && value) {
      const selectedElement = optionsRef.current.querySelector(`[data-value="${value}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [isOpen, value]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const baseClasses = `w-full px-3 py-2 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 text-base relative cursor-pointer ${
    error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
  } ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'bg-white'}`;

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`${baseClasses} flex items-center justify-between`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div 
          className={`absolute z-[10001] w-full bg-white border-2 border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto ${
            dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
          role="listbox"
          ref={optionsRef}
          style={{
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            // Renderizar dentro del contenedor, no usar portal
            position: 'absolute',
            left: 0,
            right: 0
          }}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">No hay opciones</div>
          ) : (
            options.map((option, index) => (
              <div
                key={option.value}
                data-value={option.value}
                role="option"
                aria-selected={value === option.value}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-3 py-2 cursor-pointer transition-colors duration-150 flex items-center justify-between ${
                  value === option.value
                    ? 'bg-blue-50 text-blue-900 font-semibold'
                    : highlightedIndex === index
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

