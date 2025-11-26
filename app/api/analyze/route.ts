import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase';

type InspectionLog = {
  created_at: string;
  status: string | null;
  confidence: number | null;
};

const MAX_RECORDS = 50;
const RECENT_SAMPLE = 10;

const baseURL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
const apiKey = process.env.DEEPSEEK_API_KEY;

const openai = new OpenAI({
  baseURL,
  apiKey,
});

const SYSTEM_PROMPT = `You are a QA (Quality Assurance) expert in a Lego factory.

Analyze the provided production data and provide:

1. A brief summary of current quality.
2. Potential causes for defects if the rate is high (>5%).
3. 3 actionable suggestions.

Keep it concise, professional, and always respond in English.`;

const summarizeLogs = (records: InspectionLog[]) => {
  const total = records.length;
  const defectCount = records.filter(
    (log) => (log.status || '').toLowerCase() === 'defective'
  ).length;
  const defectRate = total ? (defectCount / total) * 100 : 0;
  const averageConfidence = total
    ? records.reduce((sum, log) => sum + (log.confidence ?? 0), 0) / total
    : 0;
  const recentStatuses = records.slice(0, RECENT_SAMPLE).map((log) => log.status || 'unknown');

  return {
    total,
    defectCount,
    defectRate,
    averageConfidence,
    recentStatuses,
  };
};

export async function POST() {
  try {
    if (!apiKey) {
      throw new Error('Missing DEEPSEEK_API_KEY environment variable');
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('inspection_logs')
      .select('created_at,status,confidence')
      .order('created_at', { ascending: false })
      .limit(MAX_RECORDS);

    if (error) {
      throw error;
    }

    const records: InspectionLog[] = data || [];
    const stats = summarizeLogs(records);

    const userPrompt = [
      `Here are the latest 50 inspection logs:`,
      `- Total samples: ${stats.total}`,
      `- Defect count: ${stats.defectCount}`,
      `- Defect rate: ${stats.defectRate.toFixed(2)}%`,
      `- Average confidence: ${stats.averageConfidence.toFixed(2)}`,
      `- Latest ${RECENT_SAMPLE} statuses: ${stats.recentStatuses.join(', ') || 'no recent data'}`,
      `Generate the requested insights strictly in English.`,
    ].join('\n');

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      temperature: 0.4,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    });

    const analysis = completion.choices[0]?.message?.content?.trim();

    if (!analysis) {
      throw new Error('DeepSeek returned an empty response');
    }

    return NextResponse.json({
      analysis,
      stats,
    });
  } catch (err) {
    console.error('AI analyze error', err);
    const message =
      err instanceof Error ? err.message : 'Failed to analyze inspection logs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

