# homebridge-http-doorbell-v3
Easily add one or many simple button-only doorbells to your home with this http doorbell plugin.

## Configuration
* ```platform``` must be set to ```"http-doorbell-v3"``` for this plugin to be active.
* ```port``` sets the port for the http server to listen on. (optional, default 9090)
* ```doorbells[]``` an array of doorbell configurations.

### doorbells[]
* ```name``` sets the doorbell name displayed in the Home app.
* ```id``` sets the id of a doorbell.
    * Must be unique.
    * Only letters a-z and numbers 0-9 are allowed.
    * Is case sensitive.
* ```debounce``` sets the minimum number of seconds between button clicks. 
* ```manufacturer``` sets the manufacturer name in the Home app (optional).
* ```model``` sets the model name in the Home app (optional).
* ```serialNumber``` sets the serial number name in the Home app (optional).

## How to trigger
The plugin will expose an endpoint that is equal to:

```http://<homebridge_server_ip>:<plugin_port>/<doorbell_id>```

Just make a ```GET``` request to this url and the doorbell should trigger. 
Remember that the doorbell id is case sensitive.

If the http request succeeds you'll get the following response with a status code of 200:

```json
{
  "success": true
}
```
The endpoint will continue to respond with success, even though an event is not triggered due to debouncing.

If you try to access an unspecified doorbell id, you'll get this response with a status code of 404:

```json
{
  "success": false
}
```


## Example configuration 
```json
{
  "platforms": [
    {
      "platform": "http-doorbell-v3",
      "port": 9091,
      "doorbells": [
        {
          "name": "Front door",
          "id": "door",
          "debounce": 5,
          "manufacturer": "Doorbell Inc.",
          "model": "Doorbell 2000",
          "serialNumber": "XYZ123"
        }
      ]
    }
  ]
}
```

## Drawbacks
### Listed as not supported
* As of 2021 this accessory will be listed as **Not supported** in the Home app. It will however work as intended and give you doorbell notifications when triggered.

* Due to a limitation/bug(?) in how event triggers are handled, there might be a case where no notification is sent. This is really rare and will only occur if the following happens:
1) Homebridge is restarted.
2) Doorbell is triggered only once.
3) Homebridge is restarted again.
4) First doorbell trigger will not result in a notification.

For any other usage patterns, there are no problems with Homebridge restarts.

This is a complete class-based re-write of already existing plugins and could be used as a replacement.
These plugins are:
* [homebridge-http-doorbell](https://www.npmjs.com/package/homebridge-http-doorbell)
* [homebridge-http-doorbell-v2](https://www.npmjs.com/package/homebridge-http-doorbell-v2)
