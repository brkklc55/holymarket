try {
    console.log("Loading hardhat...");
    const hre = require("hardhat");
    console.log("Hardhat loaded successfully.");
} catch (e) {
    console.error("Failed to load hardhat:", e);
}
