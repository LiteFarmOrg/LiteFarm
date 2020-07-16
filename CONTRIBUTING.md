## Contributing

Thank you for considering contributing to LiteFarm.

### Where do I go from here?

If you have noticed a bug in the application or have a feature request, please create an issue on [github](https://github.com/juice-tn/litefarm/issues/new). 

### Fork & create a branch

If this is something you think you can fix, then you can fork the repo and create
a branch with a descriptive name. The branch should be based off of the develop branch.

A good branch name would be:

```sh
git checkout -b 12-add-portuguese-translations
```

(where issue #12 is the ticket you're working on)

### Get the app running

Instructions for getting the app running on your local machine can be found in the [README](https://github.com/juice-tn/LiteFarm/blob/master/README.md).

### Implement your fix or feature and view your changes

Please view the updates in your browser to confirm your changes.

### Confirm that all tests and linters pass

Before making a pull request, all test suites and linters for the client-facing web application and the backend API should pass. Instructions for running the tests can be found in the [README](https://github.com/juice-tn/LiteFarm/blob/master/README.md).

### Make a Pull Request

We are currently following the [gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) workflow. Once you have confirmed your changes in the browser and checked that all
tests are passing, a pull request can be made to the develop branch. The app will will also run through a CI pipeline which runs all tests and linters once
a pull request is made.
