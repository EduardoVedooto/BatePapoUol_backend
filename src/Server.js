import express from "express";
import cors from "cors";
import Load from "./utils/Load.js";
import Save from "./utils/Save.js";
import dayjs from "dayjs";
// import { strict as assert } from "assert";
// import { stripHtml } from "string-strip-html";

const filePath = "./data.json";

const App = express();
App.use(cors());
App.use(express.json());

setInterval(() => RemoveParticipant(), 25000);

const RemoveParticipant = () => {
    const data = Load(filePath);
    data.participants.forEach((participant, index) => {
        console.log("Chegou aqui");
        if (Date.now() - 12000 > participant.lastStatus) {
            console.log("excluído");
            data.participants.splice(index, 1);
            Save(data, filePath);
        }
    });
}

App.post("/participants", (req, res) => {
    const body = req.body;
    const data = Load(filePath);
    if (data.participants.find(participant => participant.name === body.name.trim())) {
        App.status(400);
        return;
    }
    data.participants.push({
        "name": body.name.trim(),
        "lastStatus": Date.now()
    });
    data.messages.push({
        from: body.name,
        to: 'Todos',
        text: 'entra na sala...',
        type: 'status',
        time: dayjs().format("HH:mm:ss")
    })
    Save(data, filePath);
    res.sendStatus(200);
});

App.get("/participants", (req, res) => {
    const data = Load(filePath);
    res.send(data.participants);
});

App.get("/messages", (req, res) => {
    const data = Load(filePath);
    const limit = req.query.limit;
    const user = req.headers.use;
    const messagesToSend = [];
    const condition = limit ? limit > data.messages.length ? data.messages.length : limit : data.messages.length;
    for (let i = 0; i < condition; i++) {
        if (data.messages[i].from === user ||
            data.messages[i].to === user ||
            data.messages[i].to === "Todos") {
            messagesToSend.push(data.messages[i]);
        }
    }
    res.status(200).send(messagesToSend);
});

App.post("/messages", (req, res) => {
    const data = Load(filePath);
    const newMessage = {
        "from": req.headers.user,
        ...req.body,
        "time": dayjs().format("HH:mm:ss")
    };
    data.messages.push(newMessage);
    Save(data, filePath);
    res.status(200);
});

App.post("/status", (req, res) => {
    console.log("status atualizado");
    const data = Load(filePath);
    const participant = data.participants.find(p => p.name === req.headers.user);
    console.log(participant);
    if (!participant) {
        res.status(400);
        return;
    }
    participant.lastStatus = Date.now();
    Save(data, filePath);
    res.status(200);
});

App.listen(4000, () => console.log("Running server..."));