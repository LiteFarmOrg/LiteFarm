#!/bin/bash
# Show info about all scripts in the subdirs of a commands directory
help_cmds_dir() {
  local msg cmds_dir="$1" find_opts=("${@:2}")
  get_subdirs_with_files subdirs "$cmds_dir" "${find_opts[@]}"
  [ -z "${subdirs[*]}" ] && return 1

  for subdir in "${subdirs[@]}"; do
    msg+="$(help_cmds_subdir "$cmds_dir" "$subdir" "${find_opts[@]}")"
    [ "$subdir" != "${subdirs[-1]}" ] && msg+='\n\n' # Add line break unless last
  done

  echo -e "$msg"
}

help_cmds_subdir() {
  local relpath files file msg cmds_dir="$1" subdir="$2" find_opts=("${@:3}")
  relpath=" $(get_subdir_relpath "$cmds_dir" "$subdir")"
  [ $? == 0 ] && msg+="$(lfsubtitlestyle "$relpath")\n"

  get_files_in_subdir files "$subdir" "${find_opts[@]}"

  for file in "${files[@]}"; do
    msg+="  $(help_cmds_subdir_file "$file")"
    [ "$file" != "${files[-1]}" ] && msg+='\n' # Add newline unless last
  done

  echo -e "$msg"
}

help_cmds_subdir_file() {
  local file="$1" cmd="$(basename "$file")"
  local comment="$(get_cmd_file_docs_name_description "$file")"
  printf "%-15s %s" "$cmd" "$comment" # align comment 15 chars in
}

# Show docs for specific commands
help_specific_cmds() {
  local cmd msg cmd_dirs cmds=("$@"); lf_get_cmd_dirs cmd_dirs

  for cmd in "${cmds[@]}"; do
    local file="$(lf_get_cmd_file "$cmd")"
    local cmds_dir="$(get_file_cmds_dir "$file" "${cmd_dirs[@]}")"
    local relpath="$(get_subdir_relpath "$cmds_dir" "$(dirname "$file")")"
    [ -n "$relpath" ] && relpath+="/"
    msg+="$(lfsubtitlestyle "$relpath$cmd")\n"

    if [ -n "$file" ]; then
      msg+="$(get_pretty_cmd_file_docs "$file")"
      [ "$cmd" != "${cmds[-1]}" ] && msg+="\n\n" # Add newline unless last
    else
      lfraise "Command not found: $cmd"
    fi
  done

  echo -e "$msg"
}

# Show docs from command file, defined between docmarks: #####
get_cmd_file_docs() {
  local file="$1"
  local docmark_lines=($(grep -n '^#####' "$file" | cut -d : -f1))
  local start=${docmark_lines[0]} end=${docmark_lines[1]}

  if [ -n "$start" ] && [ -n "$end" ] && [ "$start" != "$end" ]; then
    start=$(($start + 1)); end=$(($end - 1)) # avoid mark lines
    sed -n "${start},${end}p" "$file" | sed -E 's/^ *# {0,1}//g' # rm preceeding hash/space
  fi
}
# Docs with bold titles
get_pretty_cmd_file_docs() { get_cmd_file_docs "$1" | sed "s/^[A-Z_]\+[A-Z_ ]*$/\\$lfbold&\\$lfnormal/"; }

# Get NAME line description from docs and rm any cmd/opt name (sed) and trailing whitespace (xargs)
get_cmd_file_docs_name_description() {
  local file="$1"
  local docs="$(get_cmd_file_docs "$file")"
  local name_line_nr="$(echo "$docs" | grep -n '^NAME' | cut -d : -f1)"
  [ -n "$name_line_nr" ] || return 1
  local desc="$(echo "$docs" | sed -n "$(($name_line_nr + 1))p" | sed -E 's/^ *[a-zA-Z_-]* *-//g' | xargs)"
  echo -e "${desc^}" # Upcase first character
}

# Get relative path description
get_subdir_relpath() {
  local relpath relto="$1" path="$2"
  if [ "$relto" != "$LITEFARM_CLI_COMMANDS_DIR" ]; then
    relto="$(dirname "$1")" # Include commands dir name for non core command dirs
  elif [ "$path" == "$LITEFARM_CLI_COMMANDS_DIR" ]; then
    return 1 # Omit relpath for root core commands
  fi

  realpath --relative-to="$relto" "$2"
}

# Output dir from dirs ${@:2} if dir is parent of file $1
get_file_cmds_dir() { local dir; for dir in "${@:2}"; do [[ "$1" == "$dir"* ]] && echo "$dir" && return; done; }
# Store result to arr $1, find all files in $2, add find ops ${@:3}, print path to file dir with null char sep %h\0, sort with null char sep and filter unique
get_subdirs_with_files() { readarray -d '' "$1" < <(find "$2" "${@:3}" -type f -printf "%h\0" | sort -zu); }
# Store result to arr $1, find all direct child files in $2, add find_opts "${@:3}", sep by null char -print0, sort with null char sep and filter unique
get_files_in_subdir() { readarray -d '' "$1" < <(find "$2" -mindepth 1 -maxdepth 1 "${@:3}" -type f -print0 | sort -zu); }
