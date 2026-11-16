import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages, tone = 'romantico', coupleNames } = await req.json();

    const userTurns = messages.filter((m: { role: string }) => m.role === 'user').length;
    const isFinalGeneration = userTurns >= 4;

    const systemInstruction = `
Você é um escritor especialista em cartas de amor autênticas e emocionantes para o casal "${coupleNames || 'o casal'}".
O tom escolhido pelo usuário é: ${tone}.

REGRAS ESTRITAS:
1. PROIBIDO usar clichês genéricos como "você é a razão do meu viver", "alma gêmea", "desde o primeiro olhar tudo mudou", a menos que o usuário mencione isso. Use APENAS fatos, manias, apelidos e histórias reais que o usuário contar.
2. ${
      !isFinalGeneration
        ? `Você está na fase de ENTREVISTA (pergunta ${userTurns + 1} de 4). Faça APENAS UMA pergunta curta, leve e específica para extrair uma memória real (ex: uma mania engraçada, um perrengue que virou piada, onde foi o primeiro beijo, ou um detalhe do dia a dia que a pessoa ama). Não escreva a carta ainda.`
        : `Você já coletou memórias suficientes. Agora escreva a CARTA FINAL completa (entre 2 e 4 parágrafos bem fluidos), costurando todos os detalhes reais fornecidos pelo usuário no tom "${tone}". Retorne APENAS o texto da carta, sem introduções como "Aqui está sua carta:".`
    }
`;

    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.75,
      },
    });

    return NextResponse.json({
      reply: response.text,
      isFinalLetter: isFinalGeneration,
    });
  } catch (error) {
    console.error('Erro no Copiloto IA:', error);
    return NextResponse.json(
      { error: 'Falha ao processar entrevista com IA' },
      { status: 500 }
    );
  }
}