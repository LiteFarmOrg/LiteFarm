FROM gitpod/workspace-postgres

# After waking workspace, missing PG_VERSION file prevents Postgres server start, so modify GitPod's "hack": 
#   https://github.com/gitpod-io/workspace-images/blob/baa144a3292c13a17d56f38d7f67653edd59daf2/postgres/Dockerfile#L18
#   This can probably be removed at completion of https://github.com/gitpod-io/workspace-images/issues/644
RUN sed -i '$ d' ~/.bashrc && \
  printf "\n[[ \$(pg_ctl status 2> /dev/null | grep PID) ]] || (echo 12 > /workspace/.pgsql/data/PG_VERSION && pg_start > /dev/null)\n" >> ~/.bashrc
