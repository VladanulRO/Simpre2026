import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import openai from "@/lib/openai";

// Metoda GET
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get("user");

  const records = await getCollection("flashcards");

  // checking for user
  const query = user ? { user: user } : {};

  const all = await records.find(query).sort({ createdAt: -1 }).toArray();
  return NextResponse.json(all);
}

// Metoda POST
export async function POST(request) {
  try {
    const body = await request.json();

    const { topic, user } = body;

    // asking openai
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Ești un asistent util care generează flashcards de studiu. Răspunde DOAR cu un JSON array format din 5 obiecte. Fiecare obiect trebuie să aibă proprietățile 'intrebare' și 'raspuns'.",
        },
        { role: "user", content: `Subiect: ${topic}` },
      ],
      temperature: 0.7,
    });

    const flashcardsFromAI = JSON.parse(completion.choices[0].message.content);

    // saving in mongodb
    const records = await getCollection("flashcards");

    //
    const newEntry = {
      topic,
      user,
      cards: flashcardsFromAI,
      createdAt: new Date(),
    };

    const { insertedId } = await records.insertOne(newEntry);

    return NextResponse.json({ _id: insertedId, ...newEntry }, { status: 201 });
  } catch (error) {
    console.error("Eroare OpenAI/Mongo:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la generarea sau salvarea cardurilor." },
      { status: 500 },
    );
  }
}
