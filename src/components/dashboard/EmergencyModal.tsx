import { X, Phone, ShieldAlert, HeartHandshake, MessageCircle, Clock, MapPin } from 'lucide-react';

interface EmergencyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all scale-100 relative flex flex-col max-h-[90vh]">
                {/* Header de Alerta - Más serio y prominente */}
                <div className="bg-rose-600 px-8 py-6 relative overflow-hidden flex-shrink-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-800/20 rounded-full -ml-10 -mb-10 blur-3xl"></div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg">
                                <ShieldAlert className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white tracking-tight">
                                    Centro de Ayuda y Emergencia
                                </h3>
                                <p className="text-rose-100 text-sm font-medium mt-1">Recursos de apoyo disponibles 24/7</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-colors backdrop-blur-sm border border-white/10"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50">
                    <div className="p-8 space-y-8">
                        {/* Aviso Importante */}
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-4 items-start">
                            <div className="bg-amber-100 p-2 rounded-lg text-amber-600 flex-shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-800 text-sm mb-1">Atención Inmediata</h4>
                                <p className="text-amber-700 text-xs leading-relaxed">
                                    Si estás en una situación de riesgo vital inminente, no dudes en llamar a la policía (105) o acudir al servicio de emergencia más cercano. Tu seguridad es lo primero.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Línea 113 - Salud Mental */}
                            <a href="tel:113" className="col-span-1 md:col-span-2 flex items-center p-5 bg-white rounded-2xl border border-violet-100 shadow-sm hover:shadow-md hover:border-violet-300 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-violet-100 transition-colors"></div>
                                <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mr-5 text-violet-600 group-hover:scale-110 transition-transform relative z-10">
                                    <HeartHandshake className="w-7 h-7" />
                                </div>
                                <div className="flex-1 relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg">Línea 113 Salud</h4>
                                            <p className="text-violet-600 font-semibold text-xs uppercase tracking-wider mb-1">Opción 5 - Psicología</p>
                                        </div>
                                        <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-lg font-black text-xl">113</span>
                                    </div>
                                    <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                                        Orientación gratuita en salud mental, psicología y psiquiatría. Disponible las 24 horas, todos los días del año.
                                    </p>
                                </div>
                            </a>

                            {/* Línea 100 - Violencia */}
                            <a href="tel:100" className="flex flex-col p-5 bg-white rounded-2xl border border-rose-100 shadow-sm hover:shadow-md hover:border-rose-300 transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                                        <ShieldAlert className="w-5 h-5" />
                                    </div>
                                    <span className="bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-lg font-black text-lg">100</span>
                                </div>
                                <h4 className="font-bold text-slate-900 mb-1">Línea 100</h4>
                                <p className="text-slate-500 text-xs leading-relaxed">
                                    Ayuda ante violencia familiar y sexual. Orientación, consejería y soporte emocional gratuito.
                                </p>
                            </a>

                            {/* Chat 100 */}
                            <a href="https://chat100.aurora.gob.pe/" target="_blank" rel="noopener noreferrer" className="flex flex-col p-5 bg-white rounded-2xl border border-blue-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                        <MessageCircle className="w-5 h-5" />
                                    </div>
                                    <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-lg font-bold text-xs uppercase">Web</span>
                                </div>
                                <h4 className="font-bold text-slate-900 mb-1">Chat 100</h4>
                                <p className="text-slate-500 text-xs leading-relaxed">
                                    Servicio personalizado por internet en tiempo real. Orientación psicológica confidencial.
                                </p>
                            </a>

                            {/* SAMU */}
                            <a href="tel:106" className="flex items-center p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all group">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mr-3 text-slate-600">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 text-sm">SAMU</h4>
                                    <p className="text-[10px] text-slate-500">Atención Médica Urgente</p>
                                </div>
                                <span className="text-lg font-black text-slate-700">106</span>
                            </a>

                            {/* Policía */}
                            <a href="tel:105" className="flex items-center p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all group">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mr-3 text-slate-600">
                                    <ShieldAlert className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 text-sm">Policía</h4>
                                    <p className="text-[10px] text-slate-500">Emergencias Generales</p>
                                </div>
                                <span className="text-lg font-black text-slate-700">105</span>
                            </a>
                        </div>

                        {/* Ubicación del Instituto (Simulado/Placeholder) */}
                        <div className="mt-6 pt-6 border-t border-slate-200">
                            <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-slate-500" />
                                Recursos del Instituto
                            </h4>
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <p className="text-sm font-semibold text-slate-700">Departamento de Psicología</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Horario de atención: Lunes a Viernes, 8:00 AM - 5:00 PM
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Ubicación: Pabellón B, 2do Piso
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white px-8 py-5 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-6 rounded-xl transition-colors text-sm"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
