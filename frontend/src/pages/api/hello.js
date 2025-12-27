import { signedFetch } from "@/lib/signedFetch";

export default async function handler(req, res) {
  try {
    // 1. Forward the request to the FastAPI backend endpoint.
    const backendResponse = await signedFetch(
      "/hello",
      req,
      {
        method: req.method,
        body: req.body ? JSON.stringify(req.body) : undefined,
      }
    );

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Error from backend: ${backendResponse.status} ${errorText}`);
      return res
        .status(backendResponse.status)
        .json({ error: "Failed to fetch data from backend" });
    }

    // 2. Parse the JSON payload and return it to the frontend.
    const payload = await backendResponse.json();
    return res.status(200).json(payload);
  } catch (err) {
    console.error("Error in /api/hello handler:", err);
    return res
      .status(500)
      .json({ error: "Internal Server Error" });
  }
}