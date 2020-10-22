const LitElement = customElements.get("hui-masonry-view") ? Object.getPrototypeOf(customElements.get("hui-masonry-view")) : Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

const weatherIconsDay = {
  clear: "day",
  "clear-night": "night",
  cloudy: "cloudy",
  fog: "cloudy",
  hail: "rainy-7",
  lightning: "thunder",
  "lightning-rainy": "thunder",
  partlycloudy: "cloudy-day-3",
  pouring: "rainy-6",
  rainy: "rainy-5",
  snowy: "snowy-6",
  "snowy-rainy": "rainy-7",
  sunny: "day",
  windy: "cloudy",
  "windy-variant": "cloudy-day-3",
  exceptional: "!!",
};

const weatherIconsNight = {
  ...weatherIconsDay,
  clear: "night",
  sunny: "night",
  partlycloudy: "cloudy-night-3",
  "windy-variant": "cloudy-night-3",
};

const windDirections = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW",
  "N",
];

window.customCards = window.customCards || [];
window.customCards.push({
  type: "weather-card",
  name: "Weather Card",
  description: "A custom weather card with animated icons.",
  preview: true,
  documentationURL: "https://github.com/bramkragten/weather-card",
});

const fireEvent = (node, type, detail, options) => {
  options = options || {};
  detail = detail === null || detail === undefined ? {} : detail;
  const event = new Event(type, {
    bubbles: options.bubbles === undefined ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === undefined ? true : options.composed,
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};

function hasConfigOrEntityChanged(element, changedProps) {
  if (changedProps.has("_config")) {
    return true;
  }

  const oldHass = changedProps.get("hass");
  if (oldHass) {
    return (
      oldHass.states[element._config.entity] !==
      element.hass.states[element._config.entity] ||
      oldHass.states["sun.sun"] !== element.hass.states["sun.sun"]
    );
  }

  return true;
}

class WeatherCard extends LitElement {
  static get properties() {
    return {
      _config: {},
      hass: {},
    };
  }

  static async getConfigElement() {
    await import("./weather-card-editor.js");
    return document.createElement("weather-card-editor");
  }

  static getStubConfig(hass, unusedEntities, allEntities) {
    let entity = unusedEntities.find((eid) => eid.split(".")[0] === "weather");
    if (!entity) {
      entity = allEntities.find((eid) => eid.split(".")[0] === "weather");
    }
    return { entity };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("Please define a weather entity");
    }
    this._config = config;
  }

  shouldUpdate(changedProps) {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  render() {
    if (!this._config || !this.hass) {
      return html``;
    }

    this.numberElements = 0;

    const stateObj = this.hass.states[this._config.entity];

    if (!stateObj) {
      return html`
        <style>
          .not-found {
            flex: 1;
            background-color: yellow;
            padding: 8px;
          }
        </style>
        <ha-card>
          <div class="not-found">
            Entity not available: ${this._config.entity}
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card @click="${this._handleClick}">
        ${this._config.current ? this.renderCurrent(stateObj) : ""}
        ${this._config.details ? this.renderDetails(stateObj) : ""}
        ${this._config.one_hour_forecast
        ? this.renderOneHourForecast()
        : ""}
        ${this._config.alertEntity
        ? this.renderAlertForecast()
        : ""}
        ${this._config.forecast
        ? this.renderForecast(stateObj.attributes.forecast)
        : ""}
      </ha-card>
    `;
  }

  renderCurrent(stateObj) {
    this.numberElements++;

    return html`
      <div class="current ${this.numberElements > 1 ? " spacer" : ""}">
        <span class="icon bigger"
        style="background: none, url('${this.getWeatherIcon(
      stateObj.state.toLowerCase(),
      this.hass.states["sun.sun"]
    )}') no-repeat; background-size: contain;">${stateObj.state}
        </span>
        ${this._config.name
        ? html` <span class="title"> ${this._config.name} </span> `
        : ""}
        <span class="temp">${this.getUnit("temperature") == "°F"
        ? Math.round(stateObj.attributes.temperature)
        : stateObj.attributes.temperature}</span>
        <span class="tempc"> ${this.getUnit("temperature")}</span>
      </div>
    `;
  }

  renderDetails(stateObj) {
    const sun = this.hass.states["sun.sun"];
    let next_rising;
    let next_setting;

    if (sun) {
      next_rising = new Date(sun.attributes.next_rising);
      next_setting = new Date(sun.attributes.next_setting);
    }

    this.numberElements++;

    return html`
      <ul class="variations ${this.numberElements > 1 ? " spacer" : ""}">
        <!-- Humidity -->
        ${this.renderDetail(stateObj.attributes.humidity, "mdi:water-percent", "%")}
        <!-- Wind -->
        ${this.renderDetail(windDirections[parseInt((stateObj.attributes.wind_bearing + 11.25) / 22.5)] + " " + stateObj.attributes.wind_speed, "mdi:weather-windy",
      this.getUnit("speed"))}
        <!-- Pressure -->
        ${this.renderDetail(stateObj.attributes.pressure, "mdi:gauge", this.getUnit("air_pressure"))}
        <!-- Fog -->
        ${this.renderDetail(stateObj.attributes.visibility, "mdi:weather-fog", this.getUnit("length"))}
        <!-- Meteo France sensors -->
        <!-- Cloudy -->
        ${this.renderMeteoFranceDetail(this.hass.states[this._config.cloudCoverEntity])}
        <!-- Rain -->
        ${this.renderMeteoFranceDetail(this.hass.states[this._config.rainChanceEntity])}
        <!-- Snow -->
        ${this.renderMeteoFranceDetail(this.hass.states[this._config.snowChanceEntity])}
        <!-- Freeze -->
        ${this.renderMeteoFranceDetail(this.hass.states[this._config.freezeChanceEntity])}
        <!-- UV -->
        ${this.renderMeteoFranceDetail(this.hass.states[this._config.uvEntity])}
        <!-- Sunset up -->
        ${next_rising
        ? this.renderDetail(next_rising.toLocaleTimeString(), "mdi:weather-sunset-up")
        : ""}
        <!-- Sunset down -->
        ${next_setting
        ? this.renderDetail(next_setting.toLocaleTimeString(), "mdi:weather-sunset-down")
        : ""}
      </ul>
    `;
  }

  renderMeteoFranceDetail(entity) {
    return this.renderDetail(entity.state, entity.attributes.icon, entity.attributes.unit_of_measurement)
  }

  renderDetail(state, icon, unit) {
    return html`
      <li>
        <ha-icon icon="${icon}"></ha-icon>
        ${state}
        ${unit ? html`
        <span class="unit">${unit}</span>
        `
        : ""}
      </li>
    `
  }

  renderOneHourForecast() {
    const rainForecast = this.hass.states[this._config.rainForecastEntity];

    if (!rainForecast || rainForecast.length === 0) {
      return html``;
    }

    this.numberElements++;

    return html`
      <ul class="oneHour">
        ${html`
        ${this.getOneHourForecast(rainForecast).map(
      (forecast) => html`
      <li style="opacity: ${forecast[1]}" title="${forecast[2] + " " + (forecast[0] == 0
          ? " actuellement"
          : "dans " + forecast[0] + " min")}">
      </li>`
    )}
        `}
      </ul>`;
  }

  renderAlertForecast() {
    const alertForecast = this.hass.states[this._config.alertEntity];

    if (!alertForecast) {
      return html``;
    }

    this.numberElements++;

    return html`
    ${this.getAlertForecast("Jaune", alertForecast).length > 0
        ? html`
    <span class="vigilance jaune">
      <ha-icon icon="mdi:alert"></ha-icon>Vigilance jaune en cours
      <div class="vigilance-list">
        ${this.getAlertForecast("Jaune", alertForecast).map(
          (phenomenon) => html`
        <ha-icon icon="${phenomenon[1]}" title="${phenomenon[0]}"></ha-icon>
        `
        )}
      </div>
    </span>
    `
        : ""
      }
    ${this.getAlertForecast("Orange", alertForecast).length > 0
        ? html`
    <span class="vigilance orange">
      <ha-icon icon="mdi:alert"></ha-icon>Vigilance orange en cours
      <div class="vigilance-list">
        ${this.getAlertForecast("Orange", alertForecast).map(
          (phenomenon) => html`
        <ha-icon icon="${phenomenon[1]}" title="${phenomenon[0]}"></ha-icon>
        `
        )}
      </div>
    </span>
    `
        : ""
      }
    ${this.getAlertForecast("Rouge", alertForecast).length > 0
        ? html`
    <span class="vigilance rouge">
      <ha-icon icon="mdi:alert"></ha-icon>Vigilance rouge en cours
      <div class="vigilance-list">
        ${this.getAlertForecast("Rouge", alertForecast).map(
          (phenomenon) => html`
        <ha-icon icon="${phenomenon[1]}" title="${phenomenon[0]}"></ha-icon>
        `
        )}
      </div>
    </span>
    `
        : ""
      }
    `;
  }

  renderForecast(forecast) {
    if (!forecast || forecast.length === 0) {
      return html``;
    }

    const lang = this.hass.selectedLanguage || this.hass.language;

    this.numberElements++;
    return html`
      <div class="forecast clear ${this.numberElements > 1 ? " spacer" : ""}">
        ${forecast
        .slice(
          0,
          this._config.number_of_forecasts
            ? this._config.number_of_forecasts
            : 5
        )
        .map(
          (daily) => html`
        <div class="day">
          <div class="dayname">
            ${this._config.hourly_forecast
              ? new Date(daily.datetime).toLocaleTimeString(lang, {
                hour: "2-digit",
                minute: "2-digit",
              })
              : new Date(daily.datetime).toLocaleDateString(lang, {
                weekday: "short",
              })}
          </div>
          <i class="icon" style="background: none, url('${this.getWeatherIcon(
                daily.condition.toLowerCase()
              )}') no-repeat; background-size: contain"></i>
          <div class="highTemp">
            ${daily.temperature}${this.getUnit("temperature")}
          </div>
          ${daily.templow !== undefined
              ? html`
          <div class="lowTemp">
            ${daily.templow}${this.getUnit("temperature")}
          </div>
          `
              : ""}
          ${!this._config.hide_precipitation &&
              daily.precipitation !== undefined &&
              daily.precipitation !== null
              ? html`
          <div class="precipitation">
            ${Math.round(daily.precipitation * 10) / 10} ${this.getUnit("precipitation")}
          </div>
          `
              : ""}
          ${!this._config.hide_precipitation &&
              daily.precipitation_probability !== undefined &&
              daily.precipitation_probability !== null
              ? html`
          <div class="precipitation_probability">
            ${Math.round(daily.precipitation_probability)} ${this.getUnit("precipitation_probability")}
          </div>
          `
              : ""}
        </div>
        `
        )}
      </div>
    `;
  }

  getOneHourForecast(rainForecastEntity) {
    let rainForecastValues = new Map([
      ["Temps sec", 0.1],
      ["Pluie faible", 0.4],
      ["Pluie modérée", 0.7],
      ["Pluie forte", 1],
    ]);

    let rainForecastList = [];
    for (let [time, value] of Object.entries(
      rainForecastEntity.attributes["1_hour_forecast"]
    )) {
      if (time != undefined && time.match(/[0-9]*min/g)) {
        time = time.replace("min", "").trim();
        rainForecastList.push([time, rainForecastValues.get(value), value]);
      }
    }

    return rainForecastList;
  }

  getAlertForecast(color, alertEntity) {
    let phenomenaIcons = {
      "Vent violent": "mdi:weather-windy",
      "Pluie-inondation": "mdi:weather-pouring",
      Orages: "mdi:weather-lightning",
      Inondation: "mdi:home-flood",
      "Neige-verglas": "mdi:weather-snowy-heavy",
      Canicule: "mdi:weather-sunny-alert",
      "Grand-froid": "mdi:snowflake",
      Avalanches: "mdi:image-filter-hdr",
      "Vagues-submersion": "mdi:waves",
    };

    if (alertEntity == undefined) {
      return [];
    }

    let phenomenaList = [];
    for (const [currentPhenomenon, currentPhenomenonColor] of Object.entries(
      alertEntity.attributes
    )) {
      if (currentPhenomenonColor == color) {
        phenomenaList.push([
          currentPhenomenon,
          phenomenaIcons[currentPhenomenon],
        ]);
      }
    }

    return phenomenaList;
  }

  getWeatherIcon(condition, sun) {
    return `${this._config.icons
      ? this._config.icons
      : "https://cdn.jsdelivr.net/gh/bramkragten/weather-card/dist/icons/"
      }${sun && sun.state == "below_horizon"
        ? weatherIconsNight[condition]
        : weatherIconsDay[condition]
      }.svg`;
  }

  getUnit(measure) {
    const lengthUnit = this.hass.config.unit_system.length;
    switch (measure) {
      case "air_pressure":
        return lengthUnit === "km" ? "hPa" : "inHg";
      case "length":
        return lengthUnit;
      case "precipitation":
        return lengthUnit === "km" ? "mm" : "in";
      case "precipitation_probability":
        return "%";
      case "speed":
        return lengthUnit === "km" ? "km/h" : "mph";
      default:
        return this.hass.config.unit_system[measure] || "";
    }
  }

  _handleClick() {
    fireEvent(this, "hass-more-info", { entityId: this._config.entity });
  }

  getCardSize() {
    return 3;
  }

  static get styles() {
    return css`
      ha-card {
        cursor: pointer;
        margin: auto;
        overflow: hidden;
        padding-top: 1.3em;
        padding-bottom: 1.3em;
        padding-left: 1em;
        padding-right: 1em;
        position: relative;
      }

      .spacer {
        padding-top: 1em;
      }

      .clear {
        clear: both;
      }

      .title {
        position: absolute;
        left: 3em;
        font-weight: 300;
        font-size: 3em;
        color: var(--primary-text-color);
      }

      .temp {
        font-weight: 300;
        font-size: 4em;
        color: var(--primary-text-color);
        position: absolute;
        right: 1em;
      }

      .tempc {
        font-weight: 300;
        font-size: 1.5em;
        vertical-align: super;
        color: var(--primary-text-color);
        position: absolute;
        right: 1em;
        margin-top: -14px;
        margin-right: 7px;
      }

      @media (max-width: 460px) {
        .title {
          font-size: 2.2em;
          left: 4em;
        }
        .temp {
          font-size: 3em;
        }
        .tempc {
          font-size: 1em;
        }
      }

      .current {
        padding: 1.2em 0;
        margin-bottom: 3.5em;
      }

      .variations {
        display: flex;
        flex-flow: row wrap;
        justify-content: space-between;
        font-weight: 300;
        color: var(--primary-text-color);
        list-style: none;
        padding: 0 1em;
        margin: 0;
      }

      .variations ha-icon {
        height: 22px;
        margin-right: 5px;
        color: var(--paper-item-icon-color);
      }

      .variations li {
        flex-basis: auto;
        width: 50%;
      }

      .variations li:nth-child(2n) {
        text-align: right;
      }

      .variations li:nth-child(2n) ha-icon {
        margin-right: 0;
        margin-left: 8px;
        float: right;
      }

      .unit {
        font-size: 0.8em;
      }

      .forecast {
        width: 100%;
        margin: 0 auto;
        display: flex;
      }

      .day {
        flex: 1;
        display: block;
        text-align: center;
        color: var(--primary-text-color);
        border-right: 0.1em solid #d9d9d9;
        line-height: 2;
        box-sizing: border-box;
      }

      .dayname {
        text-transform: uppercase;
      }

      .forecast .day:first-child {
        margin-left: 0;
      }

      .forecast .day:nth-last-child(1) {
        border-right: none;
        margin-right: 0;
      }

      .highTemp {
        font-weight: bold;
      }

      .lowTemp {
        color: var(--secondary-text-color);
      }

      .precipitation {
        color: var(--primary-text-color);
        font-weight: 300;
      }

      .icon.bigger {
        width: 10em;
        height: 10em;
        margin-top: -4em;
        position: absolute;
        left: 0em;
      }

      .icon {
        width: 50px;
        height: 50px;
        margin-right: 5px;
        display: inline-block;
        vertical-align: middle;
        background-size: contain;
        background-position: center center;
        background-repeat: no-repeat;
        text-indent: -9999px;
      }

      .weather {
        font-weight: 300;
        font-size: 1.5em;
        color: var(--primary-text-color);
        text-align: left;
        position: absolute;
        top: -0.5em;
        left: 6em;
        word-wrap: break-word;
        width: 30%;
      }

      .oneHour {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        height: 15px;
        padding: 0px;
        color: var(--primary-text-color);
        margin: 10px 2px;
        overflow: hidden;
        list-style: none;
      }

      .oneHour li {
        width: 100%;
        background-color: var(--paper-item-icon-color);
        border-right: 1px solid var(--lovelace-background, var(--primary-background-color));
      }

      .oneHour li:first-child {
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
      }

      .oneHour li:last-child {
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
        border: 0;
      }
    `;
  }
}
customElements.define("weather-card", WeatherCard);
