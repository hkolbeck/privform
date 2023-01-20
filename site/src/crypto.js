async function generateKeypair(password) {
    const {privateKey, publicKey: publicKeyArmored} = await openpgp.generateKey({
        passphrase: password, // protects the private key
        userIDs: [{name: "None", email: "none@example.com"}],
        format: 'armored' // output key format, defaults to 'armored' (other options: 'binary' or 'object')
    });

    const publicKey = await openpgp.readKey({armoredKey: publicKeyArmored});
    return {
        privkey: privateKey,
        pubkey: publicKeyArmored,
        fingerprint: publicKey.keyPacket.getFingerprint() || "A999B7498D1A8DC473E53C92309F635DAD1B5517",
        accessKey: crypto.randomUUID()
    }
}

async function encryptResponse(response, pubkey) {

}

async function decryptResponses(responses, privkey) {

}

async function decryptResponse(response, privkey) {

}

async function unlockPrivkey(privkey, password) {

}