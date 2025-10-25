export const BORDER_GRADIENTS: string[] = [
  'linear-gradient(135deg,#ff9a9e 0%,#fad0c4 100%)', // pink → peach
  'linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)', // purple → pink
  'linear-gradient(135deg,#f6d365 0%,#fda085 100%)', // saffron → apricot
  'linear-gradient(135deg,#84fab0 0%,#8fd3f4 100%)', // mint → sky
  'linear-gradient(135deg,#89f7fe 0%,#66a6ff 100%)', // cyan → blue
  'linear-gradient(135deg,#fccb90 0%,#d57eeb 100%)', // sand → violet
  'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)', // magenta → coral
  'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)', // green → teal
  'linear-gradient(135deg,#fa709a 0%,#fee140 100%)', // rose → yellow
  'linear-gradient(135deg,#30cfd0 0%,#330867 100%)', // teal → indigo
  'linear-gradient(135deg,#ffecd2 0%,#fcb69f 100%)', // cream → peach
  'linear-gradient(135deg,#e0c3fc 0%,#8ec5fc 100%)', // lilac → baby blue
];

// Deterministically assign a gradient based on a key (stable across renders)
export function gradientForKey(key: string): string {
  let sum = 0;
  for (let i = 0; i < key.length; i++) sum = (sum + key.charCodeAt(i)) >>> 0;
  const idx = sum % BORDER_GRADIENTS.length;
  return BORDER_GRADIENTS[idx];
}

