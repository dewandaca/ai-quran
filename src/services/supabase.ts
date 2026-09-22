// Supabase Client for vector similarity search (RAG)
import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://khqaeovtercgdfngmqrq.supabase.co';
const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocWFlb3Z0ZXJjZ2RmbmdtcXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjIyNDIsImV4cCI6MjEwNTUzODI0Mn0.Ebb7nxi2RPLQzXGVS-PtyGrNSanuFAxwgxxN6j-ccxU';

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export interface VectorSearchResult {
  id: number;
  surah_number: number;
  ayah_number: number;
  surah_name: string;
  arabic_text: string;
  transliteration?: string;
  translation: string;
  tafsir_text: string;
  similarity: number;
}

export async function searchVerses(
  queryEmbedding: number[],
  matchThreshold: number = 0.55,
  matchCount: number = 5
): Promise<VectorSearchResult[]> {
  if (!supabase) {
    console.warn('Supabase credentials not configured. Skipping vector search.');
    return [];
  }

  try {
    const { data, error } = await supabase.rpc('match_verses', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) {
      console.error('Vector search error:', error);
      return [];
    }

    const results: VectorSearchResult[] = data || [];

    const verseIds = results.map((v) => v.id).filter(Boolean);
    if (verseIds.length > 0) {
      try {
        const { data: translits } = await supabase
          .from('verses')
          .select('id, transliteration')
          .in('id', verseIds);

        if (translits && translits.length > 0) {
          const transMap = new Map(translits.map((t: { id: number; transliteration: string }) => [t.id, t.transliteration]));
          results.forEach((v) => {
            v.transliteration = transMap.get(v.id) || '';
          });
        }
      } catch {
        // Silently continue without transliteration if lookup fails
      }
    }

    return results;
  } catch (err) {
    console.error('Vector search error:', err);
    return [];
  }
}

export interface DuaSearchResult {
  id: number;
  dua_id: number;
  grup: string;
  nama: string;
  arabic_text: string;
  transliteration?: string;
  translation: string;
  tentang?: string;
  similarity: number;
}

export async function searchDuas(
  queryEmbedding: number[],
  matchThreshold: number = 0.50,
  matchCount: number = 3
): Promise<DuaSearchResult[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase.rpc('match_duas', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) {
      console.warn('Vector search duas error:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Vector search duas error:', err);
    return [];
  }
}

