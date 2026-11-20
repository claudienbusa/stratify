import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = (body.text || "").trim();
    const objective = body.objective || "engagement";
    const brandVoice = (body.brandVoice || "").trim();

    if (text.length < 50) {
      return NextResponse.json({ error: "TEXT_TOO_SHORT" }, { status: 400 });
    }

    const goals: Record<string, string> = {
      engagement: "maximize likes, comments and shares",
      authority: "build expertise and credibility",
      conversion: "drive clicks, leads or sales",
    };

    const voiceInstruction = brandVoice
      ? `\nBrand Voice to strictly follow: ${brandVoice}`
      : "";

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `You are Stratify, an expert content strategist.
Create a 7-day social media campaign from one source content.
Goal: ${goals[objective] || goals.engagement}${voiceInstruction}

Respond ONLY with valid JSON:
{
  "campaignTitle": "string",
  "strategy": "short strategy summary",
  "days": [
    {
      "day": 1,
      "theme": "Teaser",
      "platform": "linkedin",
      "post": "full post ready to publish",
      "goal": "why this post",
      "bestTime": "Tue 9am"
    }
  ]
}

Rules:
- Day 1 teaser, 2-3 value, 4 social proof, 5 deep dive, 6 question, 7 CTA
- Alternate platforms: linkedin, twitter, instagram, tiktok
- Every post must be ready to publish
- Exactly 7 days in the array
- Write in the SAME LANGUAGE as the source content`,
        },
        { role: "user", content: "Source content:\n\n" + text },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const campaign = JSON.parse(
      completion.choices[0].message.content || "{}"
    );
    return NextResponse.json({ success: true, campaign });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
