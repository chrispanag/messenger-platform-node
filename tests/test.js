const { FB }  = require('..');
const test = new FB('', '');
test.insights().then(rsp => console.log(rsp.data))
