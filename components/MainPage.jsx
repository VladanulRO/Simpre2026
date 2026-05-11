"use client";
import { useState, useEffect } from "react";
import { getFlashcards, createFlashcards } from "@/utils/flashcardFunctions";
import { authRequest } from "@/utils/authFunctions";
import Spinner from "./Spinner";
import { sendCardsByEmail } from "@/utils/sendEmailFunction";

const MainPage = () => {
  const [topic, setTopic] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- STATE-URI PENTRU AUTH ---
  const [isRegistering, setIsRegistering] = useState(false); // Switch între Login și Register
  const [user, setUser] = useState(null);
  const [userNameInput, setUserNameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const MASTER_PASSWORD = "cloud"; // <--- Aici setezi parola ta secretă

  const handleAuth = async (e, action) => {
    e.preventDefault();
    try {
      const data = await authRequest(userNameInput, passwordInput, action);
      if (action === "register") {
        alert("Cont creat! Acum te poți loga.");
        setIsRegistering(false);
      } else {
        localStorage.setItem("studyUser", data.username);
        setUser(data.username);
        fetchFlashcards(data.username);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchFlashcards = async (currentUser) => {
    if (!currentUser) return;
    const data = await getFlashcards(currentUser);
    if (data) setFlashcards(data);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("studyUser");
    if (savedUser) {
      setUser(savedUser);
      fetchFlashcards(savedUser);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    // Verificăm parola
    if (passwordInput !== MASTER_PASSWORD) {
      alert("Parolă incorectă!");
      return;
    }
    localStorage.setItem("studyUser", userNameInput);
    setUser(userNameInput);
    fetchFlashcards(userNameInput);
  };

  const handleLogout = () => {
    localStorage.removeItem("studyUser");
    setUser(null);
    setUserNameInput("");
    setPasswordInput("");
    setFlashcards([]);
  };

  const handleSendEmail = async (topic, cards) => {
    const success = await sendCardsByEmail(topic, cards);
    if (success) alert("Mail trimis cu succes!");
    else alert("Eroare la trimitere.");
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Trimitem și user-ul către createFlashcards ca să le salveze sub numele tău
    const newData = await createFlashcards(topic, user);
    if (newData) {
      setFlashcards((prev) => [newData, ...prev]);
      setTopic("");
    } else {
      alert("Eroare la generare!");
    }
    setIsLoading(false);
  };

  // --- ECRAN DE LOGIN ---
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-2xl shadow-xl w-96 border border-blue-100">
          <h1 className="text-3xl font-extrabold text-center mb-2 text-blue-600 tracking-tighter">
            Study AI
          </h1>
          <p className="text-center text-gray-500 mb-8 text-sm italic">
            {isRegistering
              ? "Creează un cont nou"
              : "Loghează-te pentru a studia"}
          </p>

          <form className="space-y-4">
            <input
              type="text"
              placeholder="Nume Utilizator"
              value={userNameInput}
              onChange={(e) => setUserNameInput(e.target.value)}
              className="w-full border p-3 rounded-xl text-black outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="password"
              placeholder="Parolă"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full border p-3 rounded-xl text-black outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            {isRegistering ? (
              <button
                onClick={(e) => handleAuth(e, "register")}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-100"
              >
                Creează Cont
              </button>
            ) : (
              <button
                onClick={(e) => handleAuth(e, "login")}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
              >
                Intră în Aplicație
              </button>
            )}
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-blue-500 text-xs hover:underline uppercase font-bold tracking-widest"
            >
              {isRegistering
                ? "Ai deja cont? Login"
                : "Nu ai cont? Înregistrare"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- INTERFAȚA PRINCIPALĂ ---
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8 bg-blue-50 p-4 rounded-lg">
        <span className="text-blue-800 font-medium tracking-wide">
          Utilizator: <b>{user}</b>
        </span>
        <button
          onClick={handleLogout}
          className="text-red-600 text-sm hover:underline font-bold"
        >
          Ieșire
        </button>
      </div>

      <h1 className="text-4xl font-bold text-center mb-8 text-blue-600 uppercase tracking-tighter">
        AI Study Assistant
      </h1>

      <form onSubmit={handleGenerate} className="mb-12 flex gap-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Introdu un subiect (ex: Revolutia Franceza)"
          className="flex-1 border p-3 rounded-lg shadow-sm text-black outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-bold"
          disabled={isLoading}
        >
          {isLoading ? "Generare..." : "Generează"}
        </button>
      </form>

      {isLoading && <Spinner />}

      <div className="grid gap-6">
        {flashcards.map((entry) => (
          <div
            key={entry._id}
            className="border p-6 rounded-xl shadow-md bg-white"
          >
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-bold text-gray-800">
                Subiect: {entry.topic}
              </h2>
              <button
                onClick={() => handleSendEmail(entry.topic, entry.cards)}
                className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition flex items-center gap-2 text-sm font-medium"
              >
                <span>Trimite pe Mail</span>
                <span>✉️</span>
              </button>
            </div>

            <div className="space-y-4">
              {entry.cards.map((card, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500"
                >
                  <p className="font-semibold text-blue-700 italic text-sm mb-1 uppercase opacity-60">
                    Întrebare:
                  </p>
                  <p className="text-gray-800 mb-3">{card.intrebare}</p>
                  <p className="font-semibold text-green-700 italic text-sm mb-1 uppercase opacity-60">
                    Răspuns:
                  </p>
                  <p className="text-gray-700">{card.raspuns}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {flashcards.length === 0 && !isLoading && (
          <p className="text-center text-gray-400 italic">
            Nu ai încă flashcard-uri salvate.
          </p>
        )}
      </div>
    </div>
  );
};

export default MainPage;
