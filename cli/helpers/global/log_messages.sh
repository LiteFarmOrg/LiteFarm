#!/bin/bash
#
# FORMATTED MESSAGES
#
lftitle() { echo -e "$(lfprefix) $(lftitlestyle "$@")";}
lfsubtitle() { echo -e "$(lfprefix) $(lfsubtitlestyle "$@")"; }
lfmsg() { echo -e "$(lfprefix) $(lfmsgstyle "$@")"; }

# Dedicated debug helper for development, makes it easier to see, find and clean after
lfdebug() { echo -e "$(lfdebugstyle "[Debug]") $@" >&2; } # use stderr to avoid polluting stdout


# LOG MESSAGES
#
# Only shown when LITEFARM_VERBOSE == true
# Log messages are classified as diagnostic output and redirected to stderr
# https://unix.stackexchange.com/a/331620
#
# This is important to avoid polluting stdout, eg:
#   services="$(lfcli -v compose config --services)"
#   echo "$services" # Does not include log messages in captured output
#
lflog() {
  ! $LITEFARM_VERBOSE && return # Only log if verbose
  local msg cmds=($lf_call_trace)

  # Indent command name based on call trace depth
  local indent n; for (( n=0; n<$((${#cmds[@]} - 1)); n++)); do
    indent+=" "
  done

  # Align message 20 chars after cmd name in and redirect log output to stderr
  echo -e "$(printf "%s %-20s %s" "$(lfprefix)" "$indent$(lftitlestyle ${cmds[-1]})" "$(lfmsgstyle "$@")")" >&2
}

# Special log style for logging called commands
lflog_and_run() { lflog_cmd "$@"; "$@"; }


# INTERNAL HELPERS
#
lflog_cmd() { lflog $(lfcmdstyle $(lf_escape_cmd "$@")); }
# Escape special characters for displaying commands in a format that can be reused as input
lf_escape_cmd() { local str="$(printf '%q ' "$@")"; echo "${str::-1}"; }
# Special log style for lfcli call log, only shown for nested calls
lflog_cli_call() { [ -n "$lf_call_trace" ] && lflog "$(lfclistyle $(lf_escape_cmd lfcli "$@"))"; }

# Text formats
lftitlestyle() { echo -e "$lfbold$@$lfnormal"; }
lfsubtitlestyle() { echo -e "$lfbold$lfblue$@$lfnormal"; }
lfmsgstyle() { echo -e "$lfblue$@$lfnormal"; }
lfcmdstyle() { echo -e "$lfnormal$@"; }
lfclistyle() { echo -e "$lfgreen$@$lfnormal";}
lferrorstyle() { echo -e "$lfbold$lfred$@$lfnormal"; }
lfdebugstyle() { echo -e "$lfbold$lfblue$@$lfnormal"; }
lfprefix() { ${1-lfclistyle} "[lfcli]"; }
lfnormal='\033[0m'
lfbold='\033[1m'
lfblue='\e[34m'
lfgreen='\e[36m'
lfred='\e[31m'
