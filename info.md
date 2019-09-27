# Lovelace animated weather card (modified by @helto4real)

_Modified the original card from @bramkragten to show percipitation and use eu m/s as wind speed unit_, all else is @bramkragten work. Thanks for this awesome work!\*

Please checkout the original and instructions at https://github.com/bramkragten/weather-card

Originally created for the [old UI](https://community.home-assistant.io/t/custom-ui-weather-state-card-with-a-question/23008) converted by @arsaboo and @ciotlosm to [Lovelace](https://community.home-assistant.io/t/custom-ui-weather-state-card-with-a-question/23008/291) and now converted to Lit to make it even better.

This card uses the awesome [animated SVG weather icons by amCharts](https://www.amcharts.com/free-animated-svg-weather-icons/).

![Weather Card](https://github.com/helto4real/weather-card-mod/blob/master/weather-card.gif?raw=true)

Thanks for all picking this card up.

## Installation:

### If you are using Firefox:

Firefox < 66 does not support all the needed functions yet for the editor.
You change this by enabling `javascript.options.dynamicImport` in `about:config`.

Add the following to resources in your lovelace config:

```yaml
resources:
  - url: /community_plugin/weather-card-mod/weather-card-mod.js
    type: module
```

## Configuration:

And add a card with type `custom:weather-card-mod`:

```yaml
- type: custom:weather-card-mod
  entity: weather.yourweatherentity
  name: Optional name
```

If you want to use an sensor as current temperature use the tempsource

```yaml
- type: custom:weather-card-mod
  entity: weather.yourweatherentity
  tempsource: sensor.outside_temp_sensor
  name: Optional name
```

If you want to use your local icons add the location to the icons:

```yaml
- type: custom:weather-card-mod
  entity: weather.yourweatherentity
  icons: "/community_plugin/weather-card-mod/icons/"
```

Make sure the `sun` component is enabled:

```yaml
# Example configuration.yaml entry
sun:
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
