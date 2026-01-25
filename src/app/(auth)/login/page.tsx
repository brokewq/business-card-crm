'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, Loader2, Sparkles } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        router.push('/contacts');
        router.refresh();
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4F7FA]">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-200/20 rounded-full blur-3xl animate-float" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-navy-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/4 left-10 w-20 h-20 bg-white rounded-full shadow-clay blur-sm opacity-60 animate-float" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-1/3 right-10 w-16 h-16 bg-white rounded-full shadow-clay blur-sm opacity-60 animate-float" style={{ animationDelay: '3s' }} />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 mb-6 transition-transform hover:scale-105 duration-300">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/icons/logo.png" alt="CardCRM Logo" className="w-full h-full object-contain drop-shadow-glow-orange" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-navy-800 tracking-tight">Welcome Back</h1>
                    <p className="text-gray-500 mt-2 text-lg">Sign in to your CardCRM account</p>
                </div>

                {/* Login Card */}
                <div className="card p-8 shadow-clay-lg bg-white border-2 border-white/50">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-2">
                                <span className="font-bold">Error:</span> {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="label text-navy-700 font-semibold mb-2 block">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-accent-500 transition-colors" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input pl-12 py-3 bg-gray-50 border-transparent focus:bg-white transition-all shadow-inner-sm"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="label text-navy-700 font-semibold mb-2 block">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-accent-500 transition-colors" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pl-12 py-3 bg-gray-50 border-transparent focus:bg-white transition-all shadow-inner-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-4 text-lg font-bold shadow-glow-orange hover:translate-y-[-2px] transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <p className="text-gray-500">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="text-accent-600 hover:text-accent-700 font-bold hover:underline">
                                Sign up now
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
