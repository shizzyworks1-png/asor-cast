import { BackgroundItem } from '../types/presentation';

export const DEFAULT_BACKGROUNDS: BackgroundItem[] = [
  {
    id: 'bg-majesty-gold',
    name: 'Ethereal Dawn',
    type: 'gradient',
    value: 'radial-gradient(circle at 50% 30%, #3b280c 0%, #1e1507 45%, #0a0804 100%)',
    category: 'worship'
  },
  {
    id: 'bg-sanctuary-indigo',
    name: 'Sanctuary Midnight',
    type: 'gradient',
    value: 'radial-gradient(circle at 50% 20%, #1e1b4b 0%, #0f172a 50%, #020617 100%)',
    category: 'worship'
  },
  {
    id: 'bg-cross-silhouette',
    name: 'Cross of Calvary',
    type: 'gradient',
    value: 'radial-gradient(ellipse at 50% 40%, #2e1065 0%, #170938 55%, #05020c 100%)',
    category: 'worship'
  },
  {
    id: 'bg-living-waters',
    name: 'Living Waters',
    type: 'gradient',
    value: 'radial-gradient(ellipse at 50% 30%, #0c4a6e 0%, #082f49 50%, #020617 100%)',
    category: 'ethereal'
  },
  {
    id: 'bg-stained-amber',
    name: 'Stained Glass Ember',
    type: 'gradient',
    value: 'linear-gradient(135deg, #18181b 0%, #451a03 50%, #0f172a 100%)',
    category: 'stained-glass'
  },
  {
    id: 'bg-crimson-redemption',
    name: 'Sacred Crimson',
    type: 'gradient',
    value: 'radial-gradient(circle at 50% 25%, #4c0519 0%, #1f0209 60%, #050002 100%)',
    category: 'worship'
  },
  {
    id: 'bg-emerald-grove',
    name: 'Pastures of Peace',
    type: 'gradient',
    value: 'radial-gradient(ellipse at 50% 30%, #064e3b 0%, #022c22 55%, #020617 100%)',
    category: 'ethereal'
  },
  {
    id: 'bg-pure-black',
    name: 'High Contrast Black',
    type: 'solid',
    value: '#000000',
    category: 'minimal'
  },
  {
    id: 'bg-traditional-navy',
    name: 'Traditional Church Blue',
    type: 'solid',
    value: '#02132b',
    category: 'minimal'
  }
];
