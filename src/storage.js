class Storage {
    #db;

    constructor(db) {
        this.#db = db;
    }

    async getForm(formId) {
        return new Promise((resolve, reject) => {
            this.#db.get('SELECT active, pub_key FROM forms WHERE id = ?', [formId], (err, row) => {
                if (err) {
                    reject(err)
                } else if (!row) {
                    resolve(null)
                } else {
                    resolve({active: row.active, pubkey: row.pub_key})
                }
            })
        })
    }

    async saveEntry(formId, ip, blob) {
        return new Promise((resolve, reject) => {
            this.#db.run('INSERT INTO entries (form_id, ip, submission) VALUES (? ? ?)', [formId, ip, blob], (result, err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }

    async getEntries(formId) {
        return new Promise((resolve, reject) => {
            this.#db.all('SELECT submission FROM entries WHERE form_id = ?', [formId], (err, rows) => {
                if (err) {
                    reject(err)
                } else if (!rows) {
                    resolve([])
                } else {
                    let blobs = rows.map(row => row.submission)
                    resolve(blobs)
                }
            })
        })
    }

    async deleteEntries(formId) {
        return new Promise((resolve, reject) => {
            this.#db.run('DELETE FROM entries WHERE form_id = ?', [formId], (result, err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }

    init() {
        this.#db.run('CREATE TABLE IF NOT EXISTS forms (id TEXT PRIMARY KEY, display_name TEXT, active BOOLEAN, pub_key BLOB NOT NULL);')
        this.#db.run('CREATE TABLE IF NOT EXISTS entries (form_id TEXT, ip TEXT, submission BLOB NOT NULL, PRIMARY KEY (form_id, ip));')
    }
}

exports.Storage = Storage;