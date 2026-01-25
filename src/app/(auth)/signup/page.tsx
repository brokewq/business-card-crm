'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, Loader2, Sparkles, User } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/contacts`,
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        setSuccess(true);
        setLoading(false);
    };

    return (

        <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-[#F4F7FA]">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-200/20 rounded-full blur-3xl animate-float" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-navy-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/4 left-10 w-20 h-20 bg-white rounded-full shadow-clay blur-sm opacity-60 animate-float" style={{ animationDelay: '1s' }} />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-400 to-accent-600 mb-6 shadow-glow-orange transform -rotate-3">
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-navy-800 tracking-tight">Create Account</h1>
                    <p className="text-gray-500 mt-2 text-lg">Start managing your contacts with AI</p>
                </div>

                {/* Signup Card */}
                <div className="card p-8 shadow-clay-lg bg-white border-2 border-white/50">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <Mail className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-navy-800 mb-3">Check your email</h2>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                We&apos;ve sent you a confirmation link. Please check your inbox and click the link to activate your account.
                            </p>
                            <Link href="/login" className="btn btn-primary w-full py-3 shadow-glow-orange">
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSignup} className="space-y-5">
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
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="label text-navy-700 font-semibold mb-2 block">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-accent-500 transition-colors" />
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="input pl-12 py-3 bg-gray-50 border-transparent focus:bg-white transition-all shadow-inner-sm"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
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
                                        Creating account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>
                    )}

                    {!success && (
                        <div className="mt-8 text-center text-sm">
                            <p className="text-gray-500">
                                Already have an account?{' '}
                                <Link href="/login" className="text-accent-600 hover:text-accent-700 font-bold hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
