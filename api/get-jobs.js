module.exports = async function handler(req, res) {
  const response = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/jobs?verified=eq.true&order=created_at.desc`,
    {
      headers: {
        apikey: process.env.SUPABASE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_KEY}`
      }
    }
  );

  const jobs = await response.json();
  res.status(200).json(jobs);
};
