export default async function handler(req, res) {
  const { token } = req.query;

  const response = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/jobs?token=eq.${token}`,
    {
      headers: {
        "apikey": process.env.SUPABASE_KEY,
        "Authorization": `Bearer ${process.env.SUPABASE_KEY}`
      }
    }
  );

  const jobs = await response.json();
  if (!jobs.length) {
    return res.send("Invalid verification link");
  }

  await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/jobs?token=eq.${token}`,
    {
      method: "PATCH",
      headers: {
        "apikey": process.env.SUPABASE_KEY,
        "Authorization": `Bearer ${process.env.SUPABASE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ verified: true })
    }
  );

  res.send("<h2>Job verified successfully</h2>");
}
