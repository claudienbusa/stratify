import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

const LANG_NAMES: Record<string, string> = {
  fr: "French",
  en: "English",
  es: "Spanish",
  pt: "Portuguese",
  zh: "Chinese",
  hi: "Hindi",
  ar: "Arabic",
  de: "German",
  ja: "Japanese",
  id: "Indonesian",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = (body.text || "").trim();
    const platforms: string[] = body.platforms || ["linkedin", "twitter"];
    const brandVoice = (body.brandVoice || "").trim();
    const lang = body.lang || "fr";
    const languageName = LANG_NAMES[lang] || "French";

    if (text.length < 50) {
      return NextResponse.json({ error: "TEXT_TOO_SHORT" }, { status: 400 });
    }

    const voice = brandVoice
      ? `\n\nBrand voice to follow strictly: "${brandVoice}". Adapt tone, vocabulary and rhythm accordingly.`
      : "";

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `You are Stratify, a world-class social media strategist and copywriter.

Your job is to turn one source content into high-performing, ready-to-publish posts for the requested platforms: ${platforms.join(", ")}.${voice}

IMPORTANT: Write ALL posts in ${languageName}. Even if the source content is in another language, translate and write the final posts in ${languageName}.

Core principles:
- Every post must be ready to copy-paste and publish
- Start with a strong hook
- Deliver clear value
- Use concrete language
- End with a natural call-to-action when relevant
- Include a quality score from 1 to 10 for each post

Platform rules:
- linkedin: professional insight or story, short paragraphs, 800-1600 characters, max 5 hashtags
- twitter: either one sharp post (<280 chars) or a numbered thread of 3-6 tweets
- instagram: scroll-stopping first line, emotional or visual language, line breaks, 5-10 hashtags at the end
- tiktok: spoken script with Hook (0-3s), Body, CTA. Short sentences.

Respond ONLY with valid JSON. Only include the platforms that were requested.
Example shape:
{
  "linkedin": { "post": "...", "score": 8 },
  "twitter": { "thread": ["..."], "score": 7 },
  "instagram": { "caption": "...", "score": 9 },
  "tiktok": { "script": "...", "score": 8 }
}`,
        },
        { role: "user", content: `Source content:\n\n${text}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const results = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json({ success: true, results });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
