import { OCRResult } from '@/types';

// ✅ Correct: This model name is valid as of Dec 2025
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

function cleanBase64(data: string): string {
    if (data.includes(',')) {
        return data.split(',')[1] || data;
    }
    return data;
}

const SYSTEM_PROMPT = `Analyze the business card image and extract contact details into this simple JSON structure:
{
  "contact_name": "string or null",
  "designation": "string or null",
  "company_name": "string or null",
  "description": "string or null",
  "phones": ["string"],
  "emails": ["string"],
  "website": "string or null",
  "address": "string or null",
  "industry_guess": "string or null"
}

Rules:
- Extract all visible phone numbers and emails.
- Predict industry from: [Manufacturing, IT, Trading, Healthcare, Retail, Real Estate, Legal, Other].
- Return ONLY the JSON object. No Markdown formatting, no code blocks.`;

export async function processBusinessCard(
    imageBase64: string,
    mimeType: string = 'image/jpeg'
): Promise<OCRResult> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: SYSTEM_PROMPT },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            // ✅ FIXED: Actually call the cleaner function
                            data: cleanBase64(imageBase64),
                        },
                    },
                ],
            },
        ],
        generationConfig: {
            // ✅ CHANGED: Gemini 3 prefers default temp (1.0). Do not use 0.1.
            temperature: 1.0,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
            // ✅ ADDED: Optimize for speed. OCR doesn't need "High" reasoning.
            thinkingConfig: {
                thinkingLevel: "low"
            }
        },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
        throw new Error('No content in Gemini response');
    }

    try {
        let cleanText = textContent.trim();
        if (cleanText.startsWith('```json')) {
            cleanText = cleanText.replace(/^```json/i, '').replace(/```$/, '');
        } else if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```/i, '').replace(/```$/, '');
        }

        const result: OCRResult = JSON.parse(cleanText);

        return {
            contact_name: result.contact_name || null,
            designation: result.designation || null,
            company_name: result.company_name || null,
            description: result.description || null,
            phones: Array.isArray(result.phones) ? result.phones : [],
            emails: Array.isArray(result.emails) ? result.emails : [],
            website: result.website || null,
            address: result.address || null,
            industry_guess: result.industry_guess || null,
        };
    } catch (parseError) {
        console.error('Failed to parse Gemini response:', textContent);
        throw new Error('Failed to parse OCR result');
    }
}

export async function processMultipleCards(
    frontImageBase64: string,
    backImageBase64?: string,
    mimeType: string = 'image/jpeg'
): Promise<OCRResult> {
    // ✅ FIXED: Run both requests in parallel using Promise.all
    if (!backImageBase64) {
        return processBusinessCard(frontImageBase64, mimeType);
    }

    const [frontResult, backResult] = await Promise.all([
        processBusinessCard(frontImageBase64, mimeType),
        processBusinessCard(backImageBase64, mimeType)
    ]);

    return {
        contact_name: frontResult.contact_name || backResult.contact_name,
        designation: frontResult.designation || backResult.designation,
        company_name: frontResult.company_name || backResult.company_name,
        description: frontResult.description || backResult.description,
        phones: Array.from(new Set([...frontResult.phones, ...backResult.phones])),
        emails: Array.from(new Set([...frontResult.emails, ...backResult.emails])),
        website: frontResult.website || backResult.website,
        address: frontResult.address || backResult.address,
        industry_guess: frontResult.industry_guess || backResult.industry_guess,
    };
}