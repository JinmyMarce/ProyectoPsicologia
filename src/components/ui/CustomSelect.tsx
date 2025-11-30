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
  focusColor?: 'blue' | 'blue-dark' | 'rose-dark';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar',
  className = '',
  error = false,
  disabled = false,
  openDirection = 'auto',
  focusColor = 'blue'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>(openDirection === 'top' ? 'top' : 'bottom');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Calcular posición del dropdown para evitar que se salga del viewport y del modal
  useEffect(() => {
    if (isOpen && selectRef.current && buttonRef.current) {
      // Usar el rect del botón, no del contenedor
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = Math.min(240, options.length * 42 + 16);
      
      // Buscar el contenedor del modal solo por atributos específicos de modal
      // No usar overflow como indicador porque puede causar problemas de posicionamiento
      const modalContainer = selectRef.current.closest('[role="dialog"]') || 
                             selectRef.current.closest('.modal') ||
                             selectRef.current.closest('[class*="Modal"]') ||
                             selectRef.current.closest('[class*="modal"]') ||
                             selectRef.current.closest('[data-modal="true"]');
      
      // Si está dentro de un modal, usar position fixed y calcular posición relativa al viewport
      if (modalContainer) {
        const modalRect = modalContainer.getBoundingClientRect();
        const spaceBelowInModal = modalRect.bottom - rect.bottom;
        const spaceAboveInModal = rect.top - modalRect.top;
        const minSpace = 8;
        
        let position: 'top' | 'bottom' = 'bottom';
        let maxHeight = dropdownHeight;
        
        if (openDirection === 'top') {
          position = 'top';
        } else if (openDirection === 'bottom') {
          position = 'bottom';
        } else {
          // Auto: calcular mejor posición
          if (spaceBelowInModal < dropdownHeight + minSpace && spaceAboveInModal > dropdownHeight + minSpace) {
            position = 'top';
          } else if (spaceBelowInModal >= dropdownHeight + minSpace) {
            position = 'bottom';
          } else {
            // Ajustar altura al espacio disponible
            const availableSpace = Math.max(spaceBelowInModal - minSpace, spaceAboveInModal - minSpace, 100);
            maxHeight = availableSpace;
            position = spaceBelowInModal > spaceAboveInModal ? 'bottom' : 'top';
          }
        }
        
        // Calcular posición fixed para que se mantenga dentro del viewport y del contenedor
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Asegurar que el dropdown no se salga del viewport horizontalmente
        let left = rect.left;
        if (left + rect.width > viewportWidth - 8) {
          left = viewportWidth - rect.width - 8;
        }
        if (left < 8) {
          left = 8;
        }
        
        // Calcular posición vertical considerando el contenedor y el viewport
        if (position === 'top') {
          // Calcular desde arriba del input hacia arriba
          const topSpace = rect.top - modalRect.top;
          const availableTopSpace = Math.min(topSpace - minSpace, viewportHeight - (viewportHeight - rect.top) - minSpace);
          maxHeight = Math.min(maxHeight, availableTopSpace);
        } else {
          // Calcular desde abajo del input hacia abajo
          const bottomSpace = modalRect.bottom - rect.bottom;
          const availableBottomSpace = Math.min(bottomSpace - minSpace, viewportHeight - rect.bottom - minSpace);
          maxHeight = Math.min(maxHeight, availableBottomSpace);
        }
        
        // Crear el objeto style con todas las propiedades
        const style: React.CSSProperties = {
          position: 'fixed',
          left: `${left}px`,
          width: `${Math.min(rect.width, viewportWidth - left - 8)}px`,
          maxHeight: `${maxHeight}px`,
          zIndex: 10001,
          contain: 'layout style paint'
        };
        
        // Asignar posición vertical
        if (position === 'top') {
          style.bottom = `${viewportHeight - rect.top + 4}px`;
        } else {
          style.top = `${rect.bottom + 4}px`;
        }
        
        setDropdownPosition(position);
        setDropdownStyle(style);
      } else {
        // Si no está en un modal, usar position absolute normal relativo al contenedor
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        let position: 'top' | 'bottom' = 'bottom';
        
        if (openDirection === 'top') {
          position = 'top';
        } else if (openDirection === 'bottom') {
          position = 'bottom';
        } else {
          // Auto: calcular mejor posición
          if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
            position = 'top';
          } else {
            position = 'bottom';
          }
        }
        
        setDropdownPosition(position);
        setDropdownStyle({
          position: 'absolute',
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 1000
        });
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

  // Determinar clases de focus según focusColor
  const getFocusClasses = () => {
    if (error) {
      return 'border-red-300 focus:border-red-500 focus:ring-red-100';
    }
    switch (focusColor) {
      case 'blue-dark':
        return 'border-slate-300 focus:border-blue-900 focus:ring-blue-900';
      case 'rose-dark':
        return 'border-slate-300 focus:border-rose-950 focus:ring-rose-950';
      case 'blue':
      default:
        return 'border-gray-300 focus:border-blue-500 focus:ring-blue-100';
    }
  };

  const baseClasses = `w-full px-2.5 py-2 rounded-md border transition-all duration-300 focus:outline-none focus:ring-2 text-sm relative cursor-pointer ${
    getFocusClasses()
  } ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'bg-white'}`;

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
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
          className={`bg-white border-2 border-gray-300 rounded-lg shadow-xl overflow-y-auto ${
            dropdownPosition === 'top' && !dropdownStyle.position ? 'bottom-full mb-1' : 
            dropdownPosition === 'bottom' && !dropdownStyle.position ? 'top-full mt-1' : ''
          }`}
          role="listbox"
          ref={optionsRef}
          style={{
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            ...dropdownStyle
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

