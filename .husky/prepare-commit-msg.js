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

function prepareCommitMsg() {
  try {
    const branchName = git.getCurrentBranchName();
    console.log(branchName);
    const match = branchName.match(ticketNumberRegex);
    if (!match) {
      console.warn(
        "JIRA ticket number not found in branch name. Proceeding without modification."
      );
      process.exit();
    }

    const commitMessage = git.readCommitMsg();

    if (!commitMessage.match(ticketNumberRegex)) {
      git.writeCommitMsg(match[0] + " " + commitMessage);
    } else {
      console.log(
        "Commit message already contains a JIRA ticket number. Proceeding without modification."
      );
    }
  } catch (error) {
    console.error("Error processing commit message:", error);
  }
}

// Call the hook only when this file is executed directly by node.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  prepareCommitMsg();
}

export { git, prepareCommitMsg };
