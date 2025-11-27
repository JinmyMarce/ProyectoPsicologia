import { useState, useEffect } from 'react';
import { Sparkles, Quote, RefreshCw } from 'lucide-react';

const quotes = [
    { text: "La paz viene de adentro. No la busques afuera.", author: "Buda" },
    { text: "No puedes detener las olas, pero puedes aprender a surfear.", author: "Jon Kabat-Zinn" },
    { text: "El único modo de hacer un gran trabajo es amar lo que haces.", author: "Steve Jobs" },
    { text: "Cree que puedes y ya estarás a medio camino.", author: "Theodore Roosevelt" },
    { text: "La felicidad no es algo que pospones para el futuro; es algo que diseñas para el presente.", author: "Jim Rohn" },
    { text: "Tu mente es un jardín. Tus pensamientos son las semillas. Puedes cultivar flores o puedes cultivar malas hierbas.", author: "William Wordsworth" },
    { text: "Sé amable contigo mismo. Es difícil ser feliz cuando alguien es malo contigo todo el tiempo.", author: "Christine Arylo" },
];

export function WellnessWidget() {
    const [quote, setQuote] = useState(quotes[0]);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Random quote on mount
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setQuote(quotes[randomIndex]);
    }, []);

    const handleNewQuote = () => {
        setIsAnimating(true);
        setTimeout(() => {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * quotes.length);
            } while (quotes[newIndex] === quote);

            setQuote(quotes[newIndex]);
            setIsAnimating(false);
        }, 300);
    };

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full -mr-10 -mt-10 blur-2xl transition-all duration-700 group-hover:bg-emerald-300/30"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-600">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm">Bienestar Diario</h3>
                    </div>
                    <button
                        onClick={handleNewQuote}
                        className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-full transition-colors"
                        title="Nueva frase"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isAnimating ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="flex gap-2 mb-2">
                        <Quote className="w-6 h-6 text-emerald-200 flex-shrink-0 transform -scale-x-100" />
                        <p className="text-slate-700 text-sm font-medium italic leading-relaxed">
                            {quote.text}
                        </p>
                    </div>
                    <p className="text-xs text-emerald-600 font-bold text-right pr-2">
                        — {quote.author}
                    </p>
                </div>
            </div>
        </div>
    );
}
