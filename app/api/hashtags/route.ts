import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = (body.text || "").trim();
    const platform = body.platform || "linkedin";

    if (text.length < 20) {
      return NextResponse.json({ error: "TEXT_TOO_SHORT" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `You are Stratify. Generate 6 to 10 relevant, high-quality hashtags for a ${platform} post.
Rules:
- Mix of popular and niche hashtags
- No spaces inside hashtags
- Return ONLY a JSON object with a "hashtags" array.
Example: {"hashtags": ["#Marketing", "#ContentStrategy", "#Freelance"]}`,
        },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    let hashtags: string[] = [];
    try {
      const parsed = JSON.parse(completion.choices[0].message.content || "{}");
      hashtags = parsed.hashtags || [];
      if (!Array.isArray(hashtags)) hashtags = [];
    } catch {
      hashtags = [];
    }

    return NextResponse.json({ success: true, hashtags });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
