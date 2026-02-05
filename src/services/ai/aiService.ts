export interface AIRequest {
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
}

export class AIService {
    private static ENDPOINT = 'http://127.0.0.1:8080/v1/chat/completions';

    static async generate(req: AIRequest): Promise<string> {
        try {
            const response = await fetch(this.ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'qwen2.5-0.5b',
                    messages: [
                        { role: 'system', content: req.systemPrompt },
                        { role: 'user', content: req.userPrompt }
                    ],
                    temperature: req.temperature || 0.7,
                    max_tokens: 1536,
                    response_format: { type: 'json_object' }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`AI Server Error: ${response.statusText} ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            // OpenAI format: data.choices[0].message.content
            return data.choices?.[0]?.message?.content || '';
        } catch (error) {
            console.error('AI Service Failed:', error);
            throw error;
        }
    }
}
