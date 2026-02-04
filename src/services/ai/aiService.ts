export interface AIRequest {
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
}

export class AIService {
    private static ENDPOINT = 'http://127.0.0.1:8080/completion';

    static async generate(req: AIRequest): Promise<string> {
        // Construct Llama.cpp prompt format (ChatML style often works best, or raw)
        // Adjust based on typical qwen formatting if known, otherwise standard system/user
        const prompt = `<|im_start|>system\n${req.systemPrompt}<|im_end|>\n<|im_start|>user\n${req.userPrompt}<|im_end|>\n<|im_start|>assistant\n`;

        try {
            const response = await fetch(this.ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt,
                    n_predict: 512,
                    temperature: req.temperature || 0.2,
                    stop: ["<|im_end|>"] // Stop token for chat models
                })
            });

            if (!response.ok) {
                throw new Error(`AI Server Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.content; // llama.cpp server usually returns { content: "..." }
        } catch (error) {
            console.error('AI Service Failed:', error);
            throw error;
        }
    }
}
