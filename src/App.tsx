/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Stars, Sparkles, Send, RotateCcw, Volume2, VolumeX, Share2, Check, Mic, MicOff } from 'lucide-react';

export default function App() {
  const [accepted, setAccepted] = useState(false);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [messageIndex, setMessageIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showMusicTooltip, setShowMusicTooltip] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [customApology, setCustomApology] = useState('');
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const apologyMessages = [
    "Hai...",
    "Aku tahu, apa pun yang aku katakan mungkin tidak bisa menghapus kesalahan masa lalu.",
    "Aku sering merenung, memikirkan betapa bodohnya aku saat itu.",
    "Ego dan kekuranganku telah menyakitimu, orang yang paling berharga bagiku.",
    "Malam ini, aku hanya ingin jujur dari lubuk hati yang paling dalam...",
    "Aku minta maaf atas segalanya. Atas setiap air mata dan kekecewaan yang aku buat.",
    "Bolehkah aku meminta satu kesempatan lagi untuk memperbaiki semuanya?"
  ];

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'id-ID'; // Indonesian

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCustomApology(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setCustomApology('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Maafkan Aku & Beri Aku Satu Kesempatan',
      text: 'Aku sudah memaafkannya! Mari kita mulai lembaran baru yang lebih baik bersama-sama. ❤️',
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err instanceof Error ? err.message : String(err));
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n\nLihat pesannya di sini: ${shareData.url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Error copying to clipboard:', err instanceof Error ? err.message : String(err));
      }
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e instanceof Error ? e.message : String(e)));
      } else {
        audioRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    if (messageIndex < apologyMessages.length - 1) {
      const timer = setTimeout(() => {
        setMessageIndex(prev => prev + 1);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [messageIndex]);

  const handleNoHover = () => {
    if (containerRef.current) {
      const pad = 100;
      const newX = Math.random() * (window.innerWidth - 2 * pad) - (window.innerWidth / 2 - pad);
      const newY = Math.random() * (window.innerHeight - 2 * pad) - (window.innerHeight / 2 - pad);
      setNoButtonPos({ x: newX, y: newY });
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden text-natural-stone">
      {/* Background Audio */}
      <audio
        ref={audioRef}
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
        loop
        preload="auto"
        crossOrigin="anonymous"
        onError={() => console.error("Audio error: Failed to load source")}
      />

      {/* Atmosphere Background */}
      <div className="absolute inset-0 pointer-events-none atmosphere z-0" />
      
      {/* Music Toggle with Tooltip */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <AnimatePresence>
          {showMusicTooltip && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="px-3 py-1.5 rounded-lg glass-card text-[10px] font-sans font-bold tracking-widest uppercase text-natural-stone/60 shadow-sm pointer-events-none"
            >
              {isMuted ? 'Putar Musik Latar' : 'Matikan Musik'}
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={toggleMusic}
          onMouseEnter={() => setShowMusicTooltip(true)}
          onMouseLeave={() => setShowMusicTooltip(false)}
          className="p-4 rounded-full glass-card text-natural-sage hover:text-natural-stone transition-colors shadow-lg active:scale-95"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="animate-pulse" />}
        </motion.button>
      </div>

      {/* Decorative Floating Hearts */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0, 
              x: Math.random() * window.innerWidth, 
              y: window.innerHeight + 100 
            }}
            animate={{ 
              opacity: [0, 0.4, 0],
              y: -200,
              x: `calc(${Math.random() * 100}vw + ${Math.sin(i) * 50}px)`
            }}
            transition={{ 
              duration: 8 + Math.random() * 10, 
              repeat: Infinity,
              delay: Math.random() * 20
            }}
            className="absolute text-natural-sage/20"
          >
            <Heart size={20 + Math.random() * 30} fill="currentColor" />
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!accepted ? (
          <motion.div 
            key="apology"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card z-20 max-w-2xl w-full p-8 md:p-12 rounded-[40px] text-center shadow-sm space-y-8"
          >
            <header className="space-y-2">
              <p className="uppercase tracking-[0.3em] text-[10px] font-sans font-semibold text-[#8C8479]">Sebuah Pesan Tulus</p>
              <h1 className="text-3xl italic text-[#5C5449]">Maafkan Aku...</h1>
            </header>

            <motion.div 
              className="inline-block p-4 rounded-full bg-natural-sage/10 text-natural-sage mb-4 mx-auto"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart fill="currentColor" size={32} />
            </motion.div>

            <div className="space-y-6 min-h-[160px] flex flex-col justify-center">
              <motion.p
                key={messageIndex + (customApology ? '_custom' : '_msg')}
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                className="font-serif italic text-2xl md:text-3xl leading-relaxed text-natural-stone"
              >
                "{customApology || apologyMessages[messageIndex]}"
              </motion.p>
              
              {messageIndex === apologyMessages.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <button
                    onClick={toggleListening}
                    className={`mt-4 p-4 rounded-full transition-all flex items-center gap-3 shadow-md ${
                      isListening 
                        ? 'bg-romantic-red text-white animate-pulse' 
                        : 'bg-natural-sage/10 text-natural-sage hover:bg-natural-sage/20'
                    }`}
                  >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    <span className="text-xs font-bold tracking-widest uppercase">
                      {isListening ? 'Selesai Berbicara' : 'Bicara Dari Hati'}
                    </span>
                  </button>
                  {isListening && <p className="text-[10px] text-romantic-red animate-pulse font-bold tracking-widest uppercase">Mendengarkan...</p>}
                </motion.div>
              )}
            </div>

            {messageIndex === apologyMessages.length - 1 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-8 space-y-6"
              >
                <p className="text-sm font-sans text-[#8C8479] tracking-wide">Apakah ada ruang untuk kesempatan kedua?</p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(125, 140, 123, 0.4)" }}
                    whileTap={{ scale: 0.9, rotate: [0, -1, 1, 0] }}
                    onClick={() => setAccepted(true)}
                    className="px-10 py-4 bg-natural-sage text-white flex items-center justify-center gap-2 rounded-full font-sans text-xs font-bold tracking-widest shadow-lg shadow-natural-sage/20 hover:bg-[#6B7A69] transition-all uppercase w-full md:w-auto relative group overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/20 scale-0 group-active:scale-150 transition-transform duration-500 rounded-full"
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      MAU, AYO COBA LAGI <Sparkles size={16} className="animate-bounce" />
                    </span>
                  </motion.button>

                  <motion.button
                    animate={{ x: noButtonPos.x, y: noButtonPos.y }}
                    onMouseEnter={handleNoHover}
                    className="px-10 py-4 border border-natural-tan text-[#8C7A69] rounded-full font-sans text-xs font-bold tracking-widest hover:bg-natural-tan/10 transition-colors whitespace-nowrap uppercase w-full md:w-auto"
                  >
                    TIDAK, TERIMA KASIH
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card z-20 max-w-xl w-full p-10 md:p-16 rounded-[2rem] text-center shadow-2xl relative overflow-hidden"
          >
            {/* Success particles */}
            <div className="absolute inset-0 pointer-events-none">
               <Stars className="absolute top-10 left-10 text-yellow-200/40 animate-pulse" />
               <Sparkles className="absolute bottom-10 right-10 text-pink-200/40 animate-pulse" />
            </div>

            <div className="space-y-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 bg-natural-sage/20 text-natural-sage mx-auto rounded-full flex items-center justify-center"
              >
                <Heart fill="currentColor" size={48} />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="space-y-4"
              >
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-natural-stone italic">Terima Kasih!</h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 1 }}
                  className="text-lg text-[#5C5449] leading-relaxed font-serif italic"
                >
                  "Terimakasih yah sayangku udah ngasih kesempatan lagi aku janji tidak akan mengecewakan lagi."
                </motion.p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="pt-6 space-y-4"
              >
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleShare}
                    className="px-8 py-3 bg-natural-tan/20 text-[#8C7A69] border border-natural-tan/40 flex items-center justify-center gap-2 rounded-full font-sans text-xs font-bold tracking-widest shadow-sm hover:bg-natural-tan/30 transition-all uppercase w-full md:w-auto"
                  >
                    {copied ? (
                      <>TERSALIN <Check size={14} /></>
                    ) : (
                      <>BAGIKAN KEBAHAGIAAN <Share2 size={14} /></>
                    )}
                  </motion.button>

                  <button 
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 text-[#8C8479] hover:text-natural-stone flex items-center justify-center gap-2 transition-colors font-sans text-xs tracking-widest font-bold uppercase"
                  >
                    <RotateCcw size={14} /> LIHAT LAGI
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signature */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[#8C8479]/40 text-[10px] tracking-[0.3em] font-sans font-semibold uppercase z-20">
        Dibuat dengan segenap penyesalan & cinta
      </div>
    </div>
  );
}
