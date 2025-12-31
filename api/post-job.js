import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { title, description, email } = req.body;

  if (!title || !description || !email) {
    return res.status(400).json({ error: "Missing required fields" });
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
      return res.status(500).json({ error: "Failed to save job in database" });
    }

    // --- Send verification email ---
    try {
      const emailResult = await resend.emails.send({
        from: "jobs@resend.dev", // MUST be verified in your Resend account
        to: email,
        subject: "Verify your job posting",
        html: `
          <p>Hello,</p>
          <p>Please verify your job post by clicking the link below:</p>
          <a href="${verifyLink}">Verify Job</a>
          <p>If you did not submit this, ignore this email.</p>
        `
      });

      console.log("Resend email sent:", emailResult);

    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr);
      return res.status(500).json({ error: "Failed to send verification email" });
    }

    res.status(200).json({ ok: true });

  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
