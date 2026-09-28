import client from "../api/client";

export async function fetchCompetition(id) {
  const res = await client.get(`/api/competitions/${id}`);
  return res.data;
}

export async function registerForCompetition(id, referralCode) {
  const res = await client.post(`/api/competitions/${id}/register`, {
    referralCode,
  });
  return res.data;
}

export async function submitEntry(id, content) {
  const res = await client.post(`/api/competitions/${id}/submissions`, {
    content,
  });
  return res.data;
}
