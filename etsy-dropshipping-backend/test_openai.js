require('dotenv').config();
const OpenAI = require('openai');

async function testOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error("Error: OPENAI_API_KEY is not defined in .env");
        process.exit(1);
    }
    console.log(`Checking API Key: ${apiKey.substring(0, 5)}...`);

    const openai = new OpenAI({ apiKey });

    try {
        console.log("Sending test request to OpenAI...");
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: "Hello, are you working?" }],
            model: "gpt-4o-mini",
        });
        console.log("Success! Response:", completion.choices[0].message.content);
    } catch (error) {
        console.error("OpenAI Error:", error.message);
        if (error.response) {
            console.error(error.response.data);
        }
    }
}

testOpenAI();
