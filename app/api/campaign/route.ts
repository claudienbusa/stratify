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
    const objective = body.objective || "engagement";
    const brandVoice = (body.brandVoice || "").trim();
    const lang = body.lang || "fr";
    const languageName = LANG_NAMES[lang] || "French";

    if (text.length < 50) {
      return NextResponse.json({ error: "TEXT_TOO_SHORT" }, { status: 400 });
    }

    const goals: Record<string, string> = {
      engagement: "maximize likes, comments and shares",
      authority: "build expertise, credibility and thought leadership",
      conversion: "drive clicks, leads or sales",
    };

    const voice = brandVoice
      ? `\nBrand voice to follow strictly: "${brandVoice}".`
      : "";

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `You are Stratify, an expert content strategist.
Create a complete 7-day social media campaign from one source content.
Main goal: ${goals[objective] || goals.engagement}${voice}

IMPORTANT: Write the entire campaign (title, strategy, all posts) in ${languageName}.

Respond ONLY with valid JSON in this exact shape:
{
  "campaignTitle": "string",
  "strategy": "1-2 sentence strategy summary",
  "days": [
    {
      "day": 1,
      "theme": "Teaser",
      "platform": "linkedin",
      "post": "full ready-to-publish post",
      "goal": "why this post exists",
      "bestTime": "Tue 9am"
    }
  ]
}

Rules:
- Exactly 7 days
- Day 1: Teaser
- Days 2-3: Value
- Day 4: Social proof or story
- Day 5: Deep dive / education
- Day 6: Question or engagement
- Day 7: Clear CTA
- Alternate platforms: linkedin, twitter, instagram, tiktok
- Every "post" must be ready to publish
- Write everything in ${languageName}`,
        },
        { role: "user", content: "Source content:\n\n" + text },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const campaign = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json({ success: true, campaign });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
