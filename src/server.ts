import app from "./app.js";
import config from "./config/index.js";
import { prisma } from "./lib/prisma.js";

const port = config.port;

async function main() {
    try {
        await prisma.$connect();
        console.log("Connected to the database successfully!!");
        app.listen(port, () => {
            console.log("Server is listening on port ", port);
        })
    } catch (error) {
        console.log("Error starting the server ", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();