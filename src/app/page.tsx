'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ImagePlus, Sparkles, Check, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { NATIVE_TRACKS } from '@/lib/tracks';
import { CopilotChat } from '@/components/CopilotChat';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { MobilePreview } from '@/components/MobilePreview';

export default function CriarDeclaracaoPage() {
  const router = useRouter();
  const supabase = createClient();

  // Dados básicos
  const [coupleNames, setCoupleNames] = useState('');
  const [startDate, setStartDate] = useState('');
  const [letterContent, setLetterContent] = useState('');
  const [creatorContact, setCreatorContact] = useState('');

  // Mídia e Trilha
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState(NATIVE_TRACKS[0].id);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);

  // Gamificação (Plano Completo)
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState(['', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [timeCapsuleMsg, setTimeCapsuleMsg] = useState('');
  const [timeCapsuleDate, setTimeCapsuleDate] = useState('');

  // Plano Escalonado e Estado de Submissão
  const [plan, setPlan] = useState<'basic' | 'complete'>('complete');
  const [isSaving, setIsSaving] = useState(false);

  const maxPhotos = plan === 'basic' ? 5 : 15;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files).slice(0, maxPhotos - photoFiles.length);
    setPhotoFiles((prev) => [...prev, ...filesArray]);

    const newUrls = filesArray.map((file) => URL.createObjectURL(file));
    setPhotoPreviews((prev) => [...prev, ...newUrls]);
  };

  const generateSlug = (names: string) => {
    const clean = names
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `${clean || 'nosso-amor'}-${randomSuffix}`;
  };

  const handleSaveAndCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleNames.trim() || !letterContent.trim()) {
      alert('Preencha o nome do casal e o texto da carta antes de continuar.');
      return;
    }

    setIsSaving(true);

    try {
      const slug = generateSlug(coupleNames);
      let voiceNoteUrl: string | null = null;

      // 1. Upload do áudio narrado (se plano completo e gravado)
      if (plan === 'complete' && voiceBlob) {
        const audioPath = `${slug}/voice-${Date.now()}.webm`;
        const { error: audioErr } = await supabase.storage
          .from('declaration-media')
          .upload(audioPath, voiceBlob, { contentType: 'audio/webm' });

        if (!audioErr) {
          const { data } = supabase.storage.from('declaration-media').getPublicUrl(audioPath);
          voiceNoteUrl = data.publicUrl;
        }
      }

      // 2. Inserir registro principal da declaração como 'pending_payment'
      const { data: declaration, error: declErr } = await supabase
        .from('declarations')
        .insert({
          slug,
          plan,
          status: 'pending_payment',
          couple_names: coupleNames,
          relationship_start_date: startDate ? new Date(startDate).toISOString() : null,
          letter_content: letterContent,
          native_track_id: selectedTrackId,
          voice_note_url: voiceNoteUrl,
          time_capsule_message: plan === 'complete' ? timeCapsuleMsg || null : null,
          time_capsule_unlock_date:
            plan === 'complete' && timeCapsuleDate ? new Date(timeCapsuleDate).toISOString() : null,
          creator_contact: creatorContact || null,
        })
        .select('id, slug')
        .single();

      if (declErr || !declaration) throw declErr;

      // 3. Upload e registro das fotos
      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i];
        const filePath = `${slug}/photo-${i}-${Date.now()}`;
        const { error: upErr } = await supabase.storage
          .from('declaration-media')
          .upload(filePath, file);

        if (!upErr) {
          const { data } = supabase.storage.from('declaration-media').getPublicUrl(filePath);
          await supabase.from('declaration_photos').insert({
            declaration_id: declaration.id,
            image_url: data.publicUrl,
            display_order: i,
          });
        }
      }

      // 4. Salvar Quiz interativo (se plano completo e preenchido)
      if (plan === 'complete' && quizQuestion.trim() && quizOptions.every((o) => o.trim())) {
        await supabase.from('declaration_quizzes').insert({
          declaration_id: declaration.id,
          question: quizQuestion,
          options: quizOptions,
          correct_option_index: correctIndex,
          display_order: 0,
        });
      }

      // Redireciona para o checkout Pix com o ID da declaração
      router.push(`/checkout/${declaration.id}`);
    } catch (err) {
      console.error('Erro ao salvar declaração:', err);
      alert('Ocorreu um erro ao salvar sua declaração. Verifique sua conexão e tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna Esquerda: Formulário Interativo */}
        <form onSubmit={handleSaveAndCheckout} className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
              Crie sua Declaração Interativa
            </h1>
            <p className="text-sm text-gray-500">
              Monte tudo gratuitamente e veja como vai ficar no celular ao lado. Você só paga no final para liberar o link.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nome do Casal *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Daniel & Ana"
                  value={coupleNames}
                  onChange={(e) => setCoupleNames(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Início do Relacionamento
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bloco 2: Copiloto IA + Carta */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-base font-bold text-gray-900">1. A Carta de Amor</h2>
            <CopilotChat
              coupleNames={coupleNames}
              onLetterGenerated={(generated) => setLetterContent(generated)}
            />

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Texto da Carta (edite livremente) *
              </label>
              <textarea
                rows={6}
                required
                value={letterContent}
                onChange={(e) => setLetterContent(e.target.value)}
                placeholder="Converse com o Copiloto acima para gerar uma carta sem clichês ou escreva aqui..."
                className="w-full p-3 text-sm border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
          </div>

          {/* Bloco 3: Fotos, Trilha Sonora e Voz */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-base font-bold text-gray-900">2. Fotos, Trilha Sonora & Voz</h2>

            {/* Upload de Fotos */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Fotos do Casal ({photoFiles.length}/{maxPhotos})
              </label>
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-rose-400 transition text-sm text-gray-600">
                <ImagePlus className="w-5 h-5 text-rose-500" />
                <span>Adicionar fotos da galeria</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Trilha Sonora Nativa */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Trilha Sonora de Fundo (sem anúncios)
              </label>
              <select
                value={selectedTrackId}
                onChange={(e) => setSelectedTrackId(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-white"
              >
                {NATIVE_TRACKS.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.title} — ({track.vibe})
                  </option>
                ))}
              </select>
            </div>

            {/* Gravador de Voz */}
            <VoiceRecorder onAudioReady={(blob) => setVoiceBlob(blob)} />
          </div>

          {/* Bloco 4: Gamificação (Quiz + Cápsula do Tempo) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> 3. Gamificação & Surpresas
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Exclusivo Plano Completo
              </span>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-700">
                Pergunta de Desbloqueio (Quiz para abrir a carta)
              </label>
              <input
                type="text"
                placeholder="Ex: Onde foi o nosso primeiro beijo?"
                value={quizQuestion}
                onChange={(e) => setQuizQuestion(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {quizOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctIndex === idx}
                      onChange={() => setCorrectIndex(idx)}
                      title="Marcar como resposta certa"
                    />
                    <input
                      type="text"
                      placeholder={`Opção ${idx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const copy = [...quizOptions];
                        copy[idx] = e.target.value;
                        setQuizOptions(copy);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs border rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t space-y-2">
              <label className="block text-xs font-semibold text-gray-700">
                Cápsula do Tempo (Mensagem secreta bloqueada por data)
              </label>
              <input
                type="date"
                value={timeCapsuleDate}
                onChange={(e) => setTimeCapsuleDate(e.target.value)}
                className="w-full sm:w-1/2 px-3 py-1.5 text-xs border rounded-lg"
              />
              <textarea
                rows={2}
                placeholder="Escreva algo que só poderá ser lido na data acima..."
                value={timeCapsuleMsg}
                onChange={(e) => setTimeCapsuleMsg(e.target.value)}
                className="w-full p-2.5 text-xs border rounded-lg"
              />
            </div>
          </div>

          {/* Bloco 5: Seletor de Plano Escalonado e Notificação */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-base font-bold text-gray-900">4. Escolha seu Plano & Notificação</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Seu E-mail ou WhatsApp (para avisarmos quando a página for aberta)
              </label>
              <input
                type="text"
                placeholder="Ex: seuemail@gmail.com ou (31) 99999-9999"
                value={creatorContact}
                onChange={(e) => setCreatorContact(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Plano Básico */}
              <div
                onClick={() => setPlan('basic')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                  plan === 'basic' ? 'border-rose-600 bg-rose-50/40' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-900">Plano Básico</span>
                  <span className="font-extrabold text-rose-600">R$ 19,90</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1 mt-2">
                  <li className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-600" /> Até 5 fotos</li>
                  <li className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-600" /> Trilha sonora nativa</li>
                  <li className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-600" /> Link ativo por 1 ano</li>
                </ul>
              </div>

              {/* Plano Completo */}
              <div
                onClick={() => setPlan('complete')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition relative ${
                  plan === 'complete' ? 'border-rose-600 bg-rose-50/40' : 'border-gray-200'
                }`}
              >
                <span className="absolute -top-2.5 right-3 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  MAIS ESCOLHIDO
                </span>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-900">Completo Vitalício</span>
                  <span className="font-extrabold text-rose-600">R$ 34,90</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1 mt-2">
                  <li className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-600" /> Até 15 fotos + Link Vitalício</li>
                  <li className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-600" /> Mensagem de Voz Narrada</li>
                  <li className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-600" /> Quiz Interativo + Cápsula do Tempo</li>
                  <li className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-600" /> Captura de Reação + Notificação</li>
                </ul>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Lock className="w-4 h-4" />
              {isSaving
                ? 'Preparando sua página...'
                : `Gerar Link Definitivo (${plan === 'basic' ? 'R$ 19,90' : 'R$ 34,90'})`}
            </button>
          </div>
        </form>

        {/* Coluna Direita: Preview Interativo */}
        <div className="lg:col-span-5">
          <MobilePreview
            coupleNames={coupleNames}
            startDate={startDate}
            letterContent={letterContent}
            photos={photoPreviews}
            selectedTrackId={selectedTrackId}
            hasVoiceNote={Boolean(voiceBlob)}
            quizQuestion={quizQuestion}
            plan={plan}
          />
        </div>
      </div>
    </div>
  );
}