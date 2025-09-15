
export const promptCategories = [
  {
    title: '艺术风格',
    keywords: [
      { label: '照片', value: 'photorealistic' },
      { label: '动漫', value: 'anime style' },
      { label: '油画', value: 'oil painting' },
      { label: '概念艺术', value: 'concept art' },
      { label: '3D渲染', value: '3d render' },
      { label: '像素艺术', value: 'pixel art' },
      { label: '水彩画', value: 'watercolor' },
      { label: '素描', value: 'sketch' },
      { label: '电影感', value: 'cinematic' },
      { label: '赛博朋克', value: 'cyberpunk' },
      { label: '奇幻', value: 'fantasy' },
      { label: '蒸汽朋克', value: 'steampunk' },
    ],
  },
  {
    title: '主体细节',
    keywords: [
      { label: '美丽的', value: 'beautiful' },
      { label: '复杂的', value: 'intricate details' },
      { label: '动态姿势', value: 'dynamic pose' },
      { label: '表情丰富', value: 'expressive' },
      { label: '极简', value: 'minimalistic' },
      { label: '发光', value: 'glowing' },
    ],
  },
  {
    title: '环境/背景',
    keywords: [
      { label: '室外', value: 'outdoor' },
      { label: '科幻', value: 'sci-fi' },
      { label: '自然', value: 'nature' },
      { label: '城市', value: 'cityscape' },
      { label: '太空', value: 'outer space' },
      { label: '虚化背景', value: 'bokeh background' },
    ],
  },
  {
    title: '构图',
    keywords: [
      { label: '特写', value: 'close-up shot' },
      { label: '全身像', value: 'full body shot' },
      { label: '广角', value: 'wide angle shot' },
      { label: '肖像', value: 'portrait' },
      { label: '微距', value: 'macro shot' },
      { label: '鸟瞰', value: "bird's-eye view" },
      { label: '低角度', value: 'low angle shot' },
    ],
  },
  {
    title: '灯光',
    keywords: [
      { label: '柔和光', value: 'soft light' },
      { label: '戏剧性', value: 'dramatic lighting' },
      { label: '体积光', value: 'volumetric lighting' },
      { label: '黄昏光', value: 'golden hour' },
      { label: '霓虹灯', value: 'neon lighting' },
      { label: '轮廓光', value: 'rim lighting' },
      { label: '演播室', value: 'studio lighting' },
    ],
  },
  {
    title: '质量',
    keywords: [
      { label: '杰作', value: 'masterpiece' },
      { label: '超现实', value: 'hyperrealistic' },
      { label: '高细节', value: 'highly detailed' },
      { label: '专业调色', value: 'professional color grading' },
      { label: '2K', value: '2K' },
      { label: '4K', value: '4K' },
      { label: '锐利', value: 'sharp focus' },
    ],
  },
];

const keywordData: { [key: string]: { value: string; category: string } } = {};
promptCategories.forEach(category => {
  category.keywords.forEach(keyword => {
    keywordData[keyword.value] = { value: keyword.value, category: category.title };
  });
});

export const buildStructuredPrompt = (mainPrompt: string, selectedKeywords: string[]): string => {
  const prompt = mainPrompt.trim();
  
  const parts: string[] = [];
  if (prompt) {
      parts.push(prompt);
  }

  const groupedKeywords: { [key: string]: string[] } = {
    '艺术风格': [],
    '主体细节': [],
    '环境/背景': [],
    '构图': [],
    '灯光': [],
    '质量': [],
  };

  selectedKeywords.forEach(kw => {
    const data = keywordData[kw];
    if (data && groupedKeywords[data.category]) {
      groupedKeywords[data.category].push(kw);
    }
  });

  // A good structure is often: Subject, Details, Style, Composition, Quality
  
  const detailParts = [...groupedKeywords['主体细节'], ...groupedKeywords['环境/背景']];
  if (detailParts.length > 0) {
      parts.push(detailParts.join(', '));
  }

  if (groupedKeywords['艺术风格'].length > 0) {
      parts.push(groupedKeywords['艺术风格'].join(', '));
  }

  const technicalParts = [...groupedKeywords['构图'], ...groupedKeywords['灯光']];
  if (technicalParts.length > 0) {
      parts.push(technicalParts.join(', '));
  }
  
  // Quality keywords are usually best at the end to boost the overall result
  if (groupedKeywords['质量'].length > 0) {
      parts.push(groupedKeywords['质量'].join(', '));
  }

  // Filter out any empty strings that might have crept in and join.
  return parts.filter(p => p.trim() !== '').join(', ');
};
