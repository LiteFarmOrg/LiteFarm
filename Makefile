# Copyright 2023 LiteFarm.org
# This file is part of LiteFarm.
#
# LiteFarm is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# LiteFarm is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details, see <https://www.gnu.org/licenses/>.

include .env.secrets

secrets:
	@if [ ! -f .env.secrets ]; then echo "Please copy .env.secrets.default to .env.secrets and fill the variables"; exit 1; fi;
	@if grep -Fq "=?" .env.secrets ; then echo "Please fill all the secrets in .env.secrets"; exit 1; fi;

db_dropped:
	@docker compose down
	@docker volume prune -a -f

api_env_file: ./packages/api/.env.default secrets
	@cp ./packages/api/.env.default ./packages/api/.env
	@sed -i 's/GOOGLE_API_KEY=?/GOOGLE_API_KEY=$(GOOGLE_API_KEY)/g' ./packages/api/.env
	@sed -i 's/GOOGLE_OAUTH_CLIENT_ID=?/GOOGLE_OAUTH_CLIENT_ID=$(GOOGLE_OAUTH_CLIENT_ID)/g' ./packages/api/.env
	@sed -i 's/OPEN_WEATHER_APP_ID=?/OPEN_WEATHER_APP_ID=$(OPEN_WEATHER_APP_ID)/g' ./packages/api/.env
	@sed -i 's/DEV_GMAIL=/DEV_GMAIL=$(DEV_GMAIL)/g' ./packages/api/.env
	@sed -i 's/DEV_GMAIL_APP_PASSWORD=/DEV_GMAIL_APP_PASSWORD=$(DEV_GMAIL_APP_PASSWORD)/g' ./packages/api/.env
	@echo "Generated ./packages/api/.env"

webapp_env_file: ./packages/webapp/.env.default secrets
	@cp ./packages/webapp/.env.default ./packages/webapp/.env
	@sed -i 's/VITE_GOOGLE_MAPS_API_KEY=?/VITE_GOOGLE_MAPS_API_KEY=$(GOOGLE_API_KEY)/g' ./packages/webapp/.env
	@sed -i 's/VITE_GOOGLE_OAUTH_CLIENT_ID=?/VITE_GOOGLE_OAUTH_CLIENT_ID=$(GOOGLE_OAUTH_CLIENT_ID)/g' ./packages/webapp/.env
	@sed -i 's/VITE_WEATHER_API_KEY=?/VITE_WEATHER_API_KEY=$(OPEN_WEATHER_APP_ID)/g' ./packages/webapp/.env
	@echo "Generated ./packages/webapp/.env"

env_files: api_env_file webapp_env_file

docker_up:
	@docker compose up -d db minio create_minio_bucket redis imaginary
	@while [ -z "$$(docker compose logs db 2>&1 | grep -o "database system is ready to accept connections")" ]; do sleep 1; echo "Waiting for database to be ready"; done;
	@echo "Database ready"

db_migrated: docker_up api_node_modules_installed
	cd ./packages/api && npm run migrate:make:dev

api_node_modules_installed:
	cd ./packages/api && npm install
api_node_modules_cleaned:
	@rm -rf packages/api/node_modules

webapp_node_modules_installed:
	cd ./packages/webapp && pnpm install
webapp_node_modules_cleaned:
	@rm -rf packages/webapp/node_modules

setup_api: api_env_file db_migrated api_node_modules_installed
setup_webapp: webapp_env_file  webapp_node_modules_installed
setup: setup_api setup_webapp

clean: api_node_modules_cleaned webapp_node_modules_cleaned db_dropped

reset: clean
	@$(MAKE) setup

serve_api: setup_api
	rm -rf packages/api/logs
	cd packages/api && npm run nodemon

serve_webapp: setup_webapp
	cd packages/webapp && pnpm run dev


