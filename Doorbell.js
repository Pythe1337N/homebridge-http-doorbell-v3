class Doorbell {
    constructor(config, Service, Characteristic, log) {
        this.Service = Service;
        this.Characteristic = Characteristic;
        this.log = log;

        const {
            name,
            id,
            debounce,
        } = config;
        this.name = name || 'tjena';
        this.id = id || 'hej';
        this.debounce = debounce || 2;
        this.state = 0;
        this.busy = false;
    }

    getState(callback) {
        callback(null, this.state);
    }

    getServices() {
        const info = new this.Service.AccessoryInformation();
        info.setCharacteristic(this.Characteristic.Manufacturer, "Bernberg Inc.")
            .setCharacteristic(this.Characteristic.Model, "Bernberg Doorbell")
            .setCharacteristic(this.Characteristic.SerialNumber, this.id);

        this.service = new this.Service.Doorbell(this.name);
        this.service
            .getCharacteristic(this.Characteristic.ProgrammableSwitchEvent)
            .on('get', this.getState.bind(this));

        return [info, this.service];
    }

    identify() {
        this.log("Identify requested!");
    }

    ring() {
        this.busy = true;
        if (!this.busy) {
            this.state = this.state ? 0 : 1;
            this.service.getCharacteristic(this.Characteristic.ProgrammableSwitchEvent).updateValue(this.state);
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
