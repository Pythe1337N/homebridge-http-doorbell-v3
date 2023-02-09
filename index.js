const http = require('http');
const Doorbell = require('./Doorbell');
const ContactSensor = require('./ContactSensor');

class HTTPDoorbell {

    constructor(log, config, api) {
        this.log = log;
        const { hap } = api || {};
        const {
            Service,
            Characteristic
        } = hap || {};
        const {
            doorbells: doorbellsConfig = [],
            contactsensors: contactSensorsConfig = [],
            port = 9090
        } = config || {};
        this.doorbellsArray = doorbellsConfig.map((d, i) => new Doorbell(d, i, Service, Characteristic, log));
        this.doorbells = this.doorbellsArray.reduce((acc, curr) => ({...acc, [curr.id]: curr}), {});
        this.contactSensorsArray = contactSensorsConfig.map((d, i) => new ContactSensor(d, i, Service, Characteristic, log));
        this.contactSensors = this.contactSensorsArray.reduce((acc, curr) => ({...acc, [curr.id]: curr}), {});

        //this combines two arrays into one
        this.accessoriesArray = this.doorbellsArray.concat(this.contactSensorsArray);
        // this.log('accessoriesArray', this.accessoriesArray);

        this.server = http.createServer((req, res) => {
            const { url } = req || {};
            // this.log(`Received request for ${url}`)
            const {path, query} = this.parseURL(url);
            const urlparams = this.parseQueryParams(query);
            // this.log('urlparams', urlparams);
            // this assigns to value the value of the key "value" in the urlparams object
            const { ["value"]: value} = urlparams || {};
            const [, deviceId] = path.match(/\/([a-zA-Z0-9]+)/) || [];
            this.log(`Device ID: ${deviceId}, value: ${value}`);
            const isOK = this.handleRequest(deviceId, value);
            const response = { success: isOK };
            if (isOK) {
                res.end(JSON.stringify(response));
            } else {
                res.statusCode = 404;
                res.end(JSON.stringify(response));
            }
        });

        this.server.listen(port, () => {
            this.log(`Doorbells server is listening to port ${port}`);
        });
    }

    handleRequest(deviceId, value) {
        const { [deviceId]: bell } = this.doorbells || {};
        const { [deviceId]: contactSensor } = this.contactSensors || {};
        if (bell) {
            return bell.ring();
        };
        if (contactSensor) {
            return contactSensor.applyState(value);
        };
        return false;
    }

    //function that splits URL into host, path and query
    parseURL(url) {
        if (url == null) {
            return null;
        }
        const [path, query] = url.split('?');
        return { path, query };
    }

    //function parses query string into parameter/value pairs
    parseQuery(query) {
        if (query == null) {
            return null;
        }
        const params = query.split('&');
        const paramArray = params.map(param => {
            const [key, value] = param.split('=');
            return { key, value };
        });
        return paramArray;
    }

    //function parses query parameters into an object
    parseQueryParams(query) {
        if (query == null) {

            return null;
        }
        const params = query.split('&');
        const paramArray = params.map(param => {
            const [key, value] = param.split('=');
            return { key, value };
        });
        return paramArray.reduce((acc, curr) => ({...acc, [curr.key]: curr.value}), {});
    }

    accessories(callback) {
        callback(this.accessoriesArray);
    }
}

module.exports = api => {
    api.registerPlatform('http-doorbell-v3', HTTPDoorbell);
};
