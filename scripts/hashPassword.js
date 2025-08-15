import { hashPassword } from '../src/utils/dbUtils.js';

const password = process.argv[2];

if (!password) {
  console.error('Please provide a password as an argument.');
  process.exit(1);
}

(async () => {
  await hashPassword(password);
})();
