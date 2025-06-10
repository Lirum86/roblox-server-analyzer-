import { Octokit } from "@octokit/rest";

const github = new Octokit({ auth: process.env.GITHUB_TOKEN });
const repo = "roblox-server-analyzer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Only POST allowed");

  const { scripts, timestamp } = req.body;

  try {
    for (const script of scripts) {
      const fileName = `${timestamp}_${script.name.replace(/[\/\\]/g, "_")}.lua`;
      const path = `backups/${fileName}`;
      const content = Buffer.from(script.source).toString("base64");

      await github.repos.createOrUpdateFileContents({
        owner: repo.split("/")[0],
        repo: repo.split("/")[1],
        path: path,
        message: `Backup ${script.name}`,
        content,
      });
    }

    res.status(200).json({ status: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
}
