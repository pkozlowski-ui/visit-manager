import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

interface AutocompleteOption {
    id: string;
    name: string;
}

interface AutocompleteProps {
    options: AutocompleteOption[];
    value: string; // The ID
    textValue: string; // The current display text
    placeholder: string;
    onChange: (id: string, text: string) => void;
    icon?: React.ReactNode;
    required?: boolean;
}

export default function Autocomplete({
    options,
    value,
    textValue,
    placeholder,
    onChange,
    icon,
    required = false
}: AutocompleteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(textValue);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync search term with prop when it changes externally (e.g. init)
    useEffect(() => {
        setSearchTerm(textValue);
    }, [textValue]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchTerm(val);
        setIsOpen(true);

        // When typing, if it doesn't match an option exactly, it's a "custom" value
        const match = options.find(o => o.name.toLowerCase() === val.toLowerCase());
        if (match) {
            onChange(match.id, match.name);
        } else {
            onChange('', val);
        }
    };

    const handleSelectOption = (option: AutocompleteOption) => {
        setSearchTerm(option.name);
        onChange(option.id, option.name);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div className={`flex items-center gap-3 bg-white border rounded-2xl p-4 transition-all shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary ${isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'}`}>
                {icon && <div className="text-primary/60">{icon}</div>}
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    required={required}
                    className="flex-1 bg-transparent font-bold text-text-main outline-none placeholder:text-text-muted/40"
                />
                <ChevronDown
                    size={20}
                    className={`text-text-muted/40 transition-transform cursor-pointer ${isOpen ? 'rotate-180' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                />
            </div>

            {isOpen && (
                <div className="absolute z-[60] left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-[300px] overflow-y-auto no-scrollbar animate-scale-in origin-top">
                    <div className="p-2 space-y-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleSelectOption(option)}
                                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-colors ${value === option.id ? 'bg-primary/5 text-primary' : 'hover:bg-gray-50 text-text-main'}`}
                                >
                                    <span className="font-bold">{option.name}</span>
                                    {value === option.id && <Check size={16} />}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center">
                                <Search size={24} className="mx-auto text-text-muted/20 mb-2" />
                                <p className="text-xs font-bold text-text-muted/60 uppercase tracking-widest">
                                    {searchTerm ? 'Custom value detected' : 'Start typing to see list'}
                                </p>
                                {searchTerm && (
                                    <p className="text-[10px] text-text-muted/40 font-bold mt-1">
                                        Value "{searchTerm}" will be saved as new
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
