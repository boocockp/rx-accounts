#!/usr/bin/env bash

COMPILED_DIR=./target
DIST_DIR=./dist
browserify $COMPILED_DIR/Account.js $COMPILED_DIR/AccountSummary.js \
    -r $COMPILED_DIR/GeneralLedger.js:general-ledger \
    -r $COMPILED_DIR/TrialBalance.js:trial-balance \
    -o $DIST_DIR/accounts.js