const { readFileSync } = require('fs');
const path = require('path');

const allowedLicenses = new Set(['MIT', 'Apache-2.0', 'BSD-3-Clause', 'ISC']);

function ensureLicense(field, context) {
  if (!allowedLicenses.has(field)) {
    throw new Error(`${context} uses a license (${field}) that is not in the allowed list (${[...allowedLicenses].join(', ')})`);
  }
}

const pkgPath = path.resolve(__dirname, '..', 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
if (!pkg.license) {
  throw new Error('Root package.json must have a license field');
}
ensureLicense(pkg.license, 'root package');

const lockPath = path.resolve(__dirname, '..', 'package-lock.json');
if (require('fs').existsSync(lockPath)) {
  const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
  const packages = lock.packages || {};
  const violations = [];
  Object.entries(packages).forEach(([pkgName, pkgMeta]) => {
    if (pkgMeta && typeof pkgMeta.license === 'string' && pkgMeta.license.includes('UNLICENSED')) {
      violations.push(pkgName);
    }
  });
  if (violations.length) {
    throw new Error(`Packages marked UNLICENSED detected: ${violations.join(', ')}`);
  }
}

console.log('License verification passed');
