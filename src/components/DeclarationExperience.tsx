'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Heart,
  Lock,
  Unlock,
  Play,
  Pause,
  Volume2,
  Camera,
  Clock,
  Sparkles,
  Share2,
} from 'lucide-react';
import { NATIVE_TRACKS } from '@/lib/tracks';
import { createClient } from '@/lib/supabase/client';

interface Quiz {
  id: string;
  question: string;
  options: string[];
  correct_option_index: number;
}

interface DeclarationData {
  id: string;
  slug: string;
  couple_names: string;
  relationship_start_date: string | null;
  letter_content: string;
  native_track_id: string | null;
  voice_note_url: string | null;
  time_capsule_message: string | null;
  time_capsule_unlock_date: string | null;
  reaction_media_url: string | null;
  photos: { id: string; image_url: string; caption: string | null }[];
  quizzes: Quiz[];
}

export function DeclarationExperience({ data }: { data: DeclarationData }) {
  const supabase = createClient();

  // Estados de Áudio e Ducking
  const [hasStarted, setHasStarted] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);

  // Estados do Quiz
  const hasQuiz = data.quizzes && data.quizzes.length > 0;
  const [quizUnlocked, setQuizUnlocked] = useState(!hasQuiz);
  const [wrongAttempt, setWrongAttempt] = useState(false);

  // Estado da Reação
  const [reactionUrl, setReactionUrl] = useState<string | null>(data.reaction_media_url);
  const [uploadingReaction, setUploadingReaction] = useState(false);

  const track = NATIVE_TRACKS.find((t) => t.id === data.native_track_id) || NATIVE_TRACKS[0];

  // Dispara notificação de abertura assim que a pessoa entra
  useEffect(() => {
    fetch(`/api/declarations/${data.slug}/interact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'opened' }),
    }).catch(() => {});
  }, [data.slug]);

  // Inicia experiência (necessário clique do usuário para liberar áudio no mobile)
  const startExperience = () => {
    setHasStarted(true);
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = 0.55;
      bgMusicRef.current.play().then(() => setIsMusicPlaying(true)).catch(() => {});
    }
  };

  // Efeito Ducking: abaixa música de fundo enquanto a voz toca
  const toggleVoiceNote = () => {
    if (!voiceAudioRef.current) return;

    if (isVoicePlaying) {
      voiceAudioRef.current.pause();
      setIsVoicePlaying(false);
      if (bgMusicRef.current) bgMusicRef.current.volume = 0.55;
    } else {
      if (bgMusicRef.current) bgMusicRef.current.volume = 0.1; // Ducking suave
      voiceAudioRef.current.play();
      setIsVoicePlaying(true);
    }
  };

  const handleVoiceEnded = () => {
    setIsVoicePlaying(false);
    if (bgMusicRef.current) bgMusicRef.current.volume = 0.55; // Restaura volume
  };

  const handleQuizAnswer = (selectedIdx: number) => {
    const currentQuiz = data.quizzes[0];
    if (selectedIdx === currentQuiz.correct_option_index) {
      setQuizUnlocked(true);
      setWrongAttempt(false);
    } else {
      setWrongAttempt(true);
    }
  };

  const handleReactionCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingReaction(true);
    try {
      const path = `${data.slug}/reaction-${Date.now()}`;
      const { error } = await supabase.storage.from('declaration-media').upload(path, file);
      if (!error) {
        const { data: pub } = supabase.storage.from('declaration-media').getPublicUrl(path);
        setReactionUrl(pub.publicUrl);

        await fetch(`/api/declarations/${data.slug}/interact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reaction', reactionMediaUrl: pub.publicUrl }),
        });
      }
    } finally {
      setUploadingReaction(false);
    }
  };

  // Tela inicial de "Abrir Presente" (garante autoplay do áudio no Safari/Chrome mobile)
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-950 via-gray-950 to-black text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <Heart className="w-16 h-16 text-rose-500 fill-rose-500 animate-bounce" />
        <div className="space-y-2 max-w-sm">
          <p className="text-xs uppercase tracking-widest text-rose-300">
            Você recebeu uma surpresa
          </p>
          <h1 className="text-3xl font-extrabold">{data.couple_names}</h1>
          <p className="text-sm text-gray-300">
            Aumente o som do celular e toque abaixo para abrir.
          </p>
        </div>
        <button
          onClick={startExperience}
          className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-full shadow-2xl shadow-rose-600/40 transition transform hover:scale-105"
        >
          Abrir Minha Declaração
        </button>
      </div>
    );
  }

  const isCapsuleUnlocked =
    data.time_capsule_unlock_date && new Date() >= new Date(data.time_capsule_unlock_date);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-950 via-gray-950 to-black text-white pb-20">
      {/* Áudios ocultos */}
      <audio ref={bgMusicRef} src={track.url} loop />
      {data.voice_note_url && (
        <audio ref={voiceAudioRef} src={data.voice_note_url} onEnded={handleVoiceEnded} />
      )}

      <div className="max-w-md mx-auto px-4 pt-6 space-y-8">
        {/* Barra Superior de Trilha Sonora */}
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10">
          <div className="flex items-center gap-2 text-xs truncate">
            <Volume2 className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="truncate">{track.title}</span>
          </div>
          <button
            onClick={() => {
              if (!bgMusicRef.current) return;
              if (isMusicPlaying) {
                bgMusicRef.current.pause();
                setIsMusicPlaying(false);
              } else {
                bgMusicRef.current.play();
                setIsMusicPlaying(true);
              }
            }}
            className="text-xs font-semibold text-rose-300"
          >
            {isMusicPlaying ? 'Pausar' : 'Tocar'}
          </button>
        </div>

        {/* Título e Data */}
        <div className="text-center space-y-2">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500 mx-auto animate-pulse" />
          <h1 className="text-3xl font-extrabold tracking-tight">{data.couple_names}</h1>
          {data.relationship_start_date && (
            <p className="text-sm text-rose-200/80">
              Escrevendo nossa história desde{' '}
              {new Date(data.relationship_start_date).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>

        {/* Galeria de Fotos */}
        {data.photos.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {data.photos.map((photo) => (
              <div
                key={photo.id}
                className="rounded-2xl overflow-hidden border border-white/15 shadow-lg"
              >
                <img
                  src={photo.image_url}
                  alt="Nosso momento"
                  className="w-full h-44 object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Mensagem de Voz Narrada (com Efeito Ducking) */}
        {data.voice_note_url && (
          <div className="bg-gradient-to-r from-rose-600/30 to-purple-600/30 border border-rose-400/30 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Ouça minha voz para você</p>
              <p className="text-xs text-rose-200">Gravei isso pensando em nós</p>
            </div>
            <button
              onClick={toggleVoiceNote}
              className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center shadow-lg transition"
            >
              {isVoicePlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
          </div>
        )}

        {/* Gamificação: Quiz de Desbloqueio OU Carta Completa */}
        {!quizUnlocked ? (
          <div className="bg-white/10 border border-amber-400/40 rounded-3xl p-6 space-y-4 text-center">
            <Lock className="w-8 h-8 text-amber-400 mx-auto" />
            <h2 className="text-lg font-bold text-amber-200">
              Responda para desbloquear a carta
            </h2>
            <p className="text-sm text-gray-200">{data.quizzes[0].question}</p>

            <div className="space-y-2 pt-2">
              {data.quizzes[0].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuizAnswer(idx)}
                  className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-rose-600/60 border border-white/15 text-sm font-medium transition"
                >
                  {option}
                </button>
              ))}
            </div>

            {wrongAttempt && (
              <p className="text-xs text-rose-400 font-medium">
                Quase! Tente outra resposta para abrir.
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Para você
            </div>
            <p className="text-sm leading-relaxed text-gray-100 whitespace-pre-line">
              {data.letter_content}
            </p>
          </div>
        )}

        {/* Cápsula do Tempo */}
        {data.time_capsule_message && data.time_capsule_unlock_date && (
          <div className="bg-white/5 border border-purple-400/30 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase">
              {isCapsuleUnlocked ? (
                <Unlock className="w-4 h-4 text-emerald-400" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              Cápsula do Tempo
            </div>

            {isCapsuleUnlocked ? (
              <p className="text-sm text-gray-200 whitespace-pre-line">
                {data.time_capsule_message}
              </p>
            ) : (
              <p className="text-xs text-gray-400">
                Esta mensagem secreta será destravada automaticamente em{' '}
                <strong className="text-purple-200">
                  {new Date(data.time_capsule_unlock_date).toLocaleDateString('pt-BR')}
                </strong>
                .
              </p>
            )}
          </div>
        )}

        {/* Captura de Reação (Viralização nos Stories) */}
        <div className="bg-rose-950/60 border border-rose-500/30 rounded-3xl p-5 text-center space-y-3">
          <h3 className="text-base font-bold">Registre sua reação agora!</h3>
          <p className="text-xs text-rose-200/80">
            Tire uma selfie mostrando sua cara ao ler isso para guardar de lembrança ou postar.
          </p>

          {reactionUrl ? (
            <div className="space-y-3">
              <img
                src={reactionUrl}
                alt="Reação"
                className="w-48 h-48 object-cover rounded-2xl mx-auto border-2 border-rose-400"
              />
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: data.couple_names,
                      text: 'Olha a declaração linda que eu recebi!',
                      url: window.location.href,
                    });
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 font-bold text-xs rounded-full"
              >
                <Share2 className="w-4 h-4" /> Compartilhar nos Stories
              </button>
            </div>
          ) : (
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-full cursor-pointer transition">
              <Camera className="w-4 h-4" />
              {uploadingReaction ? 'Salvando foto...' : 'Tirar Selfie da Reação'}
              <input
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleReactionCapture}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}