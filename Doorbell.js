class Doorbell {
    constructor(config, index, Service, Characteristic, log) {
        this.Service = Service;
        this.Characteristic = Characteristic;
        this.log = log;

        const {
            name,
            id,
            debounce,
            manufacturer,
            model,
            serialNumber,
        } = config;
        this.name = name;
        this.id = id || index;
        this.debounce = debounce || 2;
        this.manufacturer = manufacturer || 'Pythe1337N Inc.';
        this.model = model || 'Pythe1337N Doorbell';
        this.serialNumber = serialNumber || this.id;
        this.state = 0;
        this.busy = false;
    }

    stepState() {
        if (this.state === 1) {
            this.state = 2;
        } else {
            this.state = 1;
        }
    }

    getState(callback) {
        callback(null, this.state);
    }

    getServices() {
        const info = new this.Service.AccessoryInformation();
        info.setCharacteristic(this.Characteristic.Manufacturer, this.manufacturer)
            .setCharacteristic(this.Characteristic.Model, this.model)
            .setCharacteristic(this.Characteristic.SerialNumber, this.serialNumber);

        this.service = new this.Service.Doorbell(this.name);
        this.service.getCharacteristic(this.Characteristic.ProgrammableSwitchEvent)
            .on('get', this.getState.bind(this));

        return [info, this.service];
    }

    ring() {
        if (!this.busy) {
            this.busy = true;
            this.service.getCharacteristic(this.Characteristic.ProgrammableSwitchEvent).updateValue(this.state);
            this.stepState();
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            this.busy = false;
            this.timeout = undefined;
        }, this.debounce * 1000);
        return true;
    }


}

module.exports = Doorbell;
