import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, AlertCircle, CheckCircle2, Phone, ShieldAlert, HeartHandshake, MessageCircle, ArrowRight, Calendar, BrainCircuit, Activity } from 'lucide-react';

interface QuickTestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Preguntas basadas en escalas estandarizadas simplificadas (PHQ-9 / GAD-7)
const questions = [
    {
        id: 1,
        text: "¿Te has sentido nervioso(a), ansioso(a) o con los nervios de punta?",
    },
    {
        id: 2,
        text: "¿No has sido capaz de parar o controlar tus preocupaciones?",
    },
    {
        id: 3,
        text: "¿Has sentido poco interés o placer en hacer cosas?",
    },
    {
        id: 4,
        text: "¿Te has sentido decaído(a), deprimido(a) o sin esperanza?",
    },
    {
        id: 5,
        text: "¿Has tenido problemas para dormir o te has sentido cansado(a)?",
    },
    {
        id: 6,
        text: "¿Te has sentido mal contigo mismo(a) o que has fallado?",
    },
    {
        id: 7,
        text: "¿Has tenido dificultad para concentrarte en cosas como leer o ver TV?",
    }
];

export function QuickTestModal({ isOpen, onClose }: QuickTestModalProps) {
    const navigate = useNavigate();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1); // -1 is intro
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    if (!isOpen) return null;

    const handleStart = () => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowResult(false);
    };

    const handleAnswer = (value: number) => {
        const newScore = score + value;
        setScore(newScore);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setShowResult(true);
        }
    };

    const resetTest = () => {
        setCurrentQuestionIndex(-1);
        setScore(0);
        setShowResult(false);
    };

    const handleScheduleAppointment = () => {
        onClose();
        navigate('/appointments');
    };

    // Renderizado de Resultados
    const renderResult = () => {
        // Umbral: > 10 indica necesidad de atención profesional
        const isHighRisk = score >= 10;

        if (isHighRisk) {
            return (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-rose-50/50 border border-rose-100/50 rounded-2xl p-6 flex gap-5 backdrop-blur-sm shadow-sm">
                        <div className="bg-rose-100 p-3 rounded-xl h-fit shadow-inner">
                            <AlertCircle className="w-8 h-8 text-rose-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-rose-900 text-lg mb-2">Recomendación Profesional</h4>
                            <p className="text-rose-800/80 text-sm leading-relaxed">
                                Tus respuestas sugieren que estás experimentando un nivel significativo de malestar. Es fundamental que converses con un especialista para recibir el apoyo adecuado. No estás solo en esto.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleScheduleAppointment}
                        className="w-full py-4 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-2xl shadow-[0_8px_20px_rgba(225,29,72,0.3)] hover:shadow-[0_12px_24px_rgba(225,29,72,0.4)] hover:scale-[1.01] transition-all flex items-center justify-center group border border-rose-400/20"
                    >
                        <div className="bg-white/20 p-2 rounded-lg mr-3 group-hover:bg-white/30 transition-colors">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-base tracking-wide">Agendar Cita Prioritaria</span>
                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform opacity-80" />
                    </button>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200/60"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest">
                            <span className="bg-white px-3 text-slate-400 font-semibold">Recursos de Emergencia</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a href="tel:113" className="flex items-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-rose-200 hover:shadow-md transition-all group">
                            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mr-3 group-hover:bg-rose-50 transition-colors">
                                <Phone className="w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-colors" />
                            </div>
                            <div>
                                <span className="text-sm font-bold text-slate-800 block group-hover:text-rose-700 transition-colors">Línea 113 Salud</span>
                                <span className="text-xs text-slate-500">Opción 5 - Psicología</span>
                            </div>
                        </a>
                        <a href="https://chat100.aurora.gob.pe/" target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all group">
                            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mr-3 group-hover:bg-blue-50 transition-colors">
                                <MessageCircle className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <div>
                                <span className="text-sm font-bold text-slate-800 block group-hover:text-blue-700 transition-colors">Chat 100</span>
                                <span className="text-xs text-slate-500">Orientación Online</span>
                            </div>
                        </a>
                    </div>
                </div>
            );
        }

        // Low Risk Result
        return (
            <div className="text-center space-y-8 animate-fade-in py-4">
                <div className="relative mx-auto w-fit">
                    <div className="absolute inset-0 bg-emerald-200 blur-3xl opacity-30 rounded-full"></div>
                    <div className="w-28 h-28 bg-gradient-to-br from-emerald-50 to-white rounded-full flex items-center justify-center shadow-lg border border-emerald-100 relative z-10 animate-bounce-slow">
                        <CheckCircle2 className="w-14 h-14 text-emerald-500 drop-shadow-sm" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-slate-800">¡Tu bienestar es estable!</h3>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                        Tus respuestas indican un buen equilibrio emocional. Mantener hábitos saludables es clave para preservar este estado.
                    </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-white p-6 rounded-2xl text-left border border-emerald-100/50 relative overflow-hidden shadow-sm group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full -mr-8 -mt-8 blur-xl group-hover:bg-emerald-400/20 transition-all"></div>

                    <h4 className="font-bold text-emerald-800 text-xs uppercase tracking-widest mb-3 flex items-center">
                        <BrainCircuit className="w-4 h-4 mr-2 text-emerald-600" />
                        Recomendación del Día
                    </h4>
                    <p className="text-emerald-900/90 text-sm font-medium italic leading-relaxed pl-4 border-l-2 border-emerald-300">
                        "La práctica de la gratitud puede mejorar significativamente tu estado de ánimo. Intenta escribir 3 cosas por las que estás agradecido hoy antes de dormir."
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 text-sm font-semibold transition-colors px-6 py-2 rounded-full hover:bg-slate-50"
                >
                    Volver al Inicio
                </button>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in transition-all duration-300">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] max-w-lg w-full overflow-hidden relative flex flex-col min-h-[550px] border border-white/20 ring-1 ring-black/5">

                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="bg-rose-50 p-2 rounded-xl">
                            <Activity className="w-5 h-5 text-rose-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm leading-tight">Evaluación de Bienestar</h3>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Confidencial</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors group">
                        <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-8 flex flex-col justify-center relative">
                    {/* Background Decorations */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-rose-500/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative z-10 h-full flex flex-col">
                        {/* Intro Step */}
                        {currentQuestionIndex === -1 && !showResult && (
                            <div className="text-center space-y-10 animate-fade-in my-auto">
                                <div className="relative mx-auto w-fit group">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-rose-400 to-orange-300 blur-2xl opacity-20 rounded-full group-hover:opacity-30 transition-opacity duration-500"></div>
                                    <div className="w-24 h-24 bg-white rounded-3xl border border-rose-100 flex items-center justify-center shadow-xl shadow-rose-100/50 relative z-10 rotate-6 group-hover:rotate-3 transition-transform duration-500">
                                        <HeartHandshake className="w-12 h-12 text-rose-500 drop-shadow-sm" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">¿Cómo te sientes hoy?</h2>
                                    <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed font-medium">
                                        Realiza este breve chequeo emocional para recibir recomendaciones personalizadas. Tus respuestas son totalmente privadas.
                                    </p>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <button
                                        onClick={handleStart}
                                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-200 hover:shadow-2xl hover:scale-[1.02] hover:bg-slate-800 transition-all flex items-center justify-center group"
                                    >
                                        <span className="tracking-wide">Comenzar Evaluación</span>
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold opacity-70">
                                        Duración estimada: 45 segundos
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Questions Step */}
                        {currentQuestionIndex >= 0 && !showResult && (
                            <div className="space-y-8 animate-fade-in max-w-md mx-auto w-full my-auto">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end px-1">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pregunta {currentQuestionIndex + 1} <span className="text-slate-300 font-normal">/ {questions.length}</span></span>
                                        <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="h-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                                            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-slate-800 leading-snug min-h-[5rem] flex items-center">
                                    {questions[currentQuestionIndex].text}
                                </h3>

                                <div className="space-y-3">
                                    {[
                                        { label: "Nunca", value: 0 },
                                        { label: "Varios días", value: 1 },
                                        { label: "Más de la mitad de los días", value: 2 },
                                        { label: "Casi todos los días", value: 3 }
                                    ].map((option, idx) => (
                                        <button
                                            key={option.label}
                                            onClick={() => handleAnswer(option.value)}
                                            className="w-full p-4 text-left rounded-xl border border-slate-200 bg-white hover:border-rose-500 hover:ring-1 hover:ring-rose-500/20 hover:bg-rose-50/30 transition-all font-medium text-slate-600 flex justify-between items-center group active:scale-[0.98] shadow-sm hover:shadow-md"
                                            style={{ animationDelay: `${idx * 50}ms` }}
                                        >
                                            <span className="group-hover:text-rose-700 transition-colors">{option.label}</span>
                                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-rose-500 group-hover:bg-rose-500 transition-all flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform scale-0 group-hover:scale-100"></div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Results Step */}
                        {showResult && renderResult()}
                    </div>
                </div>
            </div>
        </div>
    );
}
