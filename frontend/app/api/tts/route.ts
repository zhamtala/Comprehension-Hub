import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text") || "Hello there!";
  const encoded = encodeURIComponent(text);
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=en&client=tw-ob`;

  try {
    const response = await fetch(ttsUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const arrayBuffer = await response.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (err) {
    console.error("TTS fetch failed:", err);
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }
}
