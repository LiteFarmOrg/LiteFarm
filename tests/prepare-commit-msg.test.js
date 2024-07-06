import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";

const makeCommit = (commitMsg) => {
  execSync(`git commit --allow-empty --no-verify -m "${commitMsg}"`);
  return execSync("git log -1 --pretty=%B").toString().trim();
};

describe("prepare-commit-msg - adding JIRA ticket number to commit messages", () => {
  const ticketNumber = "LF-1212";
  const currentBranchName = execSync("git rev-parse --abbrev-ref HEAD")
    .toString()
    .trim();
  const testBranchName = `${ticketNumber}-dummy-branch`;

  let stashed = false;

  before(() => {
    // Check if there are uncommitted changes in current branch
    if (execSync("git status --porcelain").toString().trim().length > 0) {
      execSync("git stash push -u");
      stashed = true;
    }

    // Create test branch
    execSync(`git checkout -b ${testBranchName}`);
  });

  // Checkout original branch and delete test branch; pop stash if necessary
  after(() => {
    execSync(`git checkout ${currentBranchName}`);
    execSync(`git branch -D ${testBranchName}`);
    if (stashed) {
      execSync("git stash pop");
      stashed = false;
    }
  });

  test("should automatically add ticket number when missing", () => {
    const modifiedCommitMsg = makeCommit("random commit message");
    assert(modifiedCommitMsg.startsWith(ticketNumber));
  });

  test("should not modify commit message if it already contains ticket number", () => {
    const testCommit = (msg) => {
      const latestCommitMsg = makeCommit(msg);
      assert.equal(latestCommitMsg, msg);
    };
    testCommit(`${ticketNumber} starting with ticket number`);
    testCommit(`with ${ticketNumber} ticket number inside`);
    testCommit(`with ticket number at end ${ticketNumber}`);
  });

  test("should not modify commit message if branch name does not contain ticket number", () => {
    // Rename the branch to one that does not contain a ticket number
    execSync('git branch -m "dummy-branch"');
    const latestCommitMsg = makeCommit("test commit");
    assert.equal(latestCommitMsg, "test commit");

    // Rename the branch back to the test branch name
    execSync(`git branch -m ${testBranchName}`);
  });
});
