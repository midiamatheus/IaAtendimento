export default async function handler(req, res) {
  return res.status(200).json({
    hasKey: !!process.env.ANTHROPIC_API_KEY,
    keyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
    keyPreview: process.env.ANTHROPIC_API_KEY?.substring(0, 10) || 'nenhuma',
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('ANTHROPIC'))
  });
}
