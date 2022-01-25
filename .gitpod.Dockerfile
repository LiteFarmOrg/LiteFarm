FROM gitpod/workspace-full

USER gitpod
RUN sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list' && \
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add - && \
    sudo apt-get -q update && \
    sudo apt-get -y install postgresql

USER postgres 
RUN service postgresql start && \
    psql -c 'CREATE DATABASE "pg-litefarm";' && \
    psql -c "CREATE DATABASE test_farm;" && \
    psql -c "ALTER ROLE postgres WITH PASSWORD 'postgres';"

USER gitpod
RUN npx lerna bootstrap 
