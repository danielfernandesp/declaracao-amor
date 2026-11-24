import Link from 'next/link';
import {
  Heart,
  Sparkles,
  Mic,
  Lock,
  Camera,
  Check,
  ArrowRight,
  Music,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-rose-600 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-white/10 backdrop-blur-md sticky top-0 z-50 bg-gray-950/80">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span>NossoMomento</span>
          </div>
          <Link
            href="/criar"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-bold rounded-full transition"
          >
            Criar Agora Grátis
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-20 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Muito além de um link com fotos
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          Crie uma declaração de amor{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">
            interativa e inesquecível
          </span>
        </h1>

        <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Nossa IA entrevista você para escrever uma carta sem clichês, sincroniza sua voz com a
          trilha sonora e cria um desafio secreto para quem você ama desbloquear.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/criar"
            className="w-full sm:w-auto px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl shadow-xl shadow-rose-600/30 transition flex items-center justify-center gap-2 text-base"
          >
            Montar Minha Página Agora <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <p className="text-xs text-gray-400">
          Monte tudo e veja o preview no celular gratuitamente. Pague apenas para gerar o link final.
        </p>
      </section>

      {/* Diferenciais */}
      <section className="max-w-5xl mx-auto px-4 py-16 border-t border-white/10">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold">Por que essa página emociona de verdade?</h2>
          <p className="text-sm text-gray-400">Recursos exclusivos pensados para surpreender no celular</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <h3 className="font-bold text-base">Copiloto Entrevistador</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Travou na hora de escrever? Responda 4 perguntas rápidas sobre vocês e a IA cria uma
              carta única com as suas memórias reais.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3">
            <Mic className="w-6 h-6 text-rose-400" />
            <h3 className="font-bold text-base">Sua Voz + Trilha Sonora</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Grave uma mensagem de voz direto pelo navegador. Quando ela toca, a música de fundo
              abaixa suavemente como no cinema.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3">
            <Lock className="w-6 h-6 text-amber-400" />
            <h3 className="font-bold text-base">Quiz & Cápsula do Tempo</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Tranque a carta com uma pergunta sobre o casal e deixe uma mensagem secreta que só abre
              no próximo aniversário.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3">
            <Camera className="w-6 h-6 text-emerald-400" />
            <h3 className="font-bold text-base">Captura de Reação</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Receba um aviso no instante em que a página for aberta e guarde uma selfie da reação de
              quem recebeu.
            </p>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section className="max-w-4xl mx-auto px-4 py-16 border-t border-white/10">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold">Escolha a experiência ideal</h2>
          <p className="text-sm text-gray-400">Pagamento único via Pix. Liberação instantânea.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Básico */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Plano Básico</h3>
                <span className="text-2xl font-extrabold text-white">R$ 19,90</span>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Carta gerada com Copiloto IA
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Até 5 fotos do casal
                </li>
                <li className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-emerald-400" /> Trilha sonora nativa sem anúncios
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Link exclusivo válido por 1 ano
                </li>
              </ul>
            </div>

            <Link
              href="/criar"
              className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/10 text-center text-sm font-bold transition"
            >
              Começar com Básico
            </Link>
          </div>

          {/* Completo */}
          <div className="bg-gradient-to-b from-rose-950/60 to-white/5 border-2 border-rose-500 rounded-3xl p-7 flex flex-col justify-between space-y-6 relative">
            <span className="absolute -top-3 right-6 bg-rose-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full">
              MAIS ESCOLHIDO
            </span>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Completo Vitalício</h3>
                <span className="text-2xl font-extrabold text-rose-400">R$ 34,90</span>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-200">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-rose-400" /> Até 15 fotos + <strong>Acesso Vitalício</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-rose-400" /> Mensagem de Voz com efeito cinema
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-rose-400" /> Quiz Interativo de desbloqueio
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-rose-400" /> Cápsula do Tempo programada
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-rose-400" /> Aviso de abertura + Selfie de reação
                </li>
              </ul>
            </div>

            <Link
              href="/criar"
              className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-center text-sm font-bold shadow-lg shadow-rose-600/30 transition"
            >
              Criar Página Completa
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-gray-500">
        Feito para eternizar histórias de amor.
      </footer>
    </div>
  );
}