import fs from "fs";

// Read your Firebase service account JSON file
const serviceAccount = fs.readFileSync("./serviceAccount.json", "utf8");

// Convert the file to Base64
const base64 = Buffer.from(serviceAccount).toString("base64");

// Output the Base64 string
console.log("\n🔥 Copy the line below and paste it into your .env.local file:\n");
console.log(`FIREBASE_SERVICE_ACCOUNT_B64=${base64}`);
