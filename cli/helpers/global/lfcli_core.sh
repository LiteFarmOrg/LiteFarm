#!/bin/bash
lfcli() {
  lflog_cli_call "$@"

  local cmd="$1" && shift
  [ -z "$cmd" ] && lfraise "No command provided, see help"

  local cmd_file="$(lf_get_cmd_file "$cmd")"
  [ -z "$cmd_file" ] && lfraise "Unknown $(lf_cmd_type "$cmd"): $cmd. See help"

  if lf_is_opt "$cmd"; then
    lf_call_opt_and_continue "$cmd_file" "$@"
  else
    lf_call_cmd "$cmd" "$cmd_file" "$@"
  fi
}

# Get corresponding script file for command or option
lf_get_cmd_file() { local dirs; lf_get_cmd_dirs dirs; find "${dirs[@]}" -mindepth 1 -type f -name "$1" -print -quit; }
lf_is_opt() { [ "${1:0:1}" == - ]; } # Command argument is an option if starts with -
lf_cmd_type() { lf_is_opt "$1" && echo option || echo command; }

# Source options script in a subshell, then call lfcli again without option, pass call trace without exporting
lf_call_opt_and_continue() { ( lf_call_trace="$(lf_get_call_trace "$cmd")" source "$@"; lfcli "${@:2}" ); }

# Call script in an subshell with its own isolated call trace
# This ensures it will only have access to exported variables and functions
# https://stackoverflow.com/a/51903792
lf_call_cmd() {
  local cmd="$1" file="$2" args=("${@:3}")

  if [[ "$(realpath --relative-to="$LITEFARM_CLI_COMMANDS_DIR" "$file")" == "docker"* ]] && \
    ! docker ps > /dev/null 2>&1; then
    lfraise "Start docker service to run a docker command"
  fi

  if [ -x "$file" ]; then
    ( export lf_call_trace="$(lf_get_call_trace "$cmd")" && "$file" "${args[@]}" )
  else
    lfraise "Command file missing executable permissions. Add with:\n  chmod +x \"$file\""
  fi
}

# Store call trace in a space separated string as arrays cannot be exported
lf_get_call_trace() { [ -n "$lf_call_trace" ] && local sep=" "; echo "$lf_call_trace$sep$1"; }

# Assign the commands directories array to a given variable.
# As arrays cannot be exported we instead export a function that builds the array on demand.
# The order of the command directories determines priority in case of duplicate cmds
# Having the core commands last makes it possible to overwrite commands
lf_get_cmd_dirs() {
  declare -n assign_ref="$1"
  [ -n "$LITEFARM_USER_COMMANDS_DIR" ] && assign_ref+=("$LITEFARM_USER_COMMANDS_DIR")
  assign_ref+=("$LITEFARM_CLI_COMMANDS_DIR")
}
