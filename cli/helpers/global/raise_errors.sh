#!/bin/bash
# Standard argument error
lfraise() {
  echo -e "$(lfprefix lferrorstyle) $@" && exit 1
}

lfraise_invalid_arg() {
  lfraise "Invalid argument: $@"
}
