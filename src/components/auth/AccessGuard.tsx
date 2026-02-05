import React, { useState, useEffect } from 'react';
import { Lock, Smartphone, ShieldCheck } from 'lucide-react';

interface AccessGuardProps {
    children: React.ReactNode;
}

const ACCESS_CODE = "1234"; // Simple default for friend access
const AUTH_KEY = "magic_slides_auth";

export const AccessGuard: React.FC<AccessGuardProps> = ({ children }) => {
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
    const [pin, setPin] = useState<string>("");
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        const auth = localStorage.getItem(AUTH_KEY);
        if (auth === 'true') {
            setIsAuthorized(true);
        }
    }, []);

    const handleVerify = () => {
        if (pin === ACCESS_CODE) {
            localStorage.setItem(AUTH_KEY, 'true');
            setIsAuthorized(true);
            setError(false);
        } else {
            setError(true);
            setPin("");
            setTimeout(() => setError(false), 2000);
        }
    };

    if (isAuthorized) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617] font-sans">
            {/* Background elements to match the app aesthetic */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />

            <div className={`relative w-full max-w-md p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl transition-all duration-300 ${error ? 'scale-95 border-red-500/50' : 'scale-100'}`}>
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        <Lock size={32} />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Access Required</h1>
                        <p className="text-slate-400 text-sm">This project is currently private. Please enter the access code provided by the owner.</p>
                    </div>

                    <div className="w-full space-y-4">
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                            placeholder="••••"
                            className="w-full h-16 text-center text-3xl tracking-[1em] bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-white/20"
                            autoFocus
                        />

                        {error && (
                            <p className="text-red-400 text-xs font-medium animate-pulse">Invalid access code. Please try again.</p>
                        )}

                        <button
                            onClick={handleVerify}
                            className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                        >
                            Verify & Enter
                        </button>
                    </div>

                    <div className="flex items-center gap-6 pt-4 text-xs text-slate-500 font-medium uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                            <Smartphone size={14} />
                            Mobile Ready
                        </div>
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck size={14} />
                            Secured Tunnel
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
