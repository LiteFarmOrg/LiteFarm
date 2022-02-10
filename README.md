# LiteFarm

LiteFarm is the world’s first community-led, not-for-profit, digital platform joining farmers and scientists together for participatory assessment of social, environmental and economic outputs of farming systems. LiteFarm is the first application of its kind specifically tailored to the needs of diversified farmers with built-in pathways to provide expert decision support and help them earn additional income through payment for ecological services (PES) schemes and in-app certifications (such as organic). These approaches serve the multiple purposes of incentivizing adoption of sustainable land use practices through the provision of evidence-based decision support, and significantly increasing the amount of data being collected by diversified farming operations around the globe. It was developed with farmers at the center of the design process and built from the ground up with accessibility and approachability in mind. We are proud of our mission:

_To meet farmers where they are and equip them with the tools they need to make informed and responsible decisions about the health of their farm, their livelihood, their community, and the planet._

LiteFarm version 1.0.0 was released to the public in July 2020. The LiteFarm app is continually being developed, with farmers, researchers, designers and developers working together to create new localized modules and features into the future.  LiteFarm is deployed in Canada, the USA, and Latin America.

If you’re a farmer and would like to join LiteFarm you can sign up today at app.litefarm.org. If you are a researcher or would like to find out more about this project you can contact the [UBC Centre for Sustainable Food Systems](https://ubcfarm.ubc.ca/litefarm/). If you're a developer, welcome to the team! All the details on how you can contribute to this project are right here.

# Setup 

LiteFarm is comprised of two applications which both reside in this monorepo.

- `packages/api`: the back-end API server
- `packages/webapp`: the client-facing application

## Preliminaries 

1. Install [node.js](https://nodejs.org/en/download/package-manager/) if you do not already have it.
2. Use the `git clone` command to clone this repository to your computer.

## Configure LiteFarm applications

The applications are configured with environment variables stored in `.env` files. Configuration information includes secrets like API keys, so the `.env` files should never be added to source control. This repository does contain `.env.default` files for api and webapp. Begin with these, and customize as needed.

1. Create the api configuration file by copying `packages/api/env.default` to `packages/api/.env`.

2. Create the webapp configuration file by copying `packages/webapp/env.default` to `packages/webapp/.env`. For webapp
   to work, you must edit your new `.env` file to provide values for two required environment variables:
    - `VITE_GOOGLE_MAPS_API_KEY` is a Google Maps API key. You should obtain your own key value
      from [Google](https://developers.google.com/maps/documentation/javascript/get-api-key).
    - `VITE_WEATHER_API_KEY` is an OpenWeather API key. You should obtain your own key value
      from [OpenWeather](https://openweathermap.org/api).

## Runtime setup

### Option 1: Docker containers

This approach runs the LiteFarm applications and the database server in Docker containers. If you prefer to run them directly on your hardware, skip to the next section.

1. Install [docker](https://docs.docker.com/desktop/) and [docker-compose](https://docs.docker.com/compose/install/) if you do not already have them.
2. In a terminal, navigate to the root folder for the repository.
3. Execute `docker-compose -f docker-compose.dev.yml up`. Alternatively, you can run `make up` if you have `make` installed.
    - The initial build will take some time. Subsequent incremental builds are much quicker. 
    - This process will run [migrations](https://knexjs.org/#Migrations) to set up the PostgreSQL database, then start the Docker containers for webapp, api, databases, and Storybook.
4. When the build completes, you can load the webapp at `http://localhost:3000`. Storybook is available on `http://localhost:6006`.

### Option 2: Your hardware 

This approach runs the LiteFarm applications and database server directly on your hardware. If you prefer Docker containers, see the previous section.

1. Install PostgreSQL by downloading installers or packages from https://www.postgresql.org/download/. Alternatively, Mac and Linux users can use homebrew as shown below.

   ```bash      
   # Install homebrew.
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
   # Install PostgreSQL.
   brew install postgresql
   # Start DBMS service.
   brew services start postgresql
   ```

2. Set up the PostgreSQL role (account) and databases. (The `packages/api/.env.default` file specifies `pg-litefarm` and `test_farm`, respectively, for development and test database names.) You will use the `psql` client program. Account setup details will vary by OS. If an installer asks you to choose a password for the `postgres` (superuser) account, use `postgres`.

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

3. In a terminal, run `npm i` under the root folder of the repository, `npm i` under `packages/api`, and `pnpm i`
   under `packages/webapp`.

4. Edit the `packages/api/.env` file, setting the value of variable `DEV_DATABASE_HOST` to `localhost`

5. In the terminal, navigate to the `packages/api` folder. 

6. Execute `npm run migrate:dev:db` to run the [migrations](https://knexjs.org/#Migrations) that set up the PostgreSQL database. (If you run into issues here, you can try dropping and recreating the database.)

7. Run `npm start` to launch the api application.

8. In a different terminal, navigate to the `packages/webapp` folder and run `pnpm dev` to launch the webapp
   application. Load it in your browser at http://localhost:3000.

# Testing

## webapp

To run [ESLint](https://eslint.org/) checks execute `pnpm lint`

Since this is a mobile web application, webapp should be viewed in a mobile view in the browser.

## api

To run [ESLint](https://eslint.org/) checks execute `npm run lint`

The [chai.js](https://www.chaijs.com/) and [jest](https://jestjs.io/) libraries automate tests that run real database operations using [JWT](https://jwt.io/introduction). The tests use a dedicated database named `test_farm`, distinct from the `pg-litefarm` database that the app normally uses .

1. In a terminal, navigate to the `packages/api` folder. 
2. Execute `npm run migrate:testing:db` to set up the test database.
3. Execute `npm test` to launch the tests. Or, to generate test coverage information, run `npm test -- --coverage .` and then see the `coverage/index.html` file.

It is good practice to use `psql` to `DROP` and `CREATE` the `test_farm` database before repeating this process.
