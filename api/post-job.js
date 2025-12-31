import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { title, description, email } = req.body;

  if (!title || !description || !email) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const token = uuidv4();
  const verifyLink = `${process.env.BASE_URL}/api/verify?token=${token}`;

  try {
    // --- Insert job into Supabase ---
    const supaRes = await fetch(`${process.env.SUPABASE_URL}/rest/v1/jobs`, {
      method: "POST",
      headers: {
        "apikey": process.env.SUPABASE_KEY,
        "Authorization": `Bearer ${process.env.SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        title,
        description,
        email,
        token,
        verified: false
      })
    });

    if (!supaRes.ok) {
      const text = await supaRes.text();
      console.error("Supabase error:", text);
      throw new Error("Failed to save job");
    }

    // --- Send verification email ---
    await resend.emails.send({
      from: "jobs@resend.dev",   // use your verified email in Resend
      to: email,
      subject: "Verify your job posting",
      html: `
        <p>Please verify your job post:</p>
        <a href="${verifyLink}">Verify Job</a>
      `
    });

    res.status(200).json({ ok: true });

  } catch (err) {
    console.error("Error sending email or saving job:", err);
    res.status(500).json({ error: "Failed to submit job. Try again." });
  }
}
