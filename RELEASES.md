# Source Control and the Release Process

We follow the [git flow](http://nvie.com/posts/a-successful-git-branching-model) process which has several special branches:

-   **`master`** - Contains the release commits - builds publish a release of the [app](https://app.litefarm.org)
-   **`develop`** - Contains the work in progress, code in here must be of release quality or close to release quality- builds publish the App to [CD server](litefarm-webapp-integration.heroku.com)
-   **`release/v{major}.{minor}.{patch}`** - For preparing a release
-   **`hotfix/{major}.{minor}.X`** - For releasing a patch
-   **`other-branches`** - Branches for development work

### Working on a Story / Task / Bug

-   Branch from **`develop`**
-   As you work on your branch regularly update (merge or rebase) from **`develop`** - `git pull --rebase origin develop`
-   When you are satisfied that your branch is in a state ready for others to review create a pull request to **`develop`**
-   When the build succeeds **Merge** this commit to **`develop`**.

### Creating a Release

A release is typically an increment of the minor or major version, name the branch for the version number the release will be given.

-   Branch from **`develop`**, name your branch with the following the convention: `release/v{major}.{minor}.0`
-   update the version in the `package.json` files in `webapp` and `api`
-   Title your commit with just the version number of the release (eg `v1.0.0`).
-   Create a pull request for the branch against **`master`**
-   Pull request against **`master`**
-   Perform any additional non-automated testing.
-   If necessary, fix any issues found and push the changes to the release branch
-   Once a release candidate of adequate quality has been produced merge the release branch into **`master`** (do not delete the branch)
-   The **`master`** build will now publish a release if CI/CD in gitlab passes.
-   Create a pull request for the branch against **`develop`**
-   Merge the release branch into **`develop`** (now you can delete the branch)
-   Manually create a release tag (eg `v1.0.0`) on master

### Creating a Hot Fix

A hot fix is created when production needs to be updated for an urgent bug fix but develop is not ready to release to master yet.

-   Branch from **`master`**, name your branch with the following the convention: `hotfix/whatever-the-fix-is`
-   Fix the issue.
-   Create a pull request from the hotfix branch, into **`master`**
-   Merge the hotfix branch into **`master`** (do not delete the branch yet)
-   Create a pull request from the hotfix branch, into **`develop`**
-   Merge the hotfix branch into **`develop`** (now you can delete the branch)

