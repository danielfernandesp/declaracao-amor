'use client';

import { useState } from 'react';
import { Sparkles, Send, CheckCircle2 } from 'lucide-react';

interface CopilotChatProps {
  coupleNames: string;
  onLetterGenerated: (letter: string) => void;
}

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

export function CopilotChat({ coupleNames, onLetterGenerated }: CopilotChatProps) {
  const [tone, setTone] = useState<'romantico' | 'engracado' | 'poetico' | 'nostalgico'>('romantico');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Vou te entrevistar em 4 perguntas rápidas para escrever uma carta única (sem clichês!). Para começar: qual é uma mania engraçada ou detalhe do dia a dia dela(e) que você adora?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const updatedMessages: Message[] = [...messages, { role: 'user', content: input.trim() }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages, tone, coupleNames }),
      });

      const data = await res.json();

      if (data.isFinalLetter) {
        onLetterGenerated(data.reply);
        setFinished(true);
        setMessages([
          ...updatedMessages,
          {
            role: 'assistant',
            content: 'Pronto! Escrevi sua carta com base nas suas memórias e já preenchi no campo abaixo. Você pode editar qualquer palavra se quiser.',
          },
        ]);
      } else {
        setMessages([...updatedMessages, { role: 'assistant', content: data.reply }]);
      }
    } catch {
      alert('Erro ao conectar com o Copiloto IA. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-purple-200 bg-purple-50/40 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-purple-800 font-semibold text-sm">
          <Sparkles className="w-4 h-4 text-purple-600" />
          Copiloto Entrevistador IA
        </div>

        <select
          value={tone}
          onChange={(e) => setTone(e.target.value as typeof tone)}
          className="text-xs border border-purple-200 rounded-lg px-2 py-1 bg-white text-gray-700"
        >
          <option value="romantico">Tom: Romântico</option>
          <option value="engracado">Tom: Engraçado / Leve</option>
          <option value="poetico">Tom: Poético</option>
          <option value="nostalgico">Tom: Nostálgico</option>
        </select>
      </div>

      <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`text-xs p-3 rounded-xl max-w-[88%] leading-relaxed ${
              msg.role === 'assistant'
                ? 'bg-white border border-purple-100 text-gray-800'
                : 'bg-purple-600 text-white ml-auto'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="text-xs text-purple-600 animate-pulse px-2">
            Pensando na próxima pergunta...
          </div>
        )}
      </div>

      {!finished ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Responda aqui..."
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
          <CheckCircle2 className="w-4 h-4" /> Carta gerada com sucesso!
        </div>
      )}
    </div>
  );
}