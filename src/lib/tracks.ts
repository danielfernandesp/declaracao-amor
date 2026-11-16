export interface NativeTrack {
  id: string;
  title: string;
  vibe: string;
  url: string;
}

export const NATIVE_TRACKS: NativeTrack[] = [
  {
    id: 'piano-suave',
    title: 'Piano & Chuva Leve',
    vibe: 'Romântico e Intimista',
    url: '/tracks/piano-suave.mp3',
  },
  {
    id: 'violao-acustico',
    title: 'Violão ao Pôr do Sol',
    vibe: 'Leve e Nostálgico',
    url: '/tracks/violao-acustico.mp3',
  },
  {
    id: 'cinematografico',
    title: 'Nossa História (Orquestra)',
    vibe: 'Emocionante',
    url: '/tracks/cinematografico.mp3',
  },
];