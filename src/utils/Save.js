import fs from "fs";

export default function Save(data, filePath) {
    const dataString = JSON.stringify(data);
    return fs.writeFileSync(filePath, dataString);
}