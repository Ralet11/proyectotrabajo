export type PaletteName = 'orchid' | 'lagoon' | 'sunset';

export const paletteLabels: Record<PaletteName, { title: string; subtitle: string }> = {
  orchid: {
    title: 'Orchid',
    subtitle: 'Lila suave con contraste brillante',
  },
  lagoon: {
    title: 'Lagoon',
    subtitle: 'Azules frios con aire mas tecnico',
  },
  sunset: {
    title: 'Sunset',
    subtitle: 'Naranjas calidos con tono editorial',
  },
};

export type Palette = {
  name: PaletteName;
  background: string;
  backgroundAccent: string;
  surface: string;
  surfaceMuted: string;
  surfaceAlt: string;
  primary: string;
  primaryStrong: string;
  secondary: string;
  text: string;
  textMuted: string;
  textOnPrimary: string;
  border: string;
  shadow: string;
  success: string;
  warning: string;
};

export const palettes: Record<PaletteName, Palette> = {
  orchid: {
    name: 'orchid',
    background: '#F6EEFF',
    backgroundAccent: '#E7D7FF',
    surface: '#FFFFFF',
    surfaceMuted: '#F5ECFF',
    surfaceAlt: '#EEE1FF',
    primary: '#8E33FF',
    primaryStrong: '#6E1FE0',
    secondary: '#D8B8FF',
    text: '#25153E',
    textMuted: '#6F5A92',
    textOnPrimary: '#FFFFFF',
    border: '#E4D3FF',
    shadow: '#B18BEB',
    success: '#2DB986',
    warning: '#F59E0B',
  },
  lagoon: {
    name: 'lagoon',
    background: '#EEF8FB',
    backgroundAccent: '#D6F0F6',
    surface: '#FFFFFF',
    surfaceMuted: '#E8F7FA',
    surfaceAlt: '#D8EEF4',
    primary: '#0F9BB5',
    primaryStrong: '#0B6F82',
    secondary: '#90E1EB',
    text: '#123844',
    textMuted: '#50737D',
    textOnPrimary: '#FFFFFF',
    border: '#C7E8EE',
    shadow: '#73B9C7',
    success: '#1FA971',
    warning: '#F97316',
  },
  sunset: {
    name: 'sunset',
    background: '#FFF3EC',
    backgroundAccent: '#FFE2D3',
    surface: '#FFFFFF',
    surfaceMuted: '#FFF2EA',
    surfaceAlt: '#FFE3D3',
    primary: '#F97316',
    primaryStrong: '#D65500',
    secondary: '#FFC3A1',
    text: '#412114',
    textMuted: '#7C5B4B',
    textOnPrimary: '#FFFFFF',
    border: '#FFD8C4',
    shadow: '#F0B18B',
    success: '#16A34A',
    warning: '#DC2626',
  },
};
