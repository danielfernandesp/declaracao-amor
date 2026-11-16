'use client';

import { Heart, Lock, Music, Volume2 } from 'lucide-react';
import { NATIVE_TRACKS } from '@/lib/tracks';

interface MobilePreviewProps {
  coupleNames: string;
  startDate: string;
  letterContent: string;
  photos: string[];
  selectedTrackId: string;
  hasVoiceNote: boolean;
  quizQuestion: string;
  plan: 'basic' | 'complete';
}

export function MobilePreview({
  coupleNames,
  startDate,
  letterContent,
  photos,
  selectedTrackId,
  hasVoiceNote,
  quizQuestion,
  plan,
}: MobilePreviewProps) {
  const track = NATIVE_TRACKS.find((t) => t.id === selectedTrackId);

  return (
    <div className="sticky top-6 flex flex-col items-center">
      <span className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
        Preview ao vivo (Visão de quem recebe)
      </span>

      {/* Moldura de Smartphone */}
      <div className="w-[320px] h-[620px] bg-gray-950 rounded-[40px] p-3 shadow-2xl border-4 border-gray-800 relative overflow-hidden">
        {/* Notch superior */}
        <div className="w-28 h-5 bg-gray-950 rounded-b-2xl mx-auto mb-2" />

        {/* Tela interna com scroll */}
        <div className="w-full h-[555px] bg-gradient-to-b from-rose-950 via-gray-900 to-black text-white rounded-[28px] overflow-y-auto p-4 space-y-5 scrollbar-none">
          {/* Player de Trilha Nativa */}
          {track && (
            <div className="flex items-center justify-between bg-white/10 backdrop-blur-md px-3 py-2 rounded-full text-xs">
              <div className="flex items-center gap-2 truncate">
                <Music className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">{track.title}</span>
              </div>
              <span className="text-[10px] text-rose-300">Tocando</span>
            </div>
          )}

          {/* Cabeçalho do Casal */}
          <div className="text-center space-y-1 pt-2">
            <Heart className="w-6 h-6 text-rose-500 mx-auto fill-rose-500 animate-pulse" />
            <h3 className="text-lg font-bold tracking-tight">
              {coupleNames || 'Você & Seu Amor'}
            </h3>
            {startDate && (
              <p className="text-xs text-rose-200/80">
                Juntos desde {new Date(startDate).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>

          {/* Galeria de Fotos */}
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {photos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt="Memória do casal"
                  className="w-full h-28 object-cover rounded-xl border border-white/10"
                />
              ))}
            </div>
          ) : (
            <div className="h-28 rounded-xl border border-dashed border-white/20 flex items-center justify-center text-xs text-gray-400">
              Suas fotos aparecerão aqui
            </div>
          )}

          {/* Indicador de Mensagem de Voz */}
          {hasVoiceNote && plan === 'complete' && (
            <div className="bg-rose-600/20 border border-rose-500/40 rounded-xl p-3 flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-rose-400 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-rose-200">Mensagem de voz gravada</p>
                <p className="text-rose-300/70">A música abaixa quando tocar</p>
              </div>
            </div>
          )}

          {/* Bloqueio de Gamificação (Quiz) */}
          {quizQuestion && plan === 'complete' && (
            <div className="bg-white/5 border border-amber-400/30 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" /> Desafio para abrir a carta:
              </div>
              <p className="text-xs text-gray-200">{quizQuestion}</p>
            </div>
          )}

          {/* Carta de Amor */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
            <p className="text-xs leading-relaxed text-gray-200 whitespace-pre-line">
              {letterContent ||
                'Use o Copiloto Entrevistador ao lado ou escreva sua declaração para vê-la ganhar vida aqui...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}