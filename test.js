const fs = require('fs');
const path = require('path');

// Import the logRequest function from server.js if possible
// const { logRequest } = require('./server'); // Uncomment if you export it

// Manually define the logging function if not exporting
const LOG_FILE_PATH = path.join(__dirname, '3-microservices', 'services', 'logging', 'db.json');

const logRequest = (ctx) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        method: ctx.method,
        url: ctx.url,
        ip: ctx.ip || "127.0.0.1", // Use default if not provided
        status: ctx.status || 200,
    };

    try {
        let logsData = { logs: [] }; // Default structure if file is empty or missing

        // Check if the file exists and has valid content
        if (fs.existsSync(LOG_FILE_PATH)) {
            const data = fs.readFileSync(LOG_FILE_PATH, 'utf8').trim();
            if (data) {
                const parsedData = JSON.parse(data);
                if (parsedData.logs && Array.isArray(parsedData.logs)) {
                    logsData = parsedData;``
                } else {
                    console.warn("⚠ Log file structure incorrect. Resetting...");
                }
            }
        }

        // Append new entry to the logs array
        logsData.logs.push(logEntry);

        console.log("✅ Appending log entry:", logEntry);

        // Write back to the file
        fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(logsData, null, 2), 'utf8');
    } catch (error) {
        console.error('❌ Error writing to log file:', error);
    }
};

// Generate mock request data
function generateRandomRequest() {
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const urls = ['/api/test1', '/api/test2', '/api/test3', '/api/test4'];

    return {
        method: methods[Math.floor(Math.random() * methods.length)],
        url: urls[Math.floor(Math.random() * urls.length)],
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`, // Random IP
        status: [200, 201, 400, 404, 500][Math.floor(Math.random() * 5)], // Random status
    };
}

// Run multiple test logs
console.log("🚀 Running logging tests...");
for (let i = 0; i < 5; i++) {
    const mockRequest = generateRandomRequest();
    logRequest(mockRequest);
}

// Read and verify log file
setTimeout(() => {
    console.log("\n📂 Checking log file...");

    if (fs.existsSync(LOG_FILE_PATH)) {
        const logs = JSON.parse(fs.readFileSync(LOG_FILE_PATH, 'utf8'));
        console.log("📝 Log file contents:", logs);
    } else {
        console.log("❌ Log file not found! Check path and permissions.");
    }
}, 1000);
