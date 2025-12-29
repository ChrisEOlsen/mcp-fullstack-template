// frontend/src/pages/api/todo_items/index.js
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
    const backendResponse = await signedFetch("/todo_items/", req);
    const data = await backendResponse.json();
    if (!backendResponse.ok) {
      return res.status(backendResponse.status).json({ error: data.detail || 'Failed to fetch todo_items' });
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching todo_items:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handlePost(req, res) {
  try {
    const backendResponse = await signedFetch("/todo_items/", req, {
      method: 'POST',
      body: JSON.stringify(req.body),
    });
    const data = await backendResponse.json();
    if (!backendResponse.ok) {
      return res.status(backendResponse.status).json({ error: data.detail || 'Failed to create todo_item' });
    }
    return res.status(201).json(data);
  } catch (err) {
    console.error("Error creating todo_item:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}