import express from "express";
import cors from "cors";
import Load from "./utils/Load.js";
import Save from "./utils/Save.js";

const filePath = "./data.json";

const App = express();
App.use(cors());
App.use(express.json());

App.post("/participants", (req, res) => {
    const body = req.body;
    const data = Load(filePath);
    data.participants.push({
        ...body,
        "lastStatus": Date.now()
    });
    Save(data, filePath);
    res.sendStatus(200);
});

App.listen(4000, () => console.log("Running server..."));