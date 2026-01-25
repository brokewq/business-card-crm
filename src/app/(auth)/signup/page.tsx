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
        <div className="min-h-screen flex items-center justify-center p-4 bg-clay-bg relative overflow-hidden">
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-200/30 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-navy-200/20 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-orange-200/20 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-400 to-accent-600 mb-6 shadow-clay-lg hover:scale-105 transition-transform duration-300">
                        <Sparkles className="w-10 h-10 text-white drop-shadow-md" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">CardCRM</h1>
                    <p className="text-gray-500 mt-2 text-lg">Create your professional account</p>
                </div>

                {/* Signup Card */}
                <div className="card p-8 shadow-clay-lg bg-white/80 backdrop-blur-xl border-white/50">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 shadow-clay">
                                <Mail className="w-10 h-10 text-green-600" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-2xl font-bold text-navy-900 mb-2">Check your email</h2>
                            <p className="text-gray-500 text-lg">
                                We&apos;ve sent a confirmation link to your inbox. Please click it to activate your account.
                            </p>
                            <Link href="/login" className="btn btn-primary mt-8 w-full py-4 text-lg">
                                Return to Sign In
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSignup} className="space-y-5">
                            {error && (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="email" className="label text-navy-800">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-accent-500 transition-colors" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input pl-12 h-12 text-base shadow-clay-inset"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="label text-navy-800">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-accent-500 transition-colors" />
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input pl-12 h-12 text-base shadow-clay-inset"
                                        placeholder="Minimum 6 characters"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="label text-navy-800">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-accent-500 transition-colors" />
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="input pl-12 h-12 text-base shadow-clay-inset"
                                        placeholder="Repeat your password"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full h-12 text-lg font-bold shadow-glow-orange mt-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>
                    )}

                    {!success && (
                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-gray-500">
                                Already have an account?{' '}
                                <Link href="/login" className="text-accent-600 hover:text-accent-500 font-bold underline underline-offset-4 decoration-accent-200 hover:decoration-accent-500 transition-all">
                                    Sign in instead
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
