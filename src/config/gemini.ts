export const GEMINI_CONFIG = {
    project_name: "My First Project",
    project_id: "project-6a85c027-4b4b-4f41-8e8",
    project_number: "595789616093",
    api_endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent",
    model_version: "gemini-2.5-pro",
    max_output_tokens: 8192,
    temperature: 0.7,
    top_p: 0.95,
    top_k: 40,
};

export const API_HEADERS = {
    "Content-Type": "application/json",
    "x-goog-user-project": GEMINI_CONFIG.project_number,
};
