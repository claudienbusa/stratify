import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = (body.text || "").trim();
    const platforms: string[] = body.platforms || ["linkedin", "twitter"];
    const brandVoice = (body.brandVoice || "").trim();

    if (text.length < 50) {
      return NextResponse.json({ error: "TEXT_TOO_SHORT" }, { status: 400 });
    }

    const voiceInstruction = brandVoice
      ? `\n\nBrand Voice to strictly follow: ${brandVoice}\nAdapt tone, vocabulary, and style accordingly while keeping the core message.`
      : "";

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `You are Stratify, an elite social media strategist and copywriter.

Transform the source content into high-performing posts for the requested platforms only: ${platforms.join(", ")}.${voiceInstruction}

Rules:
- Write in the SAME LANGUAGE as the source content
- Each post must be ready to publish (no placeholders)
- Strong hook in the first line
- Clear value, concrete language, no generic fluff
- Natural CTA when relevant
- Respect platform style and length

Platform guidelines:
- linkedin: professional, storytelling or insight, 1200-1800 chars max, short paragraphs, optional 3-5 hashtags
- twitter: punchy thread of 3-6 tweets OR one strong post under 280 chars; number tweets if thread
- instagram: scroll-stopping first line, emotional or visual language, line breaks, 5-10 hashtags at the end
- tiktok: spoken-style script with hook (0-3s), body, CTA; short sentences

Respond ONLY with valid JSON, for example:
{
  "linkedin": { "post": "..." },
  "twitter": { "thread": ["tweet1", "tweet2"] },
  "instagram": { "caption": "..." },
  "tiktok": { "script": "..." }
}
Only include keys for: ${platforms.join(", ")}.`,
        },
        {
          role: "user",
          content: `Source content:\n\n${text}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const results = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    return NextResponse.json({ success: true, results });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
