workspace(name = "angular_material")

###############################################################################
# Transitive deps
###############################################################################

# rules_nodejs depends on skylib (common functions/utilities for Skylark)
http_archive(
  name = "bazel_skylib",
  urls = ["https://github.com/bazelbuild/bazel-skylib/archive/0.3.1.zip"],
  strip_prefix = "bazel-skylib-0.3.1",
  sha256 = "95518adafc9a2b656667bbf517a952e54ce7f350779d0dd95133db4eb5c27fb1",
)

# rules_typescript depends on gazelle (BUILD generator for Go)
http_archive(
  name = "bazel_gazelle",
  urls = ["https://github.com/bazelbuild/bazel-gazelle/releases/download/0.13.0/bazel-gazelle-0.13.0.tar.gz"],
  sha256 = "bc653d3e058964a5a26dcad02b6c72d7d63e6bb88d94704990b908a1445b8758",
)

# rules_typescript depends on webtesting for its own testing rules.
http_archive(
  name = "io_bazel_rules_webtesting",
  url = "https://github.com/bazelbuild/rules_webtesting/archive/0.2.1.zip",
  strip_prefix = "rules_webtesting-0.2.1",
  sha256 = "7d490aadff9b5262e5251fa69427ab2ffd1548422467cb9f9e1d110e2c36f0fa",
)

# rules_typescript depends on go (some of it is written in go).
http_archive(
  name = "io_bazel_rules_go",
  url = "https://github.com/bazelbuild/rules_go/releases/download/0.14.0/rules_go-0.14.0.tar.gz",
  sha256 = "5756a4ad75b3703eb68249d50e23f5d64eaf1593e886b9aa931aa6e938c4e301",
)

# rules_typescript depends on skydoc
# TODO(jelbourn): fix rules_typescript to not need this
http_archive(
  name = "io_bazel_skydoc",
  urls = ["https://github.com/bazelbuild/skydoc/archive/0ef7695c9d70084946a3e99b89ad5a99ede79580.zip"],
  strip_prefix = "skydoc-0ef7695c9d70084946a3e99b89ad5a99ede79580",
  sha256 = "491f9e142b870b18a0ec8eb3d66636eeceabe5f0c73025706c86f91a1a2acb4d",
)

###############################################################################
# Deps we actually use
###############################################################################

# Add nodejs rules
http_archive(
  name = "build_bazel_rules_nodejs",
  urls = ["https://github.com/bazelbuild/rules_nodejs/archive/0.11.3.zip"],
  strip_prefix = "rules_nodejs-0.11.3",
  sha256 = "e8842fa5f5e38f2c826167ff94323d4b5aabd13217cee867d971d6f860cfd730"
)

# NOTE: this rule installs nodejs, npm, and yarn, but does NOT install
# your npm dependencies. You must still run the package manager.
load("@build_bazel_rules_nodejs//:defs.bzl", "node_repositories")
node_repositories(package_json = ["//:package.json"])

# Add sass rules
http_archive(
  name = "io_bazel_rules_sass",
  url = "https://github.com/bazelbuild/rules_sass/archive/0.1.0.zip",
  strip_prefix = "rules_sass-0.1.0",
  sha256 = "b243c4d64f054c174051785862ab079050d90b37a1cef7da93821c6981cb9ad4",
)

load("@io_bazel_rules_sass//sass:sass_repositories.bzl", "sass_repositories")
sass_repositories()

# Add TypeScript rules. Use local_repository to add the rules from node_modules
# to get all of the transitive deps for rules_typescript (such as protobufjs).
local_repository(
  name = "build_bazel_rules_typescript",
  path = "node_modules/@bazel/typescript",
)

# Setup TypeScript Bazel workspace
load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace", "check_rules_typescript_version")
ts_setup_workspace()

# 0.16.0: tsc_wrapped uses user's typescript version & check_rules_typescript_version
check_rules_typescript_version("0.16.0")

# Add Angular rules (e.g. ng_module).
http_archive(
  name = "angular",
  url = "https://github.com/angular/angular/archive/6.1.2.zip",
  strip_prefix = "angular-6.1.2",
  sha256 = "e7553542cebd1113069a92d97a464a2d2aa412242926686653b8cf0101935617",
)

load("@angular//:index.bzl", "ng_setup_workspace")
ng_setup_workspace()

# Add rxjs
local_repository(
  name = "rxjs",
  path = "node_modules/rxjs/src",
)


# This commit matches the version of buildifier in angular/ngcontainer
# If you change this, also check if it matches the version in the angular/ngcontainer
# version in /.circleci/config.yml
BAZEL_BUILDTOOLS_VERSION = "fd9878fd5de921e0bbab3dcdcb932c2627812ee1"

