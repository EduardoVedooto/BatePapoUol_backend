import express from "express";
import cors from "cors";
import Load from "./utils/Load.js";
import Save from "./utils/Save.js";
import dayjs from "dayjs";

const filePath = "./data.json";

const App = express();
App.use(cors());
App.use(express.json());

setInterval(() => RemoveParticipant(), 25000);

const RemoveParticipant = () => {
    const data = Load(filePath);
    data.participants.forEach((participant, index) => {
        if (Date.now() - 10000 > participant.lastStatus) {
            data.participants.splice(index, 1);
            Save(data, filePath);
        }
    });
};

App.post("/status", (req, res) => {
    const data = Load(filePath);
    const participant = data.participants.find(p => p.name === req.headers.user);
    if (!participant) {
        res.sendStatus(400);
        return;
    }
    participant.lastStatus = Date.now();
    Save(data, filePath);
    res.sendStatus(200);

});

App.get("/participants", (req, res) => {
    const data = Load(filePath);
    res.send(data.participants);
});

App.post("/participants", (req, res) => {
    const body = req.body;
    const data = Load(filePath);
    if (data.participants.find(participant => participant.name === body.name.trim())) {
        res.sendStatus(400);
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

App.get("/messages", (req, res) => {
    const messages = Load(filePath).messages.reverse();
    const limit = req.query.limit;
    const user = req.headers.user;
    const messagesToSend = [];
    const condition = limit ? limit > messages.length ? messages.length : limit : messages.length;
    for (let i = 0; i < condition; i++) {
        if (messages[i].from === user ||
            messages[i].to === user ||
            messages[i].to === "Todos") {
            messagesToSend.push(messages[i]);
        }
    }
    res.status(200).send(messagesToSend.reverse());
});

App.post("/messages", (req, res) => {
    const data = Load(filePath);
    const newMessage = {
        "from": req.headers.user,
        ...req.body,
        "text": req.body.text.trim(),
        "time": dayjs().format("HH:mm:ss")
    };
    data.messages.push(newMessage);
    Save(data, filePath);
    res.sendStatus(200);
});

App.listen(4000, () => console.log("Running server..."));