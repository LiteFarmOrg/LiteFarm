# LiteFarm
LiteFarm is the world’s first community-led, not-for-profit, digital platform joining farmers and scientists together for participatory assessment of social, environmental and economic outputs of farming systems. LiteFarm is the first application of its kind specifically tailored to the needs of diversified farmers with built-in pathways to provide expert decision support and help them earn additional income through payment for ecological services (PES) schemes and in-app certifications (such as organic). These approaches serve the multiple purposes of incentivizing adoption of sustainable land use practices through the provision of evidence-based decision support, and significantly increasing the amount of data being collected by diversified farming operations around the globe. It was developed with farmers at the center of the design process and built from the ground up with accessibility and approachability in mind. We are proud of our mission:

_To meet farmers where they are and equip them with the tools they need to make informed and responsible decisions about the health of their farm, their livelihood, their community, and the planet._


LiteFarm version 1.0.0 was released to the public in July 2020. The LiteFarm app is continually being developed, with farmers, researchers, designers and developers working together to create new localized modules and features into the future.  LiteFarm is deployed in Canada, the USA, and Latin America.

If you’re a farmer and would like to join LiteFarm you can sign up today at app.litefarm.org. If you are a researcher or would like to find out more about this project you can contact the [UBC Centre for Sustainable Food Systems](https://ubcfarm.ubc.ca/litefarm/). If your a developer, all the details on how you can contribute to this project are right here, welcome to the team!
# Overview

LiteFarm is comprised of two applications which both reside in this monorepo.

  - packages/webapp: the client-facing application
    - [documentation(in progress)](https://docs.google.com/document/d/1JLWYWdf8fjZMRhKxWoa9__9ul8ZSJk7dzzSSfiT-eVM/edit?usp=sharing)
  - packages/api: the back-end API server
    - [documentation(in progress)](https://docs.google.com/document/d/19eDlagqurB7gf8iLdATjCi7scxs9gUG5bs9YZtMu_0k/edit?usp=sharing)

# Quick Start

 ## Using docker-compose
 1. Install [docker](https://docs.docker.com/desktop/) and [docker-compose](https://docs.docker.com/compose/install/)
 2. Setup the `Litefarm/packages/api/.env` file to include the following configs
    ```
     DEV_DATABASE=pg-litefarm
     DEV_DATABASE_USER=postgres
     DEV_DATABASE_HOST=db
     DEV_DATABASE_PASSWORD=postgres
     TEST_DATABASE=pg-litefarm
     TEST_DATABASE_USER=postgres
     TEST_DATABASE_HOST=test-db
     TEST_DATABASE_PASSWORD=postgres
     JWT_SECRET=somerandomand(better-be)securesecret
    ```
    or you can simply copy `Litefarm/packages/api/.env.sample` into it
    * this is dev or testing data, it can be changed from `LiteFarm/docker-compose.yml`
 3. In the terminal, place the current directory into the root folder `LiteFarm/`
 4. Execute `docker-compose -f docker-compose.dev.yml up`

 *Alternatively and if you're working in a linux or macos system you can call `make up`*
   - This will take some time the first time, on the next attempt it should load way faster.
   - It will setup the local development env by running migrations
   - This will also start the backend, frontend and storybook containers.
 5. After this you should be able to go to the app running on `localhost:3000`
 6. Storybook is also available on `localhost:6006` 
 
## Manual installation

### Setup Environment:
  1. SSH
      - [Setup your SSH key](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/)
      - [Add it to github](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/)
  2. Set up git
      - set your name and email
        - `git config --global user.name "Happy Farmer"`
        - `git config --global user.email "happy.farmer@gmail.com"`
      - set pull to rebase by default
        - `git config --global pull.rebase true`
  3. [install node.js](https://nodejs.org/en/download/package-manager/)
  4. lerna
      - `npm install -g lerna`
  5. clone the repository
      - `git clone https://github.com/LiteFarmOrg/LiteFarm.git`

### Setting up database/running migrations:  
  1. Install postgreSQL 
    1. Using Homebrew on Mac
      - install homebrew
        - `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"`
      - install postgresql
        - `brew install postgresql`
        - `brew services start postgresql`
      - create user `postgres` and set password to `postgres`
        - `psql postgres`
        - `CREATE ROLE postgres WITH PASSWORD 'postgres';`
        - `ALTER ROLE postgres CREATEDB;`
        - `ALTER ROLE postgres WITH SUPERUSER;`
        - `ALTER ROLE postgres WITH LOGIN;`
        - `\q`      
  2. create a database called mock_farm
      - `psql postgres -U postgres`
      - `CREATE DATABASE mock_farm;`
  3. go to your terminal and go to the api directory doing `cd packages/api`
  4. once there, run `npm run migrate:dev:db` to start the db migration (if you run into issues here, you can try dropping and recreating the database) 
  5. Optionally, you can run `npm run migrate:dev:seed` to seed database with default data

  ### Setting up env vars in webapp and api:
  custom environment variables are used in the application. Env vars containing sensitive information
  is not uploaded to source control. For local development, custom env vars need to be added in the .env file.
  Not all of these environment variables are necessary to run the applications. Only add them if they are necessary
  for your development purposes. Do NOT add .env files to source control.

  1. add these environment variables to the .env file in `packages/webapp`:
     - REACT_APP_GOOGLE_MAPS_API_KEY
        - this env var is a google maps api key obtained from [Google](https://developers.google.com/maps/documentation/javascript/get-api-key).
        It is used to make the field module work in the application
     - REACT_APP_WEATHER_API_KEY
        - this env var can be obtained from [open weather API](https://openweathermap.org/api). The API is used
        to load current weather information in the application home page after logging in.
  ### Start the application:
  1. cd LiteFarm
  2. `lerna bootstrap` to install dependencies
  3. in separate terminals:
      - `cd packages/webapp && npm start`
      - `cd packages/api && npm start`
      - (for hot reloading in api: npm install -g nodemon && nodemon --exec npm start)
  4. webapp will be running on http://localhost:3000 and the api on http://localhost:5000
  5. Since this is a mobile web application, webapp should be viewed in a mobile view in the browser

# Testing:

### Webapp:
  Automated testing for the front-end is done using [cypress](https://www.cypress.io/).
  To run automated tests in a chrome browser:
  - Ensure that the webapp portal is running by doing `npm start` in the root directory of the webapp package
  - `npm run cypress-ui` in the root directory of the webapp package

  The test modules are stored in `packages/webapp/cypress/integration`.
  Additional tests can be added by adding more testing modules to this directory.

  Unit tests can also be run by:
  - `npm run test`.

  Unit tests reside in `src/tests`, and additional unit tests can be added in this directory.

  We are currently using [ESLint](https://eslint.org/) to maintain code style in the app.
  The linter can be run by `npm run lint`.

### Api:
  There is currently end-to-end testing being done for the LiteFarm API using the [chai.js](https://www.chaijs.com/)
  and [jest](https://jestjs.io/) libraries.
  The test files can be found in `packages/api/tests`.

  All of the tests run real queries to the database using a jwt token obtained through Auth0.
  Therefore, locally run tests can affect the state of the db. This is addressed by running a script which deletes
  test data that is generated during the tests. However, this is not fool-proof, and
  it may be necessary to clear the local db in some cases.

  To run an end-to-end test, `npm run e2e` in the api directory.

  To run a test file with a specific name:
   - `npm start`
   - `jest test_name`

  It should be noted that any merges to develop and master branches in github will result in the code going through a CI pipeline, which
  runs the end-to-end test. Therefore it is important to test locally first before creating any pull requests
  to develop.

  We are currently using [ESLint](https://eslint.org/) to maintain code style in the app. The linter can be run by `npm run lint`.
