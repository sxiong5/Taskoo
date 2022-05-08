const { getTasks } = require("../data/project");

const constructorMethod = (io) => {

    const accountSockets = {};

    io.on('connection', (socket) => {
        let accountId;
        socket.on('join', async (msg) => {
            accountId = msg.accountId;
            accountSockets[msg.accountId] = accountSockets[msg.accountId] ?? new Set();
            accountSockets[msg.accountId].add(socket.id);

            const data = await getTasks(msg.projectId);
            socket.emit("tasks", data);
        });
        socket.on('update', async (msg) => {
            const data = await getTasks(msg.projectId);
            socket.emit("tasks", data);
            console.log(data);
        });
        socket.on('disconnect', (msg) => {
            accountSockets[accountId].delete(socket.id);
            console.log(accountSockets);
        });
    });

};

module.exports = constructorMethod;