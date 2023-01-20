const path = require('path')
const crypto = require("crypto")
const {TextEncoder} = require("util")
const sqlite = require("sqlite3")
const base64 = require("base64-js")
const fastify = require("fastify")({
    logger: false,
    bodyLimit: 10 * 1024
});

const {Storage} = require("./src/storage")


process.on('uncaughtException', function (exception) {
    console.log(exception);
});

fastify.register(require('@fastify/compress'))
fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'site')
})

const CRYPTO_ALG = "aes-256-cbc"
const ENCODER = new TextEncoder()

const config = {
    DB: process.env.PRIVFORM_DB,
    ACCESS_KEY: base64.toByteArray(process.env.ACCESS_KEY),
}

const db = new sqlite.Database(config.DB);
const storage = new Storage(db);
storage.init();

fastify.setNotFoundHandler((request, reply) => {
    reply.sendFile("404.html")
})

fastify.setErrorHandler((error, request, reply) => {
    console.log(`Error serving '${request.url}'`)
    console.log(error)
    reply.sendFile("error.html")
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

fastify.get("/forms/*", (request, reply) => {
    reply.sendFile("form.html")
})

fastify.get("/manage/*", (request, reply) => {
    reply.sendFile("manage.html")
})

fastify.get("/api/forms/:form_id", (request, reply) => {
    let formId = request.params["form_id"];
    storage.getForm(formId)
        .then(({active, pubkey, content}) => {
            if (active) {
                reply.status(200).send({
                    pub_key: pubkey,
                    form_content: content
                })
            } else {
                reply.status(404).send()
            }
        })
        .catch(err => {
            console.log(`Failed to get form for '${formId}'`)
            console.log(err)
            reply.status(500).send()
        });
})

fastify.post("/api/forms/:form_id", (request, reply) => {
    let formId = request.params["form_id"];

    let body;
    try {
        body = JSON.parse(request.body)
    } catch (err) {
        console.log(`Error parsing body for '${formId}' request`)
        console.log(err)
        reply.status(400).send({error: "Couldn't parse body as JSON"})
        return
    }

    storage.saveEntry(formId, request.ip, body.submission)
        .then(() => reply.status(204).send())
        .catch(err => {
            console.log(`Failed to save entry for '${formId}'`)
            console.log(err)
            reply.status(500).send()
        })
})

fastify.get("/api/results/:form_id", (request, reply) => {
    let formId = request.params["form_id"];
    let token = request.headers["authorization"]
    if (!token) {
        reply.status(401).send()
        return
    } else {
        token = token.replace("Bearer ", '')
    }

    storage.getForm(formId)
        .then(async ({accessKey, active, iv}) => {
            if (active) {
                const rawIv = base64.toByteArray(iv)
                const cipher = crypto.createCipheriv(CRYPTO_ALG, config.ACCESS_KEY, rawIv);
                let encrypted = cipher.update(token, "utf-8", "hex");
                encrypted += cipher.final("hex");
                if (crypto.timingSafeEqual(ENCODER.encode(encrypted), ENCODER.encode(accessKey))) {
                    const entries = await storage.getEntries(formId)
                    if (entries) {
                        reply.status(200).send(entries)
                    } else {
                        reply.status(404).send()
                    }
                } else {
                    reply.status(401).send()
                }
            } else {
                reply.status(404).send()
            }
        })
        .catch(err => {
            console.log(`Failed to get form for '${formId}'`)
            console.log(err)
            reply.status(500).send()
        });
})

fastify.get("/health", (request, reply) => reply.status(200).send())

fastify.listen({port: config.port, host: config.host}, function (err, address) {
    if (err) {
        fastify.log.error(err);
        console.log(err)
        process.exit(1);
    }

    console.log(`Listening on ${address}`);
});
