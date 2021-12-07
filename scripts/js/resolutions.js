#!/usr/bin/env node

/**
 * This script is a helper for running a buidler based e2e unit test target and is
 * used in combination with the npm virtual publishing script.
 *
 * It discovers the current web3 package version, gets its minor increment
 * (also the value of the virtually published version) and attaches a yarn resolutions field
 * to the target's package.json to coerce any Web3 packages up when target is
 * installed.
 *
 * USAGE:    resolutions.js <target-folder-name>
 * EXAMPLE:  node scripts/js/resolutions.js mosaic-1
 *
 */
const fs = require("fs");
const path = require("path");

const semver = require("semver");
const web3PackagePath = path.join(process.cwd(), "original.package.json");
const targetPackagePath = path.join(
    process.cwd(),
    process.argv[2],
    "package.json"
);

const web3Package = require(web3PackagePath);
const targetPackage = require(targetPackagePath);

// Use version least likely to conflict with what's been
// published to npm. (Maps to `lerna version` command
// in e2e.npm.publish.sh)
const version = semver.inc(web3Package.version, "minor");

const web3Modules = [
    "@quainetwork/web3",
    "@quainetwork/web3-bzz",
    "@quainetwork/web3-core-helpers",
    "@quainetwork/web3-core-method",
    "@quainetwork/web3-core-promievent",
    "@quainetwork/web3-core-requestmanager",
    "@quainetwork/web3-core-subscriptions",
    "@quainetwork/web3-core",
    "@quainetwork/web3-eth-abi",
    "@quainetwork/web3-eth-accounts",
    "@quainetwork/web3-eth-contract",
    "@quainetwork/web3-eth-ens",
    "@quainetwork/web3-eth-iban",
    "@quainetwork/web3-eth-personal",
    "@quainetwork/web3-eth",
    "@quainetwork/web3-net",
    "@quainetwork/web3-providers-http",
    "@quainetwork/web3-providers-ipc",
    "@quainetwork/web3-providers-ws",
    "@quainetwork/web3-shh",
    "@quainetwork/web3-utils",
];

targetPackage.resolutions = {};

// Coerce every version of web3 in the sub-dependency tree to
// the virtually published version
for (const mod of web3Modules) {
    targetPackage.resolutions[`*/**/${mod}`] = version;
}

// Remove any outer-level web3 modules so yarn flat-packs a single
// set of web3 modules at the outerlevel
if (targetPackage.devDependencies) {
    for (const mod of web3Modules) {
        delete targetPackage.devDependencies[mod];
    }
}

if (targetPackage.dependencies) {
    for (const mod of web3Modules) {
        delete targetPackage.dependencies[mod];
    }
}

console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
console.log(`Yarn will resolve Web3 packages in "${process.argv[2]}"" to...`);
console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

console.log(JSON.stringify(targetPackage.resolutions, null, " "));

fs.writeFileSync(
    targetPackagePath,
    JSON.stringify(targetPackage, null, "    ")
);
