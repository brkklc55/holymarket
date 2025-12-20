require("dotenv").config();

console.log("Checking .env...");
if (process.env.PRIVATE_KEY) {
    console.log("PRIVATE_KEY is defined.");
    console.log("Length:", process.env.PRIVATE_KEY.length);
    console.log("Starts with 0x:", process.env.PRIVATE_KEY.startsWith("0x"));
} else {
    console.error("PRIVATE_KEY is NOT defined.");
}
