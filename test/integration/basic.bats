#!/usr/bin/env bats
load ../setup/bats_helpers

ensure_npm

setup() {
  eval_once_on_setup 'setup_single_directory'
  eval_once_on_setup 'copy_node_modules'
  eval_once_on_setup 'install_this_module'
}


@test "... test setup ..." {
  # noop
}

@test "basic usage" {
  gulp build
}
