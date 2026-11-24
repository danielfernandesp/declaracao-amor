import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { action, reactionMediaUrl } = await req.json();

    const { data: decl } = await supabaseAdmin
      .from('declarations')
      .select('id, couple_names, creator_contact, first_opened_at')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (!decl) {
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 });
    }

    // Ação 1: Primeira abertura da página
    if (action === 'opened' && !decl.first_opened_at) {
      await supabaseAdmin
        .from('declarations')
        .update({ first_opened_at: new Date().toISOString() })
        .eq('id', decl.id);

      // Dispara e-mail transacional se configurado (ex: Resend) e se o contato for e-mail
      if (process.env.RESEND_API_KEY && decl.creator_contact?.includes('@')) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Declaração de Amor <avisos@seudominio.com.br>',
            to: decl.creator_contact,
            subject: `❤️ Sua declaração para ${decl.couple_names} acabou de ser aberta!`,
            html: `<p>O grande momento chegou! A página <strong>${decl.couple_names}</strong> acabou de ser aberta agora mesmo.</p>`,
          }),
        });
      }
    }

    // Ação 2: Salvar selfie/vídeo de reação
    if (action === 'reaction' && reactionMediaUrl) {
      await supabaseAdmin
        .from('declarations')
        .update({ reaction_media_url: reactionMediaUrl })
        .eq('id', decl.id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Erro na interação pública:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}