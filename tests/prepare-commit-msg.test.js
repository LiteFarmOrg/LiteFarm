import { test, describe, mock } from "node:test";
import assert from "node:assert/strict";
import { prepareCommitMsg, git } from "../.husky/prepare-commit-msg.js";

const setUpMocks = ({ commitMsg, branchName }) => {
  mock.method(git, "getCurrentBranchName", () => branchName);
  mock.method(git, "readCommitMsg", () => commitMsg);
  return mock.method(git, "writeCommitMsg", () => {});
};

describe("prepare-commit-msg - adding JIRA ticket number to commit messages", () => {
  test("should automatically add ticket number when missing", () => {
    const mockWriteCommitMsg = setUpMocks({
      branchName: `LF-1212-test-branch`,
      commitMsg: "test commit",
    });

    prepareCommitMsg();

    // function to modifiy commit msg should be called called once
    assert.equal(mockWriteCommitMsg.mock.callCount(), 1);

    // function to modifiy commit msg should be called called with modified commit message
    assert.equal(
      mockWriteCommitMsg.mock.calls[0].arguments[0],
      "LF-1212 test commit"
    );
  });

  test("should not modify commit message if it already has ticket number in front", (t) => {
    const mockWriteCommitMsg = setUpMocks({
      branchName: `LF-1212-test-branch`,
      commitMsg: "LF-1212 test commit",
    });
    prepareCommitMsg();

    assert.equal(mockWriteCommitMsg.mock.callCount(), 0);
  });

  test("should not modify commit message if it already has ticket number inside", () => {
    const mockWriteCommitMsg = setUpMocks({
      branchName: `LF-1212-test-branch`,
      commitMsg: "test LF-1212 commit",
    });
    prepareCommitMsg();

    assert.equal(mockWriteCommitMsg.mock.callCount(), 0);
  });

  test("should not modify commit message if branch name does not contain ticket number", () => {
    const mockWriteCommitMsg = setUpMocks({
      branchName: `test-branch`,
      commitMsg: "test commit",
    });

    assert.equal(mockWriteCommitMsg.mock.callCount(), 0);
  });
});
