import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = (body.text || "").trim();
    const tone = body.tone || "plus percutant";

    if (text.length < 20) {
      return NextResponse.json({ error: "TEXT_TOO_SHORT" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `You are Stratify. Rewrite the given social media post.
Tone requested: ${tone}.
Keep the same language.
Return ONLY the rewritten post, nothing else.`,
        },
        { role: "user", content: text },
      ],
      temperature: 0.8,
    });

    const rewritten = completion.choices[0].message.content || "";
    return NextResponse.json({ success: true, rewritten });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
