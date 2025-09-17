import { GoogleGenAI, Chat, GenerateContentResponse, Tool, Type } from "@google/genai";
import { languageMap } from "../utils/translations";

let ai: GoogleGenAI | undefined;

// This function initializes the AI client on-demand and includes the critical API key check.
// It ensures the app can load even if the key is missing, and the error can be caught by the UI.
const getAiClient = (): GoogleGenAI => {
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
    throw new Error("API_KEY environment variable not set. Please configure it to use the application.");
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};


const findJobsTool: Tool = {
  functionDeclarations: [
    {
      name: 'findJobs',
      description: 'Searches for job listings based on a query, location, and job type.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          query: {
            type: Type.STRING,
            description: 'The job title, skill, or keyword to search for. E.g., "React developer", "project manager".',
          },
          location: {
            type: Type.STRING,
            description: 'The city or region to search for jobs in. E.g., "Cape Town", "Johannesburg".',
          },
          job_type: {
            type: Type.STRING,
            description: 'The type of employment. E.g., "full-time", "part-time", "contract".',
          },
        },
        required: ['query', 'location'],
      },
    },
  ],
};

const getSystemInstruction = (languageName: string) => `You are an AI assistant that provides career guidance and mental health support to unemployed users. Your goal is to help users find suitable job opportunities, suggest skill-building resources, and provide empathetic mental health support.

You MUST respond exclusively in ${languageName}.

Instructions:
1. Start the conversation by welcoming the user and asking about their situation in a warm, empathetic way.
2. Pay attention to the user's emotional state from their language. Adjust your tone to be more empathetic if they seem stressed or demotivated.
3. Ask about their skills, experience, and job preferences to tailor your advice.
4. When a user asks for job opportunities, **use the \`findJobs\` tool**. Proactively ask for key details if they are missing before using the tool. You MUST have a **query** (like a job title) and a **location** to use the tool.
5. After using the \`findJobs\` tool and receiving the results, present the jobs to the user in a clear, easy-to-read markdown list. For each job, include the **Title**, **Company**, **Location**, and a **URL to apply**. Do not just output the raw JSON.
6. **To make the conversation easier, sometimes offer a few clear choices as quick replies.** Format them like this: \`[Option 1] [Another Option] [A Third Choice]\`. Present these at the end of your message where appropriate (e.g., when asking about job types).
7. Suggest specific online courses or training programs to improve their employability.
8. Provide empathetic support for stress, anxiety, or discouragement related to unemployment. If a user is feeling down, suggest simple, actionable stress-relief exercises (like deep breathing).
9. If a user seems to be struggling, you can suggest they connect with others by saying something like: "Connecting with others in a similar situation can be really helpful. You might find supportive communities on platforms like LinkedIn or local job seeker groups."
10. Maintain a supportive, motivating, and compassionate tone throughout the conversation.
11. **Crucially, you are not a licensed therapist.** If the user expresses severe distress, gently and clearly include a reminder to consult professional mental health services. For example: "It sounds like you're going through a lot right now. I'm here to support you with career advice, but for deep emotional and mental health support, I strongly encourage you to connect with a qualified therapist or counselor."
12. When a user uploads their CV/resume, analyze it thoroughly. Provide constructive feedback on its structure, clarity, and content. Highlight its strengths and suggest specific improvements to make it more impactful for recruiters. Summarize the key skills and experiences you've identified from it.`;

export function createChatSession(language: string): Chat {
  const aiClient = getAiClient();
  const languageName = languageMap[language] || 'English';
  const chat = aiClient.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: getSystemInstruction(languageName),
      tools: [findJobsTool],
    },
  });
  return chat;
}

export async function transcribeAudio(base64Audio: string, mimeType: string): Promise<string> {
  const aiClient = getAiClient();
  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: "Transcribe this audio recording of a user's request." },
          {
            inlineData: {
              mimeType,
              data: base64Audio,
            },
          },
        ],
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error("Failed to transcribe audio.");
  }
}

export async function analyzeCvImage(
  base64Image: string,
  mimeType: string
): Promise<GenerateContentResponse> {
  const aiClient = getAiClient();
  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: "Analyze the attached CV/resume image. Provide a summary of the user's skills and experience, highlight strengths, and suggest specific, actionable improvements for the resume's format and content." },
          {
            inlineData: {
              mimeType,
              data: base64Image,
            },
          },
        ],
      },
    });
    return response;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze image.");
  }
}
