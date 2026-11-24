import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DeclarationExperience } from '@/components/DeclarationExperience';

export default async function PublicDeclarationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: declaration } = await supabase
    .from('declarations')
    .select(
      `
      id,
      slug,
      couple_names,
      relationship_start_date,
      letter_content,
      native_track_id,
      voice_note_url,
      time_capsule_message,
      time_capsule_unlock_date,
      reaction_media_url,
      declaration_photos (id, image_url, caption, display_order),
      declaration_quizzes (id, question, options, correct_option_index)
    `
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!declaration) {
    notFound();
  }

  const formattedData = {
    ...declaration,
    photos: (declaration.declaration_photos || []).sort(
      (a, b) => a.display_order - b.display_order
    ),
    quizzes: declaration.declaration_quizzes || [],
  };

  return <DeclarationExperience data={formattedData} />;
}