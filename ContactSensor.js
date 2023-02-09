class ContactSensor {
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
        this.manufacturer = manufacturer || 'Vilnic Inc.';
        this.model = model || 'Vilnic ContactSensor';
        this.serialNumber = serialNumber || this.id;
        // CONTACT_DETECTED	0
        // CONTACT_NOT_DETECTED	1
        this.state = 0;
        this.busy = false;
    }

    getState(callback) {
        callback(null, this.state);
    }

    getServices() {
        const info = new this.Service.AccessoryInformation();
        info.setCharacteristic(this.Characteristic.Manufacturer, this.manufacturer)
            .setCharacteristic(this.Characteristic.Model, this.model)
            .setCharacteristic(this.Characteristic.SerialNumber, this.serialNumber);

        this.service = new this.Service.ContactSensor(this.name);
        this.service.getCharacteristic(this.Characteristic.ContactSensorState)
            .on('get', this.getState.bind(this));

        return [info, this.service];
    }

    applyState(value) {
        // this.log("applyState: " + value)
        if (value == 0) {
            this.state = 0;
            this.service.getCharacteristic(this.Characteristic.ContactSensorState).updateValue(this.state);
        }
        if (value == 1) {
            this.state = 1;
            this.service.getCharacteristic(this.Characteristic.ContactSensorState).updateValue(this.state);
        };
        // this.log('current state: ' + this.state');
        return true;
    }
}

module.exports = ContactSensor;
