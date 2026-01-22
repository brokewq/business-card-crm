'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { compressImage, generateImageFilename } from '@/lib/image-utils';
import { OCRResult } from '@/types';
import { VerificationForm } from '@/components/scanner/VerificationForm';
import { useToast } from '@/components/ui/Toast';
import {
    Camera,
    RotateCcw,
    Loader2,
    Upload,
    FlipHorizontal,
    X,
    WifiOff,
    Image as ImageIcon,
    Check,
} from 'lucide-react';

type ScanStage = 'capture' | 'processing' | 'verify';
type CardSide = 'front' | 'back';

export default function ScanPage() {
    const router = useRouter();
    const [stage, setStage] = useState<ScanStage>('capture');
    const [currentSide, setCurrentSide] = useState<CardSide>('front');
    const [frontImage, setFrontImage] = useState<string | null>(null);
    const [backImage, setBackImage] = useState<string | null>(null);
    const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
    const [processing, setProcessing] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const { showToast, ToastContainer } = useToast();

    // Check online status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        if (typeof window !== 'undefined') {
            setIsOnline(navigator.onLine);
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            }
        };
    }, []);

    // Attach stream to video element when camera becomes active
    useEffect(() => {
        if (cameraActive && streamRef.current && videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [cameraActive]);

    const startCamera = useCallback(async () => {
        if (!isOnline) {
            showToast('Camera requires internet connection for OCR', 'error');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
            });

            streamRef.current = stream;
            setCameraActive(true);
        } catch (error) {
            console.error('Camera error:', error);
            showToast('Could not access camera. Please check permissions.', 'error');
        }
    }, [facingMode, isOnline, showToast]);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => stopCamera();
    }, [stopCamera]);

    // Auto-start camera on page mount (skip intermediate screen)
    useEffect(() => {
        if (isOnline && stage === 'capture' && !frontImage && !cameraActive) {
            startCamera();
        }
    }, [isOnline, stage, frontImage, cameraActive, startCamera]);

    const captureImage = async () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

        if (currentSide === 'front') {
            setFrontImage(dataUrl);
            setCurrentSide('back');
            showToast('Front captured! Now capture back.', 'success');
        } else {
            setBackImage(dataUrl);
            // Auto-proceed to processing after capturing back
            showToast('Back captured! Processing...', 'success');
            stopCamera();
            // Use setTimeout to allow state to update before processing
            setTimeout(() => {
                processCardsWithImages(dataUrl);
            }, 100);
        }
    };

    // Separate function to process with specific back image (for auto-proceed)
    const processCardsWithImages = async (backImg: string) => {
        if (!frontImage) {
            showToast('Front image is required', 'error');
            return;
        }

        if (!isOnline) {
            showToast('Network required for OCR processing', 'error');
            return;
        }

        setProcessing(true);
        setStage('processing');

        try {
            const frontBase64 = frontImage.split(',')[1];
            const backBase64 = backImg.split(',')[1];

            const formData = new FormData();
            formData.append('frontImage', frontBase64);
            formData.append('backImage', backBase64);
            formData.append('mimeType', 'image/jpeg');

            const response = await fetch('/api/ocr', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('OCR processing failed');
            }

            const result: OCRResult = await response.json();
            setOcrResult(result);
            setStage('verify');
        } catch (error) {
            console.error('OCR error:', error);
            showToast('Failed to process business card. Please try again.', 'error');
            setStage('capture');
        } finally {
            setProcessing(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!isOnline) {
            showToast('Network required for OCR processing', 'error');
            return;
        }

        try {
            const compressed = await compressImage(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                if (currentSide === 'front') {
                    setFrontImage(dataUrl);
                    setCurrentSide('back');
                } else {
                    setBackImage(dataUrl);
                }
            };
            reader.readAsDataURL(compressed);
        } catch (error) {
            showToast('Failed to process image', 'error');
        }
    };

    const processCards = async () => {
        if (!frontImage) {
            showToast('Front image is required', 'error');
            return;
        }

        if (!isOnline) {
            showToast('Network required for OCR processing', 'error');
            return;
        }

        setProcessing(true);
        setStage('processing');
        stopCamera();

        try {
            // Extract base64 from data URL
            const frontBase64 = frontImage.split(',')[1];
            const backBase64 = backImage ? backImage.split(',')[1] : null;

            const formData = new FormData();
            formData.append('frontImage', frontBase64);
            if (backBase64) {
                formData.append('backImage', backBase64);
            }
            formData.append('mimeType', 'image/jpeg');

            const response = await fetch('/api/ocr', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('OCR processing failed');
            }

            const result: OCRResult = await response.json();
            setOcrResult(result);
            setStage('verify');
        } catch (error) {
            console.error('OCR error:', error);
            showToast('Failed to process business card. Please try again.', 'error');
            setStage('capture');
        } finally {
            setProcessing(false);
        }
    };

    const handleSaveContact = async (formData: any) => {
        try {
            // Upload image to storage if available
            let cardImageUrl = null;
            if (frontImage) {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const filename = generateImageFilename(user.id);
                    const base64 = frontImage.split(',')[1];
                    const blob = await fetch(`data:image/jpeg;base64,${base64}`).then(r => r.blob());

                    const { data, error } = await supabase.storage
                        .from('card-images')
                        .upload(filename, blob, { contentType: 'image/jpeg' });

                    if (data) {
                        const { data: urlData } = supabase.storage
                            .from('card-images')
                            .getPublicUrl(filename);
                        cardImageUrl = urlData.publicUrl;
                    }
                }
            }

            const response = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    card_image_url: cardImageUrl,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save contact');
            }

            showToast('Contact saved successfully!', 'success');
            router.push('/contacts');
        } catch (error) {
            console.error('Save error:', error);
            showToast('Failed to save contact', 'error');
        }
    };

    const reset = () => {
        setStage('capture');
        setCurrentSide('front');
        setFrontImage(null);
        setBackImage(null);
        setOcrResult(null);
        stopCamera();
    };

    const toggleCamera = () => {
        // stopCamera(); // Don't stop entirely, just switch
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    };

    // Offline warning
    if (!isOnline) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                    <WifiOff className="w-10 h-10 text-yellow-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Network Required</h2>
                <p className="text-dark-400 max-w-md">
                    Business card scanning requires an active internet connection to process
                    images using AI. Please check your connection and try again.
                </p>
            </div>
        );
    }

    // Processing stage
    if (stage === 'processing') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="w-20 h-20 rounded-full bg-primary-500/10 flex items-center justify-center mb-4 scan-pulse">
                    <Camera className="w-10 h-10 text-primary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Processing Card</h2>
                <p className="text-dark-400">
                    AI is extracting contact information...
                </p>
                <Loader2 className="w-8 h-8 animate-spin text-primary-500 mt-6" />
            </div>
        );
    }

    // Verification stage
    if (stage === 'verify' && ocrResult) {
        return (
            <VerificationForm
                ocrResult={ocrResult}
                cardImage={frontImage || ''}
                onSave={handleSaveContact}
                onCancel={reset}
            />
        );
    }

    // Capture stage
    return (
        <div className="max-w-4xl mx-auto pb-20 lg:pb-0 h-[calc(100vh-100px)] flex flex-col">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-white">Scan Business Card</h1>
                <p className="text-dark-400 mt-1">
                    {cameraActive ? `Align the ${currentSide} of the card` : 'Ready to capture'}
                </p>
            </div>

            {/* Main Camera/Preview Area - Flexible height */}
            <div className="flex-1 relative bg-black rounded-3xl overflow-hidden mb-6 card min-h-[300px] lg:max-h-[80vh] lg:aspect-video lg:mx-auto lg:w-full lg:max-w-5xl">
                {cameraActive ? (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Camera Overlay Guide */}
                        <div className="absolute inset-0 border-2 border-primary-500/50 m-8 rounded-xl pointer-events-none">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-500 -mt-1 -ml-1 rounded-tl-xl" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-500 -mt-1 -mr-1 rounded-tr-xl" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-500 -mb-1 -ml-1 rounded-bl-xl" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-500 -mb-1 -mr-1 rounded-br-xl" />
                        </div>

                        {/* Camera Controls */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center gap-8">
                            <div className="relative w-full max-w-md mx-auto flex items-center justify-center">
                                <button
                                    onClick={captureImage}
                                    className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-transform active:scale-95"
                                >
                                    <div className="w-16 h-16 rounded-full bg-white" />
                                </button>

                                <button
                                    onClick={stopCamera}
                                    className="p-3 rounded-full bg-dark-800/50 backdrop-blur-md text-white hover:bg-dark-700 transition-colors absolute right-4 lg:right-0"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Current Side Indicator */}
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-sm font-medium">
                            Capturing: {currentSide.toUpperCase()}
                        </div>
                    </>
                ) : (
                    /* Placeholder / Preview State */
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-dark-900">
                        {/* If we have images captured, show them */}
                        {frontImage ? (
                            <div className="grid grid-cols-2 gap-4 w-full h-full max-h-[400px]">
                                <div className="relative rounded-xl overflow-hidden bg-dark-800 border-2 border-primary-500">
                                    <img src={frontImage} className="w-full h-full object-cover" alt="Front" />
                                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white">Front</div>
                                    <button onClick={() => { setFrontImage(null); setCurrentSide('front'); }} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"><X className="w-4 h-4" /></button>
                                </div>

                                <div className={`relative rounded-xl overflow-hidden bg-dark-800 border-2 ${currentSide === 'back' && !backImage ? 'border-dashed border-dark-600' : 'border-dark-700'}`}>
                                    {backImage ? (
                                        <>
                                            <img src={backImage} className="w-full h-full object-cover" alt="Back" />
                                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white">Back</div>
                                            <button onClick={() => { setBackImage(null); setCurrentSide('back'); }} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"><X className="w-4 h-4" /></button>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-dark-400">
                                            <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center mb-2">
                                                <Camera className="w-6 h-6" />
                                            </div>
                                            <span className="text-sm">Back (Optional)</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="text-center">
                                <div className="w-24 h-24 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-6">
                                    <Camera className="w-10 h-10 text-primary-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Start Scanning</h3>
                                <p className="text-dark-400 max-w-sm mx-auto mb-8">
                                    Place your business card in a well-lit area.
                                    We&apos;ll extract all contact details automatically.
                                </p>
                                <button onClick={startCamera} className="btn btn-primary px-8 py-3 text-lg shadow-xl shadow-primary-500/20">
                                    <Camera className="w-6 h-6 mr-2" />
                                    Open Camera
                                </button>
                                <div className="mt-6">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-dark-400 text-sm hover:text-primary-400 transition-colors"
                                    >
                                        or upload from gallery
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Actions (Only visible when not using camera and have at least one image) */}
            {!cameraActive && frontImage && (
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={startCamera}
                        className="btn btn-secondary flex-1 py-3"
                    >
                        <Camera className="w-5 h-5" />
                        {backImage ? 'Retake Photos' : 'Capture Back Side'}
                    </button>
                    <button
                        onClick={processCards}
                        disabled={processing}
                        className="btn btn-primary flex-1 py-3"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Check className="w-5 h-5" />
                                Done & Process
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
            />

            <ToastContainer />
        </div>
    );
}
