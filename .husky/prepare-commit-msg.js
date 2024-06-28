const fs = require("fs");
const { execSync } = require("child_process");

const ticketNumberRegex = /LF-\d+/;
const commitMessageFilePath = process.argv[2];

try {
  const branchName = execSync("git rev-parse --abbrev-ref HEAD").toString();
  const match = branchName.match(ticketNumberRegex);
  if (match) {
    const commitMessage = fs.readFileSync(commitMessageFilePath, "utf8");
    appendTicketNumber(commitMessage, match[0]);
  } else {
    console.warn(
      "JIRA ticket number not found in branch name. Proceeding without modification."
    );
  }
} catch (error) {
  console.error("Error processing commit message:", error);
}

function appendTicketNumber(commitMessage, ticketNumber) {
  if (!commitMessage.match(ticketNumberRegex)) {
    fs.writeFileSync(commitMessageFilePath, ticketNumber + " " + commitMessage);
  } else {
    console.log(
      "Commit message already contains a JIRA ticket number. Proceeding without modification."
    );
  }
}
