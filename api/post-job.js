//import { Resend } from "resend";
//import { v4 as uuidv4 } from "uuid";
const { Resend } = require("resend");
const { v4: uuidv4 } = require("uuid");


const resend = new Resend(process.env.RESEND_API_KEY);

//export default async function handler(req, res) {
module.exports = async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { title, description, email } = req.body;
  const token = uuidv4();

  await fetch(process.env.SUPABASE_URL + "/rest/v1/jobs", {
    method: "POST",
    headers: {
      "apikey": process.env.SUPABASE_KEY,
      "Authorization": `Bearer ${process.env.SUPABASE_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title,
      description,
      email,
      token,
      verified: false
    })
  });

  const verifyLink = `${process.env.BASE_URL}/api/verify?token=${token}`;

  await resend.emails.send({
    from: "jobs@resend.dev",
    to: email,
    subject: "Verify your job posting",
    html: `
      <p>Please verify your job post:</p>
      <a href="${verifyLink}">Verify Job</a>
    `
  });

  res.status(200).json({ ok: true });
}

