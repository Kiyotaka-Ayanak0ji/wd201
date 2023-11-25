const readline = require('readline');
// Main code
const lineDetail = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

lineDetail.question('Please provide your name - ', name => {
	console.log(`Hi ${name}!`);
	lineDetail.close();
});
