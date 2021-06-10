import fs from "fs";

export default function Load(filePath) {
    const fileBuffer = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(fileBuffer);
}
