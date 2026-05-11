export const authRequest = async (username, password, action) => {
  const response = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, action }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Ceva nu a mers bine");
  return data;
};
