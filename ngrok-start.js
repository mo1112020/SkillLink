const { exec } = require('child_process');

// Function to run ngrok
function runNgrok(port) {
    const ngrok = exec(`ngrok http ${port}`);
    
    ngrok.stdout.on('data', (data) => {
        console.log(`Ngrok (Port ${port}):`, data);
    });

    ngrok.stderr.on('data', (data) => {
        console.error(`Ngrok Error (Port ${port}):`, data);
    });

    return ngrok;
}

console.log('Starting ngrok for ports 3000 and 3001...');

// Run ngrok for both ports
const ngrok3000 = runNgrok(3000);
const ngrok3001 = runNgrok(3001);

// Handle process termination
process.on('SIGINT', () => {
    console.log('Shutting down ngrok instances...');
    ngrok3000.kill();
    ngrok3001.kill();
    process.exit();
});
