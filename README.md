| Test  | Coverage |
| ------------- | ------------- |
| E2E FE Test  | ![check-code-coverage](https://img.shields.io/badge/code--coverage-51.2%25-red)  |
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

1. Check to see if you have Node.js installed. On a Mac use the command `node-v` in terminal. If it is installed, the version in use will be reported in the terminal. If not, install it from [node.js](https://nodejs.org/en/download/package-manager/).
2. Check to see if you have pnpm installed. On a Mac use the command `pnpm -v`. If it is installed, the version will be reported. If you do not have it installed, run `npm install -g pnpm` in a terminal. 
3. Check to see if you have NVM installed. On a Mac use the command `nvm -v`. If you do not have NVM (Node Version Manager) installed, install it using these instructions: [NVM](https://www.loginradius.com/blog/engineering/run-multiple-nodejs-version-on-the-same-machine/)
4. Clone the repository from Github to your computer. On a Mac, in a Terminal window navigate to the directory you want to put the files in. Then use the command `git clone https://github.com/LiteFarmOrg/LiteFarm.git`.
5. In a terminal, navigate to the root folder of the repo and run `npm install`.
6. Navigate to the `packages/api` folder, and run `npm install`.
   If trying to run this command results in the error, 
   `npm ERR! code ERESOLVE
   npm ERR! ERESOLVE could not resolve
   npm ERR!
   npm ERR! While resolving: objection@2.2.17...`
   
   Use nvm to install and use the Node version 16.15.0 with the commands, `nvm install 16.15.0` then `nvm use 16.15.0`. Then try again.
7. Navigate to the `packages/webapp` folder, and run `pnpm install`.

## Database setup

1. If using Windows, install PostgreSQL by downloading installers or packages from https://www.postgresql.org/download/. Mac and Linux users can use homebrew with the commands shown below (a link for installing Homebrew is below too!). The second command can take up to 10 minutes because it may trigger the compilation of a new binary.

   In a Terminal window:  
```      
   # Install homebrew if you don't already have it with the command:
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
   # Install PostgreSQL.
   brew install postgresql
   # Start the Database Management Systems (DBMS) service.
   brew services start postgresql
```

2. Set up the PostgreSQL role (account) and databases. Use the `psql` client program. If an installer asks you to choose a password for the `postgres` (superuser) account, use `postgres` for consistency with the contents of `.env.default`.

   - On a Mac, type "psql" in the terminal to start the client.

      If this returns the error, "/... postgresql.plist: service already loaded..." then you need to [remove a .pid file](https://stackoverflow.com/questions/13410686/postgres-could-not-connect-to-server) that is interfering with the start of the DBMS service. On a Mac, use the terminal command, `rm /usr/local/var/postgres/postmaster.pid` then `brew services restart postgresql`.

      Then use the Linux commands below to set the postgres user password, and make two new databases.

   - Linux. In a terminal, start the client with `sudo -u postgres psql`, then execute each of the following commands. (The last command terminates the client session.)

       ALTER ROLE postgres WITH PASSWORD 'postgres';
       CREATE DATABASE "pg-litefarm";
       CREATE DATABASE test_farm;

   Then exit with,
       exit;       

   - Windows. At the Start menu, type `psql` and the search results will show "SQL Shell (psql)". In the client, execute
     each of the following commands. (The last command terminates the client session.)

       CREATE DATABASE "pg-litefarm";
       CREATE DATABASE test_farm;
       
   Then exit with,
       exit;       

   For Windows, the ALTER ROLE command is not used because the password is set using the wizard installer downloaded.

3. In a terminal, navigate to the `packages/api` folder. Execute `npm run migrate:dev:db` to run the [migrations](https://knexjs.org/#Migrations) that set up the PostgreSQL database used by the app.

## Adding environment files

The applications are configured with environment variables stored in `.env` files. Configuration information includes secrets like API keys, so the `.env` files are not included in this git repository.

 This repository contains a `.env.default` file for api and webapp. These files contain directions to acquire the personal keys needed to get LiteFarm running locally. Please note you will want to copy `.env.default` and rename the file to `.env`. Only after adding the `.env` file should you proceed to add the new keys. If you add your api keys to `.env.default` you may accidentally expose your keys since this file is tracked on git.
 
 If you have questions about the other api keys, or wish to join the LiteFarm team, please contact community@litefarm.org. 

# Running the apps

## api

In a terminal, navigate to the `packages/api` folder. Run `npm run nodemon` to launch the backend application. Nodemon will automatically restart the application when changes are made to the backend code.

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

You can also test LiteFarm on your actual mobile device using the network adddress returned by `vite --host` when you start the webapp in development mode. To do this, also update `VITE_API_URL` in your `webapp/.env` file from localhost to that address (or your computer's network name) and the appropriate API port. Most of LiteFarm can be tested like this, but please note that Google SSO and some other functionality will not work over the local network.

## export server

Certification document export is handled by a Node.js application that runs separately from the api and connects to a Digital Ocean Space (AWS S3 bucket). It can be tested locally by setting up a Redis database for the job queue and using MinIO, a free and open-source drop-in replacement for AWS S3 that can be run on your own machine.

<details>
  <summary>Full instructions for running the export server locally</summary>

1. Create and run a local Redis database on the default port with password "test"
2. Install and configure MinIO. You will want to create a Single-Node Single-Drive (Standalone) MinIO installation. The MinIO website lists instructions for [Docker](https://min.io/docs/minio/container/index.html) and [MacOS](https://min.io/docs/minio/macos/index.html) along with other operating systems. Use the default port.
3. Use the MinIO console to
   - create a new bucket and set its access policy to "public"
   - generate an access key. Record both key + secret
4. Download [aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and configure it with your MinIO access key + secret directly in the terminal using:
   ```
   aws configure
   ```
   Make sure that the region name is either removed from your aws configuration or set up correspondingly in your MinIO admin panel.
5. Connect MinIO to LiteFarm:

   in `packages/api/.env` make sure you have the following variables set:

   ```
   MINIO_ENDPOINT=http://localhost:9000
   PRIVATE_BUCKET_NAME=<MinIO bucket name here>
   PUBLIC_BUCKET_NAME=<MinIO bucket name here>
   ```

   in `packages/webapp/.env`:

   ```
   VITE_DEV_BUCKET_NAME=<MinIO bucket name here>
   VITE_DEV_ENDPOINT=localhost:9000
   ```

6. Add an `exports/` directory to LiteFarm `packages/api`
7. Make sure both the LiteFarm api and webapp are already running, then run the export server from `packages/api` using
   ```
   npm run scheduler
   ```

</details>

A [detailed walkthrough](https://lite-farm.atlassian.net/wiki/spaces/LITEFARM/pages/1190101039/The+export+jobs+pseudo-package#Running-the-export-server-locally) (with screenshots) is also available on the LiteFarm Confluence.

You can also use the same MinIO bucket to store documents (but not, currently, images) uploaded from the Documents view of the webapp. To configure this, set up MinIO as above, and add the access key credentials to `/api/.env` under
`DO_SPACES_ACCESS_KEY_ID` and `DO_SPACES_SECRET_ACCESS_KEY`.

# ngrok

## Use cases for ngrok

Please see https://ngrok.com/ for more general information about ngrok. 

Use cases in which we currently utilize ngrok at LiteFarm include:
- Testing local changes on phones or different devices
- Testing local changes when working with other APIs and integrations

## Set up

- Go to https://ngrok.com/ and sign up for an account
- Install the ngrok CLI (on the [Getting Started](https://dashboard.ngrok.com/get-started/setup) page after signing up)
- Create a copy of `ngrok/ngrok.default.yml` and call it `ngrok.yml`. Make sure this file is in the `ngrok` folder at the root of the repo
- Login to your ngrok account and go to https://dashboard.ngrok.com/get-started/your-authtoken
- Add the auth token from there in `ngrok.yml` by replacing the `?`

## Commands
These commands can be run from the root of the repo.
- `npm run ngrok` to forward both backend and frontend ports with ngrok
- `npm run ngrok:setup` to add the ngrok urls to the file .env files (always run after forwarding a port to ngrok)
- `npm run ngrok:api` to forward the backend port with ngrok
- `npm run ngrok:webapp` to forward the frontend port with ngrok

_Note: Please make sure to run the commands in the following order:_
-  `npm run ngrok` or `npm run ngrok:api` or `npm run ngrok:webapp`
- `npm run ngrok:setup` (in a new terminal)
- `pnpm dev` (in a new terminal from the `packages/webapp` folder)
- `npm run nodemon` (in a new terminal from the `packages/api` folder)

# Docker

## Use cases for Docker

Please see https://docs.docker.com/ for more general information about docker. 

Use cases in which we currently utilize docker at LiteFarm include:
- Simulating the server environment.
- Building LiteFarm application using docker commands and supporting its components using containers.

## Set up

- Go to https://docs.docker.com/get-docker/ and install docker in your local system.
- After installation, the docker CLI will be available where you can run the docker commands. 
- create a .env file at the root directory of the project i.e. LiteFarm 
- Add key-value pairs in the .env by referring to the docker-compose.[ENV].yml that contains the docker env keys.

## Commands
These commands can be run from the root of the repo.
- `docker-compose -f docker-compose.[ENV].yml up --build -d` to build the docker containers in the detach mode.
- `docker ps` to see the list of docker containers in the running state.
- `docker logs --details [containers name]` to view the logs inside the container.

_Note:
- [container_name] are litefarm-db, litefarm-api and litefarm-web.
- [ENV] are beta and prod

## How to Contribute

Please email: community@litefarm.org for more details.