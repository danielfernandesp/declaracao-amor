'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Trash2, Play, Pause } from 'lucide-react';

interface VoiceRecorderProps {
  onAudioReady: (audioBlob: Blob | null, previewUrl: string | null) => void;
}

export function VoiceRecorder({ onAudioReady }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onAudioReady(blob, url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev >= 60) {
            stopRecording(); // Limite de 60s para manter áudios objetivos
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      alert('Permita o acesso ao microfone no navegador para gravar sua mensagem.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const clearAudio = () => {
    setAudioUrl(null);
    setIsPlaying(false);
    setSeconds(0);
    onAudioReady(null, null);
  };

  const togglePlay = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="p-4 border border-rose-200 rounded-xl bg-rose-50/50 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-800">Mensagem de Voz Narrada</h4>
          <p className="text-xs text-gray-500">
            A música de fundo abaixa suavemente enquanto sua voz toca (máx. 60s).
          </p>
        </div>
        {isRecording && (
          <span className="text-xs font-mono font-bold text-rose-600 animate-pulse">
            ● 00:{seconds.toString().padStart(2, '0')}
          </span>
        )}
      </div>

      {!audioUrl ? (
        <div className="flex gap-2">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition"
            >
              <Mic className="w-4 h-4" /> Gravar minha voz
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition"
            >
              <Square className="w-4 h-4" /> Parar gravação
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-rose-100">
          <audio
            ref={audioPlayerRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center gap-2 text-sm font-medium text-rose-600"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pausar áudio' : 'Ouvir gravação'}
          </button>
          <button
            type="button"
            onClick={clearAudio}
            className="text-gray-400 hover:text-red-500 p-1"
            title="Excluir e gravar novamente"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}