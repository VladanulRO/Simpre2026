export const sendCardsByEmail = async (topic, cards) => {
  const response = await fetch("/api/send-cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, cards }),
  });
  return response.ok;
};
