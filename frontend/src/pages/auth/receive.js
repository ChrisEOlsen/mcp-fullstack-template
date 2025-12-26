import { jwtVerify } from "jose";
import { serialize } from "cookie";

export async function getServerSideProps(context) {
  const { query, res } = context;
  const token = query.token;

  if (!token) {
    return {
      redirect: {
        destination: "/login?error=missing_token",
        permanent: false,
      },
    };
  }

  // 1) Verify & decode the JWT
  let payload;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload: decoded } = await jwtVerify(token, secret);
    payload = decoded;
  } catch (err) {
    console.error("❌ Invalid JWT on /auth/receive:", err);
    return {
      redirect: {
        destination: "/login?error=invalid_token",
        permanent: false,
      },
    };
  }

  // 2) Store the token in a secure, HTTP‐only cookie
  const cookie = serialize("jwt", token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60, // 1 hour
  });
  res.setHeader("Set-Cookie", cookie);

  // 3) Decide where to send the user next
  if (payload.isAdmin) {
    return {
      redirect: {
        destination: "/admin/dashboard",
        permanent: false,
      },
    };
  } else {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
}

export default function ReceivePage() {
  // This component never renders, because getServerSideProps always redirects.
  return null;
}