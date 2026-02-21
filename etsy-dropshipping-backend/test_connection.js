const axios = require('axios');

async function testConnection() {
    try {
        console.log("Testing connection to http://localhost:3001/etsy/taxonomy...");
        const response = await axios.get('http://localhost:3001/etsy/taxonomy');
        console.log("Success! Status:", response.status);
        console.log("Data length:", response.data.length);
    } catch (error) {
        console.error("Connection failed:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else if (error.request) {
            console.error("No response received. Request was made.");
        }
    }
}

testConnection();
