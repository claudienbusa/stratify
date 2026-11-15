import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = (body.text || "").trim();
    const platforms = body.platforms || ["linkedin", "twitter"];
    if (text.length < 50) {
      return NextResponse.json({ error: "TEXT_TOO_SHORT" }, { status: 400 });
    }
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: "Return ONLY valid JSON with social posts for: " + platforms.join(", "),
        },
        { role: "user", content: text },
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
