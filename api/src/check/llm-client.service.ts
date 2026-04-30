import { Injectable } from '@nestjs/common';

type LlmChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

@Injectable()
export class LlmClientService {
  async chatJson(args: { baseUrl: string; model: string; messages: LlmChatMessage[] }) {
    const url = new URL('/chat/completions', args.baseUrl).toString();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: args.model,
        temperature: 0.2,
        messages: args.messages,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`LM Studio error: ${res.status} ${text}`.trim());
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      model?: string;
      usage?: unknown;
    };

    const content = json?.choices?.[0]?.message?.content ?? '';
    return {
      content,
      model: json.model ?? args.model,
      usage: json.usage ?? null,
    };
  }

  async health(baseUrl: string) {
    const url = new URL('/models', baseUrl).toString();
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return { ok: false };
    const json = await res.json().catch(() => null);
    return { ok: true, models: json };
  }
}

