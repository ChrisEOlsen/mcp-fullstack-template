// frontend/src/pages/api/todo_lists/index.js
import { signedFetch } from "@/lib/signedFetch";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

async function handleGet(req, res) {
  try {
    const backendResponse = await signedFetch("/todo_lists/", req);
    const data = await backendResponse.json();
    if (!backendResponse.ok) {
      return res.status(backendResponse.status).json({ error: data.detail || 'Failed to fetch todo_lists' });
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching todo_lists:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handlePost(req, res) {
  try {
    const backendResponse = await signedFetch("/todo_lists/", req, {
      method: 'POST',
      body: JSON.stringify(req.body),
    });
    const data = await backendResponse.json();
    if (!backendResponse.ok) {
      return res.status(backendResponse.status).json({ error: data.detail || 'Failed to create todo_list' });
    }
    return res.status(201).json(data);
  } catch (err) {
    console.error("Error creating todo_list:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}