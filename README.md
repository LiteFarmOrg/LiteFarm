# LiteFarm

LiteFarm is the world’s first community-led, not-for-profit, digital platform joining farmers and scientists together for participatory assessment of social, environmental and economic outputs of farming systems. LiteFarm is the first application of its kind specifically tailored to the needs of diversified farmers with built-in pathways to provide expert decision support and help them earn additional income through payment for ecological services (PES) schemes and in-app certifications (such as organic). These approaches serve the multiple purposes of incentivizing adoption of sustainable land use practices through the provision of evidence-based decision support, and significantly increasing the amount of data being collected by diversified farming operations around the globe. It was developed with farmers at the center of the design process and built from the ground up with accessibility and approachability in mind. We are proud of our mission:

_To meet farmers where they are and equip them with the tools they need to make informed and responsible decisions about the health of their farm, their livelihood, their community, and the planet._

LiteFarm version 1.0.0 was released to the public in July 2020. The LiteFarm app is continually being developed, with farmers, researchers, designers and developers working together to create new localized modules and features into the future.  LiteFarm is deployed in Canada, the USA, and Latin America.

If you’re a farmer and would like to join LiteFarm you can sign up today at app.litefarm.org. If you are a researcher or would like to find out more about this project you can contact the [UBC Centre for Sustainable Food Systems](https://ubcfarm.ubc.ca/litefarm/). If you're a developer, welcome to the team! All the details on how you can contribute to this project are right here.

# Setup 

LiteFarm is comprised of three applications which all reside in this monorepo.

- `packages/webapp` is the client-facing application 
- `packages/api` is the back-end API server with entry point `src/server.js`
- `packages/api/src/jobs` is the "jobs scheduler" for certification exports, with entry point `index.js` 

## Preliminaries 

1. Install [node.js](https://nodejs.org/en/download/package-manager/) if you do not already have it.
2. If you do not have pnpm installed, run `npm install -g pnpm` in a terminal.
3. Use the `git clone` command to clone this repository to your computer.
4. In a terminal, navigate to the root folder of the repo and run `npm install`.
5. Navigate to the `packages/api` folder, and run `npm install`.
6. Navigate to the `packages/webapp` folder, and run `pnpm install`.


## Configuring the applications

The applications are configured with environment variables stored in `.env` files. Configuration information includes secrets like API keys, so the `.env` files should never be added to source control. This repository does contain `.env.default` files for api and webapp. These files contain all necessary environment variables, but for sensitive ones the values are redacted. Contact smattingly@litefarm.org for assistance.

## Database setup

1. Install PostgreSQL by downloading installers or packages from https://www.postgresql.org/download/. Alternatively, Mac and Linux users can use homebrew as shown below.

   ```bash      
   # Install homebrew.
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
   # Install PostgreSQL.
   brew install postgresql
   # Start DBMS service.
   brew services start postgresql
   ```

2. Set up the PostgreSQL role (account) and databases. You will use the `psql` client program. Account setup details will vary by OS. If an installer asks you to choose a password for the `postgres` (superuser) account, use `postgres` for consistency with the contents of `.env.default`.

   - Linux. In a terminal, start the client with `sudo -u postgres psql`, then execute each of the following commands. (The last command terminates the client session.)
       ```sql
       ALTER ROLE postgres WITH PASSWORD 'postgres';
       CREATE DATABASE "pg-litefarm";
       CREATE DATABASE test_farm;
       exit;       
       ```

   - Windows. At the Start menu, type `psql` and the search results will show "SQL Shell (psql)". In the client, execute
     each of the following commands. (The last command terminates the client session.)

       ```sql
       CREATE DATABASE "pg-litefarm";
       CREATE DATABASE test_farm;
       exit;       
       ```

3. In a terminal, navigate to the `packages/api` folder. Execute `npm run migrate:dev:db` to run the [migrations](https://knexjs.org/#Migrations) that set up the PostgreSQL database used by the app.

# Running the apps

## api

In a terminal, navigate to the `packages/api` folder. Run `npm run nodemon` to launch the backend application. It will automatically reflect any changes you make to the backend.

## webapp

In a terminal, navigate to the `packages/webapp` folder and run `pnpm dev`. This builds the frontend code, and starts a web server that will automatically reflect any changes you make to the frontend.

Load the frontend app in your browser at http://localhost:3000.

# Testing

## api

To run [ESLint](https://eslint.org/) checks execute `npm run lint`

The [chai.js](https://www.chaijs.com/) and [jest](https://jestjs.io/) libraries automate tests that run real database operations using [JWT](https://jwt.io/introduction). The tests use a dedicated database named `test_farm`, distinct from the `pg-litefarm` database that the app normally uses .

1. In a terminal, navigate to the `packages/api` folder. 
2. Execute `npm run migrate:testing:db` to set up the test database.
3. Execute `npm test` to launch the tests. Or, to generate test coverage information, run `npm test -- --coverage .` and then see the `coverage/index.html` file.

While the tests do attempt to clean up after themselves, it's a good idea to periodically use `psql` to `DROP` and `CREATE` the `test_farm` database, followed by the migrations from step 2 above.

## webapp

To run [ESLint](https://eslint.org/) checks execute `pnpm lint`

Since this is a mobile web application, webapp should be viewed in a mobile view in the browser.
