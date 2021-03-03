const http = require('http');
const Doorbell = require('./Doorbell');

class HTTPDoorbell {

    constructor(log, config, api) {
        this.log = log;
        const { hap } = api || {};
        const {
            Service,
            Characteristic
        } = hap || {};
        const {
            doorbells: doorbellsConfig,
            port = 9090
        } = config || {};
        this.accessoriesArray = doorbellsConfig.map((d, i) => new Doorbell(d, i, Service, Characteristic, log));
        this.doorbells = this.accessoriesArray.reduce((acc, curr) => ({...acc, [curr.id]: curr}), {});

        this.server = http.createServer((req, res) => {
            const { url } = req || {};
            const [, bellId] = url.match(/\/([a-zA-Z0-9]+)/) || [];
            const isOK = this.handleRequest(bellId);
            if (isOK) {
                res.end('OK');
            } else {
                res.statusCode = 404;
                res.end('NO_BELL');
            }
        });

        this.server.listen(port, () => {
            this.log(`Doorbells server is listening to port ${port}`);
        });
    }

    handleRequest(bellId) {
        const { [bellId]: bell } = this.doorbells || {};
        if (bell) {
            return bell.ring();
        }
        return false;
    }

    accessories(callback) {
        callback(this.accessoriesArray);
    }
}

module.exports = api => {
    api.registerPlatform('http-doorbell-v3', HTTPDoorbell);
};
