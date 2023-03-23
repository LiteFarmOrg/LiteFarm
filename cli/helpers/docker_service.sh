#!/bin/bash
# Validate service available in project
validate_service() {
  lflog "Validating services: $@"
  local services=("$@") available_services=($(lfcli compose config --services))
  validate_supported_service "${services[*]}" "${available_services[*]}" available
}

# Validate project service running
validate_service_running() {
  lflog "Validating services running: $@"
  local services=("$@") running_services=($(lfcli compose ps --services))
  validate_supported_service "${services[*]}" "${running_services[*]}" running
}

# Validate that services are present in supported services
# Requires two strings containing space separated service lists
# Accepts an optional third argument to describe the supported services
validate_supported_service() {
  local error service services=($1) supported_services=($2) description="${3-supported}"
  local supported_services_msg="${description^} services: ${supported_services[@]}"
  [ "${#supported_services[@]}" == 0 ] && error="No $description services"
  [ "${#services[@]}" == 0 ] && error="No service provided. $([ -n "$error" ] && echo "$error" || echo "$supported_services_msg")"
  [ -n "$error" ] && lfraise "$error"

  for service in ${services[@]}; do
    if [[ " ${supported_services[*]} " != *" $service "* ]]; then
      lfraise "Service not $description: $service. $supported_services_msg"
    fi
  done; return
}

# Build docker-compose file that overwrites startup command
# with the idle cmd for each specified service eg:
#
# services:
#   $service:
#     command: $idle_cmd
#   ...
#
# Returns path to built file in stdout
#
# Example use:
#   idle_yml="$(build_idle_yml web api)"
#   docker-compose -f docker-compose.base.yml -f "$idle_yml"
#
build_idle_yml() {
  [ $# == 0 ] && lfraise "No service provided"
  local services=("$@")
  lflog "Building docker-compose.idle.yml for services: ${services[@]}"
  local idle_msg="[lfcli] Started idle"
  local idle_cmd="sh -c \"echo $idle_msg && tail -f /dev/null\""
  local output_file="$LITEFARM_CLI_BUILD_DIR/docker-compose.idle.yml"

  local service content="services:"
  for service in "${services[@]}"; do
    content+="
  ${service}:
    command: $idle_cmd"
  done

  # Ensure build dir created and build file
  mkdir -p "$LITEFARM_CLI_BUILD_DIR"
  echo -e "$content" > "$output_file"

  echo "$output_file"
}
