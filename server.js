const path = require('path')
const sqlite = require("sqlite3")
const fastify = require("fastify")({
    logger: false,
});

const {Storage} = require("src/storage")

process.on('uncaughtException', function (exception) {
    console.log(exception);
});

fastify.register(require('@fastify/compress'))
fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'site')
})

const config = {
    DB: process.env.PRIVFORM_DB,
}

const db = new sqlite.Database(config.DB);
const storage = new Storage(db);
storage.init();

fastify.setNotFoundHandler((request, reply) => {
    console.log(`404: ${request.url}`)
    reply.sendFile("404.html")
})

const STATIC_PATHS = {
    "/": "index.html",
    "/keygen": "keygen.html",
    "/404": "404.html",

    "/robots.txt": "robots.txt",
    "/favicon.ico": "img/favicon.ico",
}

Object.entries(STATIC_PATHS).forEach(entry => {
    const [path, file] = entry
    fastify.get(path, (request, reply) => {
        reply.sendFile(file)
    });
})

fastify.get("/img/:image", (request, reply) => {
    reply.sendFile(request.url)
})

fastify.get("/style/:style", (request, reply) => {
    reply.sendFile(request.url)
})

fastify.get("/src/:script", (request, reply) => {
    reply.sendFile(request.url)
})

fastify.get("/api/forms/:form_id", (request, reply) => {
    
})

fastify.post("/api/forms/:form_id", (request, reply) => {

})

fastify.get("/api/results/:form_id", (request, reply) => {

})

fastify.delete("/api/results/:form_id", (request, reply) => {

})