export interface AICitation {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  arabicText?: string;
  translation?: string;
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
}

export async function chatWithAI(
  userMessage: string,
  onChunk: (chunk: string) => void,
  conversationHistory: ChatMessage[] = []
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
      }),
    });

    if (!res.ok) {
      throw new Error(`Server responded with ${res.status}`);
    }

    const data: AIResponse = await res.json();
    const fullText = data.text || '';

    // Progressive streaming delivery ("bertahap")
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
    return data;
  } catch (error) {
    console.error('Error chatting with AI:', error);
    const fallbackText = 'Maaf, terjadi kesalahan saat menghubungi asisten AI. Silakan periksa koneksi internet Anda atau coba kembali nanti.';
    onChunk(fallbackText);
    return {
      text: fallbackText,
      citations: [],
    };
  }
}
