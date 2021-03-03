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
        const { doorbells: doorbellsConfig } = config || {};
        this.accessoriesArray = doorbellsConfig.map(d => new Doorbell(d, Service, Characteristic, log));
        this.doorbells = this.accessoriesArray.reduce((acc, curr) => ({...acc, [curr.id]: curr}), {});

        this.server = http.createServer((req, res) => {
            const { url } = req || {};
            const [, bellId] = url.match(/\/([a-zA-Z0-9]+)/) || [];
            const isOK = this.handleRequest(bellId);
            res.end(isOK ? 'OK' : 'FAIL');
        });

        this.server.listen(2501, () => {
            this.log('doorbells is listening to port 2501');
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

/*const a = new HTTPDoorbell(console.log, {
    doorbells: [
        {
            name: 'Test Name',
            id: 'test',
            debounce: 2
        }
    ]
});*/


module.exports = api => {
    api.registerPlatform('http-doorbell-v3', HTTPDoorbell);
};
