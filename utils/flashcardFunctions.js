export const getFlashcards = async (user) => {
  // Trimitem user-ul ca parametru în URL
  const response = await fetch(`/api/flashcards?user=${user}`);
  if (!response.ok) return null;
  return response.json();
};

export const createFlashcards = async (topic, user) => {
  const response = await fetch("/api/flashcards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, user }),
  });
  if (!response.ok) return null;
  return response.json();
};
