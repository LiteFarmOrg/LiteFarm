import { test, describe, mock } from "node:test";
import assert from "node:assert/strict";
import { processCommitMsg, git } from "../.husky/commit-msg.js";

const setupMocks = ({ commitMsg, branchName }) => {
  mock.method(git, "getCurrentBranchName", () => branchName);
  mock.method(git, "readCommitMsg", () => commitMsg);
  return mock.method(git, "writeCommitMsg", () => {});
};

describe("prepare-commit-msg - adding JIRA ticket number to commit messages", () => {
  test("should automatically add ticket number when missing", () => {
    const mockWriteCommitMsg = setupMocks({
      branchName: `LF-1212-test-branch`,
      commitMsg: "test commit",
    });

    processCommitMsg();

    // function to modifiy commit msg should be called called once
    assert.equal(mockWriteCommitMsg.mock.callCount(), 1);

    // function to modifiy commit msg should be called with modified commit message
    assert.equal(
      mockWriteCommitMsg.mock.calls[0].arguments[0],
      "LF-1212 test commit"
    );
  });

  test("should filter out comments starting with #", () => {
    const mockWriteCommitMsg = setupMocks({
      branchName: `LF-1212-test-branch`,
      commitMsg: `test commit
           # Please enter the commit message for your changes. Lines starting
           # with '#' will be ignored, and an empty message aborts the commit.
           #
           # On branch LF-1212-test-branch
           #
        `,
    });

    processCommitMsg();

    assert.equal(mockWriteCommitMsg.mock.callCount(), 1);
    assert.equal(
      mockWriteCommitMsg.mock.calls[0].arguments[0],
      "LF-1212 test commit"
    );
  });

  test("should not modify commit message if it is empty", (t) => {
    const mockWriteCommitMsg = setupMocks({
      branchName: `LF-1212-test-branch`,
      commitMsg: "",
    });

    processCommitMsg();

    assert.equal(mockWriteCommitMsg.mock.callCount(), 0);
  });

  test("should not modify commit message if it already has ticket number in front", (t) => {
    const mockWriteCommitMsg = setupMocks({
      branchName: `LF-1212-test-branch`,
      commitMsg: "LF-1212 test commit",
    });

    processCommitMsg();

    assert.equal(mockWriteCommitMsg.mock.callCount(), 0);
  });

  test("should not modify commit message if it already has ticket number inside", () => {
    const mockWriteCommitMsg = setupMocks({
      branchName: `LF-1212-test-branch`,
      commitMsg: "test LF-1212 commit",
    });

    processCommitMsg();

    assert.equal(mockWriteCommitMsg.mock.callCount(), 0);
  });

  test("should not modify commit message if branch name does not contain ticket number", () => {
    const mockWriteCommitMsg = setupMocks({
      branchName: `test-branch`,
      commitMsg: "test commit",
    });

    processCommitMsg();

    assert.equal(mockWriteCommitMsg.mock.callCount(), 0);
  });
});
