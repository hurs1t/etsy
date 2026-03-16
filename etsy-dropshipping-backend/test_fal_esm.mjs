import { fal } from '@fal-ai/client';
import * as dotenv from 'dotenv';
dotenv.config();

async function testFal() {
    const falKey = process.env.FAL_KEY;
    console.log(`Checking Fal Key: ${falKey ? 'Present' : 'Missing'}`);

    if (!falKey) {
        console.error("No FAL_KEY found in .env");
        return;
    }

    try {
        console.log("Configuring Fal...");
        // In @fal-ai/client, config is usually not required if FAL_KEY env is set, but let's try
        fal.config({
            credentials: falKey
        });

        console.log("Sending test request to Fal.ai ESRGAN...");
        const response = await fal.subscribe('fal-ai/esrgan', {
            input: {
                image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop",
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === 'IN_PROGRESS' && update.logs) {
                    update.logs.map((log) => log.message).forEach(console.log);
                }
            },
        });

        console.log("Success! Result:", JSON.stringify(response, null, 2));
    } catch (error) {
        console.error("Fal.ai Error:", error.message);
        console.error(error);
        if (error.response) {
            console.error("Response Data:", await error.response.text());
        }
    }
}

testFal();
