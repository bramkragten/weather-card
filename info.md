# Lovelace animated weather card

Originally created for the [old UI](https://community.home-assistant.io/t/custom-ui-weather-state-card-with-a-question/23008) converted by @arsaboo and @ciotlosm to [Lovelace](https://community.home-assistant.io/t/custom-ui-weather-state-card-with-a-question/23008/291) and now converted to Lit to make it even better.

This card uses the awesome [animated SVG weather icons by amCharts](https://www.amcharts.com/free-animated-svg-weather-icons/).

![Weather Card](https://github.com/bramkragten/custom-ui/blob/master/weather-card/weather-card.gif?raw=true)

Thanks for all picking this card up.

## Installation:

### If you are using Firefox:

Firefox < 66 does not support all the needed functions yet for the editor.
You change this by enabling `javascript.options.dynamicImport` in `about:config`.

Add the following to resources in your lovelace config:

```yaml
resources:
  - url: /community_plugin/weather-card/weather-card.js
    type: module
```

## Configuration:

And add a card with type `custom:weather-card`:

```yaml
- type: custom:weather-card
  entity: weather.yourweatherentity
  name: Optional name
```

If you want to use your local icons add the location to the icons:

```yaml
- type: custom:weather-card
  entity: weather.yourweatherentity
  icons: "/community_plugin/weather-card/icons/"
```

You can choose wich elements of the weather card you want to show:

The 3 different rows, being:

- The current weather icon, the current temperature and title
- The details about the current weather
- The 5 day forecast

```yaml
type: custom:weather-card
entity: weather.yourweatherentity
current: true
details: false
forecast: true
```

If you want to show the sunrise and sunset times, make sure the `sun` component is enabled:

```yaml
# Example configuration.yaml entry
sun:
```

### Hiding attributes:

If you want to hide certain attributes, this is also possible:

```yaml
- type: custom:weather-card
  entity: weather.yourweatherentity
  hide_humidity: true
  hide_pressure: true
  hide_sunset: true
  hide_visibility: true
  hide_wind: true
  hide_forecast: true
```

### Dark Sky:

When using Dark Sky you should put the mode to `daily` if you want a daily forecast with highs and lows.

```yaml
# Example configuration.yaml entry
weather:
  - platform: darksky
    api_key: YOUR_API_KEY
    mode: daily
```
