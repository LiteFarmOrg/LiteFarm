import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ticketNumberRegex = /LF-\d+/;
const commitMessageFilePath = process.argv[2];

const git = {
  getCurrentBranchName: () =>
    execSync("git rev-parse --abbrev-ref HEAD").toString().trim(),
  readCommitMsg: () => fs.readFileSync(commitMessageFilePath, "utf8"),
  writeCommitMsg: (msg) => fs.writeFileSync(commitMessageFilePath, msg),
};

function processCommitMsg() {
  try {
    const branchName = git.getCurrentBranchName();
    const match = branchName.match(ticketNumberRegex);

    // Branch name doesn't contain ticket number
    if (!match) {
      console.warn(
        "JIRA ticket number not found in branch name. Proceeding without modification."
      );
      return;
    }

    const commitMessage = git.readCommitMsg();

    const filteredCommitMessage = commitMessage
      .split("\n")
      .filter((line) => !line.trim().startsWith("#"))
      .join("\n")
      .trim();

    if (filteredCommitMessage === "") return;

    // Check if commit already contains ticket number
    if (filteredCommitMessage.match(ticketNumberRegex)) {
      console.log(
        "Commit message already contains a JIRA ticket number. Proceeding without modification."
      );
      return;
    }

    // Modify commit message
    git.writeCommitMsg(match[0] + " " + filteredCommitMessage);
  } catch (error) {
    console.error("Error processing commit message:", error);
  }
}

// Call the hook only when this file is executed directly by node.
// This is needed to ensure proper execution of tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  processCommitMsg();
}

export { git, processCommitMsg };
