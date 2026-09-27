import { processWithEQuranVector } from './equranVectorService';

export interface AICitation {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  arabicText?: string;
  translation?: string;
  tafsirText?: string;
}

export interface AIDuaCitation {
  duaId: number;
  title: string;
  group: string;
  arabicText?: string;
  transliteration?: string;
  translation?: string;
  source?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  text: string;
  citations: AICitation[];
  duaCitations?: AIDuaCitation[];
  engine?: 'gemini' | 'vector';
  isFallback?: boolean;
}

async function streamWords(fullText: string, onChunk: (chunk: string) => void) {
  const words = fullText.split(' ');
  let accumulated = '';
  for (let i = 0; i < words.length; i++) {
    accumulated += (i > 0 ? ' ' : '') + words[i];
    onChunk(accumulated);
    if (i % 2 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 14));
    }
  }
  onChunk(fullText);
}

export async function chatWithAI(
  userMessage: string,
  onChunk: (chunk: string) => void,
  conversationHistory: ChatMessage[] = [],
  engine: 'gemini' | 'vector' = 'gemini'
): Promise<AIResponse> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        conversationHistory,
        engine,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server responded with ${res.status}`);
    }

    const data: AIResponse = await res.json();
    await streamWords(data.text || '', onChunk);
    return data;
  } catch (error) {
    console.error(`Error chatting with AI (engine: ${engine}):`, error);

    // Otomatis fallback ke EQuran Vector Search jika Gemini mengalami kendala / timeout / limit
    if (engine === 'gemini') {
      try {
        console.warn('Gemini error/timeout. Mencoba fallback ke EQuran Vector melalui server...');
        onChunk('*(Menghubungkan ke EQuran Vector Search...)*');

        const vectorRes = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            conversationHistory: [],
            engine: 'vector',
          }),
        });

        if (vectorRes.ok) {
          const vectorData: AIResponse = await vectorRes.json();
          vectorData.engine = 'vector';
          vectorData.isFallback = true;
          await streamWords(vectorData.text || '', onChunk);
          return vectorData;
        }
      } catch (srvVectorErr) {
        console.warn('Fallback server vector gagal, mencoba direct client vector...', srvVectorErr);
      }

      // Fallback tingkat 2: Langsung panggil client-side equranVectorService (bebas dependensi server)
      try {
        console.warn('Menjalankan direct client EQuran Vector Search...');
        const directVectorResult = await processWithEQuranVector(userMessage, { isFallback: true });
        await streamWords(directVectorResult.text || '', onChunk);
        return directVectorResult;
      } catch (directErr) {
        console.error('Direct vector fallback juga gagal:', directErr);
      }
    }

    const fallbackText = 'Maaf, terjadi kesalahan saat menghubungi asisten AI. Silakan periksa koneksi internet Anda atau coba kembali nanti.';
    onChunk(fallbackText);
    return {
      text: fallbackText,
      citations: [],
      engine,
    };
  }
}

