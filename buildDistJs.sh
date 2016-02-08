#!/bin/bash

DIST_FILE=dist/accounts.js
echo Building distribution file $DIST_FILE

mkdir -p $(dirname $DIST_FILE)

node_modules/.bin/browserify -o $DIST_FILE \
  -r rx \
  -r lodash \
  -r ./target/GeneralLedger.js:general-ledger \
  -r ./target/TrialBalance.js:trial-balance
