const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync('SuperAdmin123!', salt);
console.log("Hash bcrypt pour 'SuperAdmin123!':");
console.log(hash); 