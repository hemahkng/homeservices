const MAP: Record<string, string> = {
  plumbing: '🚰',
  electrical: '💡',
  cleaning: '🧹',
  carpentry: '🪚',
  painting: '🎨',
  'ac repair': '❄️',
};

export const categoryIcon = (name: string) => MAP[name.toLowerCase()] ?? '🛠️';