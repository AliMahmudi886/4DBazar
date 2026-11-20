import webPush from "web-push";

const keys = webPush.generateVAPIDKeys();

console.log("VAPID keys generated. Keep VAPID_PRIVATE_KEY secret and do not commit it.");
console.log("");
console.log("Add these values to D:\\Projects\\4D\\.env:");
console.log("");
console.log(`VITE_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log("VAPID_SUBJECT=mailto:admin@4d.local");
console.log("");
console.log("Then restart both API and Web dev servers.");
