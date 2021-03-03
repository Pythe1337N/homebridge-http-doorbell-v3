class Doorbell {
    constructor(config, Service, Characteristic) {
        this.Service = Service;
        this.Characteristic = Characteristic;

        const {
            name,
            id,
            debounce,
        } = config;
        this.name = name || 'tjena';
        this.id = id || 'hej';
        this.debounce = debounce || 2;
        this.state = false;
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

    ring() {
        this.state = true;
        this.service.getCharacteristic(this.Characteristic.ProgrammableSwitchEvent).updateValue(0);
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            this.state = false;
            this.service.getCharacteristic(this.Characteristic.ProgrammableSwitchEvent).updateValue(-1);
            this.timeout = undefined;
        }, this.debounce * 1000);
        return true;
    }


}

module.exports = Doorbell;
