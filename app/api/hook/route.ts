import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = (body.text || "").trim();

    if (text.length < 20) {
      return NextResponse.json({ error: "TEXT_TOO_SHORT" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `You are Stratify. Rewrite ONLY the first sentence (the hook) of the given post to make it more attention-grabbing.
Keep the rest of the post exactly the same.
Return the full post with the improved hook.
Same language.`,
        },
        { role: "user", content: text },
      ],
      temperature: 0.8,
    });

    const improved = completion.choices[0].message.content || text;
    return NextResponse.json({ success: true, improved });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
