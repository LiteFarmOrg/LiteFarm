# LiteFarm

LiteFarm is the world’s first community-led, not-for-profit, digital platform joining farmers and scientists together for participatory assessment of social, environmental and economic outputs of farming systems. LiteFarm is the first application of its kind specifically tailored to the needs of diversified farmers with built-in pathways to provide expert decision support and help them earn additional income through payment for ecological services (PES) schemes and in-app certifications (such as organic). These approaches serve the multiple purposes of incentivizing adoption of sustainable land use practices through the provision of evidence-based decision support, and significantly increasing the amount of data being collected by diversified farming operations around the globe. It was developed with farmers at the center of the design process and built from the ground up with accessibility and approachability in mind. We are proud of our mission:

_To meet farmers where they are and equip them with the tools they need to make informed and responsible decisions about the health of their farm, their livelihood, their community, and the planet._

LiteFarm version 1.0.0 was released to the public in July 2020. The LiteFarm app is continually being developed, with farmers, researchers, designers and developers working together to create new localized modules and features into the future. LiteFarm is deployed in Canada, the USA, and Latin America.

If you’re a farmer and would like to join LiteFarm you can sign up today at app.litefarm.org. If you are a researcher or would like to find out more about this project you can contact the [UBC Centre for Sustainable Food Systems](https://ubcfarm.ubc.ca/litefarm/). If you're a developer, welcome to the team! All the details on how you can contribute to this project are right here.

# Setup

LiteFarm is comprised of three applications which all reside in this monorepo.

- `packages/webapp` is the client-facing application
- `packages/api` is the back-end API server with entry point `src/server.js`
- `packages/api/src/jobs` is the "jobs scheduler" for certification exports, with entry point `index.js`

## Preliminaries

1. Check to see if you have Node.js installed. We use the version specified in the `.nvmrc` file of each folder with package imports. On a Mac use the command `node -v` in terminal. If it is installed, the version in use will be reported in the terminal. If not, install it from [node.js](https://nodejs.org/en/download/package-manager/).
2. Check to see if you have NVM installed. On a Mac use the command `nvm -v`. If you do not have NVM (Node Version Manager) installed, install it using these instructions: [NVM](https://www.loginradius.com/blog/engineering/run-multiple-nodejs-version-on-the-same-machine/)
3. Check to see if you have pnpm installed. On a Mac use the command `pnpm -v`. If it is installed, the version will be reported. If you do not have it installed, run `npm install -g pnpm` in a terminal.
4. Clone the repository from Github to your computer. On a Mac, in a Terminal window navigate to the directory you want to put the files in. Then use the command `git clone https://github.com/LiteFarmOrg/LiteFarm.git`.
5. Install all packages:

- Switch to current version of Node.js by running `nvm use` in the root folder
- Navigate to the root folder `/` of the repo and run `npm install`.
- Navigate to the `packages/api` folder, and run `npm install`.
- Navigate to the `packages/webapp` folder, and run `pnpm install`.
- Navigate to the `packages/shared` folder, and run `npm install`.

6. (Highly recommended) Go to [Get Docker | Docker Documentation](https://docs.docker.com/get-docker/) and install Docker. Docker is the recommended method for setting up development dependencies, but alternative instructions will be provided as well if you are unable to use Docker. There will be extra instructions for each operating system. For example: Windows requires Windows subsystem for linux (WSL). Mac users may need to enable experimental/beta settings for Mac users.

## Adding environment files

The applications are configured with environment variables stored in `.env` files. Configuration information includes secrets like API keys, so the `.env` files are not included in this git repository.

This repository contains a `.env.default` file for both api and webapp. These files contain directions to acquire the personal keys needed to get LiteFarm running locally. Please note you will want to copy `.env.default` and rename the file to `.env`. Only after adding the `.env` file should you proceed to add the new keys. If you add your api keys to `.env.default` you may accidentally expose your keys since this file is tracked on git.

If you have questions about the other api keys, or wish to join the LiteFarm team, please contact community@litefarm.org.

## Database setup

Run `docker compose up` in the root directory to configure and start all development dependencies, including the database.

For more information, see [services (local development dependencies)](#services-local-development-dependencies) below.

Once the database container is running and the `.env` files have been configured [as described above](#adding-environment-files), in a terminal navigate to the `packages/api` folder. Execute `npm run migrate:dev:db` to run the [migrations](https://knexjs.org/#Migrations) that set up the PostgreSQL database used by the app.

### Database - Native installation

<details>
  <summary>Instructions</summary>
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

3. Set the value of `DEV_DATABASE_PORT` in `packages/api/.env` to the correct port of your PostgreSQL installation. The default port is `5432`

4. In a terminal, navigate to the `packages/api` folder. Execute `npm run migrate:dev:db` to run the [migrations](https://knexjs.org/#Migrations) that set up the PostgreSQL database used by the app.

</details>

# Running the apps

## api

In a terminal, navigate to the `packages/api` folder. Run `npm run nodemon` to launch the backend application. Nodemon will automatically restart the application when changes are made to the backend code.

## webapp

In a terminal, navigate to the `packages/webapp` folder and run `pnpm dev`. This builds the frontend code, and starts a web server that will automatically reflect any changes you make to the frontend.

Load the frontend app in your browser at http://localhost:3000.

## services (local development dependencies)

<details>
  <summary>Background & Details</summary>

### PostgreSQL Database

The LiteFarm database can be run either directly on your local machine or, for ease of setup, in a pre-configured Docker container. We recommend using Docker, and so the database is included by default in the `docker-compose.yml` file. Please note the docker-compose exposes port `5433` to the host machine for connecting your Postgres client of choice (e.g. Postico/pgAdmin4).

If you prefer to install and use Postgres natively, instructions for different operating systems are provided above under [Database Setup - Native installation](#database---native-installation).

### Images, documents, and certification export

In beta and production, images, uploaded files, and certification exports are all stored on Digital Ocean Spaces (AWS S3-SDK compatible buckets). Organic certification document creation is handled by a node.js application that runs separately from the API alongside an image compression microservice called the imaginary, both hosted on Digital Ocean Droplets.

In the local development environment, we use MinIO, a free and open-source drop-in replacement for AWS S3. MinIO, the export server, and the export server's dependency Redis (used to manage its job queue) can all be run in either Docker containers or natively, depending on developer preference. The easier method is to use Docker and let the `docker-compose.yml` file handle the configuration.

### Instructions:

</details>

Run `docker compose up` in the root directory of the project.

Make sure that your `.env` variables are configured as outlined in the `.env.default` files (see [section above](#adding-environment-files)). When exporting certification documents, both the webapp and API need to be running.

Also see the section below [on using Docker](#docker).

Note: the export server is not usually needed, and so is not started with the other development dependencies. To start it, make sure the the webapp and API are already running, and use the command `docker compose up export`.

<details>
  <summary>Instructions for running image, document, and certification services natively</summary>

#### Running the export server natively/directly

1. Create and run a local Redis database with password "test". Make sure to record the correct port under `REDIS_PORT` in `packages/api/.env` -- the default is 6379
2. Install and configure MinIO. You will want to create a Single-Node Single-Drive (Standalone) MinIO installation. The MinIO website lists instructions for [MacOS](https://min.io/docs/minio/macos/index.html) along with other operating systems. Use the default port.
3. Use the MinIO console to
   - create a new bucket called `minio-dev` and set its access policy to "public"
   - generate an access key. Record both key + secret
   - Note: for local use you may instead use the default username and password -- both `myminioadmin` -- in place of keys
4. Download [aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and configure it with your MinIO access key + secret directly in the terminal using:
   ```
   aws configure
   ```
   Make sure that the region name is either removed from your aws configuration or set up correspondingly in your MinIO admin panel.
5. Connect MinIO to LiteFarm:

   in `packages/api/.env` make sure you have the following variables set:

   ```
   MINIO_ENDPOINT=http://localhost:9000
   PRIVATE_BUCKET_NAME=minio-dev
   PUBLIC_BUCKET_NAME=minio-dev
   ```

   in `packages/webapp/.env`:

   ```
   VITE_DEV_BUCKET_NAME=minio-dev
   VITE_DEV_ENDPOINT=localhost:9000
   ```

6. Make sure both the LiteFarm api and webapp are already running, then run the export server from `packages/api` using
   ```
   npm run scheduler
   ```

A [detailed walkthrough](https://lite-farm.atlassian.net/wiki/spaces/LITEFARM/pages/1190101039/The+export+jobs+pseudo-package#Running-the-export-server-locally) (with screenshots) is also available on the LiteFarm Confluence.

#### Image and document storage natively/directly

You can also use the same MinIO bucket to store documents uploaded from the Documents view of the webapp. To configure this, set up MinIO as described above, add the access key credentials to `/api/.env`, e.g.

```
DO_SPACES_ACCESS_KEY_ID=myminioadmin
DO_SPACES_SECRET_ACCESS_KEY=myminioadmin
```

#### Imaginary

The imaginary only exists as a Docker container (both in production and for development), and we highly recommend running it with `docker compose up imaginary`

You will need these variables set in your `/api/.env`:

```
IMAGINARY_TOKEN=localonlytoken
LOCAL_IMAGINARY=http://localhost:8088
```

If you are unable to use Docker, please contact a core team member to get instructions on using the production Imaginary.

</details>

# Testing

## api

To run [ESLint](https://eslint.org/) checks execute `npm run lint`

The [chai.js](https://www.chaijs.com/) and [jest](https://jestjs.io/) libraries automate tests that run real database operations using a dedicated database named `test_farm`, distinct from the `pg-litefarm` database that the app normally uses.

You'll want to confirm that you have an empty `test_farm` database (otherwise use your preferred database client to create one) before continuing with the following:

1. In a terminal, navigate to the `packages/api` folder.
2. Execute `npm run migrate:testing:db` to set up the test database.
3. Execute `npm test` to launch the tests. Or, to generate test coverage information, run `npm test -- --coverage .` and then see the `coverage/index.html` file.

While the tests do attempt to clean up after themselves, it's a good idea to periodically use `psql` or your database client to `DROP` and `CREATE` the `test_farm` database, followed by the migrations from step 2 above.

## webapp

To run [ESLint](https://eslint.org/) checks execute `pnpm lint`

Since this is a mobile web application, webapp should be viewed in a mobile view in the browser.

You can also test LiteFarm on your actual mobile device using the network adddress returned by `vite --host` when you start the webapp in development mode. To do this, also update `VITE_API_URL` in your `webapp/.env` file from localhost to that address (or your computer's network name) and the appropriate API port. Most of LiteFarm can be tested like this, but please note that Google SSO and some other functionality will not work over the local network.

# ngrok

## Use cases for ngrok

Please see https://ngrok.com/ for more general information about ngrok.

While not required for most developers, use cases in which we currently utilize ngrok at LiteFarm include:

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

- `npm run ngrok` or `npm run ngrok:api` or `npm run ngrok:webapp`
- `npm run ngrok:setup` (in a new terminal)
- `pnpm dev` (in a new terminal from the `packages/webapp` folder)
- `npm run nodemon` (in a new terminal from the `packages/api` folder)

# Docker

## Use cases for Docker

Please see https://docs.docker.com/ for more general information about docker.

Use cases in which we currently utilize docker at LiteFarm include:

- Managing development dependencies in the local development environment, including the database and services for working with images, files, and exports
- Simulating the server environment.
- Building LiteFarm application using docker commands and supporting its components using containers.

## Set up

- Go to https://docs.docker.com/get-docker/ and install docker in your local system.
- After installation, you can run Docker commands using the Docker CLI.
- To build the beta/prod Docker containers (generally used when troubleshooting the build process), you will also need to:
  - create a `.env` file at the root directory of the project i.e. LiteFarm
  - add key-value pairs in the `.env` by referring to the `docker-compose.[ENV].yml` that contains the docker env keys

## Commands

These commands can be run from the root of the repo.

- `docker compose up` to start the main development services
- `docker compose up export` to start the process that handles certification document export
- `docker compose up [service names]` to run one or more particular services
- `docker compose down` to stop and remove all containers defined in `docker-compose.yml`
- `docker compose down --volumes` to stop and remove all containers and volumes defined in `docker-compose.yml`
- `docker-compose -f docker-compose.[ENV].yml up --build` to build the beta/prod docker containers
- `docker ps` to see the list of docker containers in the running state.
- `docker logs --details [containers name]` to view the logs inside the container.

Notes:

- [service names] are db, minio, redis, export, and imaginary
- [container_name] are litefarm-db, litefarm-api and litefarm-web.
- [ENV] are beta and prod

## Storybook

You can use Storybook to visualize and test out the UI components used throughout the app.

- To view Storybook on your local environment, run `pnpm storybook` on the `packages/webapp` directory and navigate to http://localhost:6006
- To view the deployed version of Storybook, which is updated automatically with the latest changes on the integration branch, go to https://65316fc4f177c73a9181a843-yobioprfjv.chromatic.com

## How to Contribute

Please email: community@litefarm.org for more details.
