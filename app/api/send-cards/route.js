import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

export async function POST(request) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  const toEmail = process.env.SENDGRID_TO_EMAIL;

  if (!apiKey || !fromEmail) {
    return NextResponse.json(
      { error: "Configurare SendGrid lipsă." },
      { status: 500 },
    );
  }

  const { topic, cards } = await request.json();

  sgMail.setApiKey(apiKey);

  const emailContent = cards
    .map((c) => `Întrebare: ${c.intrebare}\nRăspuns: ${c.raspuns}\n`)
    .join("\n---\n");

  const msg = {
    to: toEmail,
    from: fromEmail,
    subject: `Set Flashcards: ${topic}`,
    text: `Iată cardurile tale pentru subiectul: ${topic}\n\n${emailContent}`,
  };

  try {
    await sgMail.send(msg);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Nu s-a putut trimite mail-ul." },
      { status: 500 },
    );
  }
}
