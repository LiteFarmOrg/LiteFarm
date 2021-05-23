BASH=bash -l -c
SERVICE=nodejs
YMLFILE=docker-compose.dev.yml

build:
	docker-compose -f ${YMLFILE} build

build_no_cache:
	docker-compose -f ${YMLFILE} build --no-cache

up:
	docker-compose -f ${YMLFILE} up
