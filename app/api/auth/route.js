import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export async function POST(request) {
  try {
    const { username, password, action } = await request.json();
    const usersCollection = await getCollection("users");

    if (action === "register") {
      const existingUser = await usersCollection.findOne({ username });
      if (existingUser) {
        return NextResponse.json(
          { error: "Utilizatorul există deja!" },
          { status: 400 },
        );
      }
      // user creation
      await usersCollection.insertOne({ username, password });
      return NextResponse.json(
        { message: "Cont creat cu succes!" },
        { status: 201 },
      );
    }

    if (action === "login") {
      const user = await usersCollection.findOne({ username, password });
      if (!user) {
        return NextResponse.json(
          { error: "Nume sau parolă incorectă!" },
          { status: 401 },
        );
      }
      return NextResponse.json({ username: user.username }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Eroare de server" }, { status: 500 });
  }
}
