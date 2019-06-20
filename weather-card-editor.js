if (!customElements.get("paper-input")) {
  console.log("imported", "paper-input");
  import("https://unpkg.com/@polymer/paper-input/paper-input.js?module");
}

const fireEvent = (node, type, detail, options) => {
  options = options || {};
  detail = detail === null || detail === undefined ? {} : detail;
  const event = new Event(type, {
    bubbles: options.bubbles === undefined ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === undefined ? true : options.composed
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};

const LitElement = Object.getPrototypeOf(
  customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;

export class WeatherCardEditor extends LitElement {
  setConfig(config) {
    this._config = config;
  }

  static get properties() {
    return { hass: {}, _config: {} };
  }

  get _entity() {
    return this._config.entity || "";
  }

  get _name() {
    return this._config.name || "";
  }

  get _icons() {
    return this._config.icons || "";
  }

  get _hide_humidity() {
    return this._config.hide_humidity || false;
  }

  get _hide_wind() {
    return this._config.hide_wind || false;
  }

  get _hide_pressure() {
    return this._config.hide_pressure || false;
  }

  get _hide_visibility() {
    return this._config.hide_visibility || false;
  }

  get _hide_sunset() {
    return this._config.hide_sunset || false;
  }

  get _hide_forecast() {
    return this._config.hide_forecast || false;
  }

  render() {
    if (!this.hass) {
      return html``;
    }

    return html`
      <div class="card-config">
        <div class="side-by-side">
          <paper-input
            label="Name"
            .value="${this._name}"
            .configValue="${"name"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>
          <paper-input
            label="Icons location"
            .value="${this._icons}"
            .configValue="${"icons"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>
          ${
            customElements.get("ha-entity-picker")
              ? html`
                  <ha-entity-picker
                    .hass="${this.hass}"
                    .value="${this._entity}"
                    .configValue=${"entity"}
                    domain-filter="weather"
                    @change="${this._valueChanged}"
                    allow-custom-entity
                  ></ha-entity-picker>
                `
              : html`
                  <paper-input
                    label="Entity"
                    .value="${this._entity}"
                    .configValue="${"entity"}"
                    @value-changed="${this._valueChanged}"
                  ></paper-input>
                `
          }
          <h3>Hide attributes</h3>
          <div role="listbox">
            <paper-item>
              <paper-checkbox
                label="Humidity"
                .value="${this._hide_humidity}"
                .configValue="${"hide_humidity"}"
                @iron-change="${this._valueChanged}"
              >Humidity</paper-checkbox>
            </paper-item>
            <paper-item>
              <paper-checkbox
                label="Pressure"
                .value="${this._hide_pressure}"
                .configValue="${"hide_pressure"}"
                @iron-change="${this._valueChanged}"
              >Pressure</paper-checkbox>
            </paper-item>
            <paper-item>
              <paper-checkbox
                label="Sunset / sunrise"
                .value="${this._hide_sunset}"
                .configValue="${"hide_sunset"}"
                @iron-change="${this._valueChanged}"
              >Sunset / sunrise</paper-checkbox>
            </paper-item>
            <paper-item>
              <paper-checkbox
                label="Wind"
                .value="${this._hide_wind}"
                .configValue="${"hide_wind"}"
                @iron-change="${this._valueChanged}"
              >Wind</paper-checkbox>
              </paper-item>
            <paper-item>
            <paper-checkbox
                label="Visibility"
                .value="${this._hide_visibility}"
                .configValue="${"hide_visibility"}"
                @iron-change="${this._valueChanged}"
              >Visibility</paper-checkbox>
              </paper-item>
            <paper-item>
            <paper-checkbox
                label="Forecast"
                .value="${this._hide_forecast}"
                .configValue="${"hide_forecast"}"
                @iron-change="${this._valueChanged}"
              >Forecast</paper-checkbox>
            </paper-item>
          </div>
        </div>
      </div>
    `;
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) {
      return;
    }

    const target = ev.target;
    const newValue = target.checked || target.value;

    if (this[`_${target.configValue}`] === newValue) {
      return;
    }
    if (target.configValue) {
      if (newValue === "" || newValue == false) {
        delete this._config[target.configValue];
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: newValue
        };
      }
    }
    fireEvent(this, "config-changed", { config: this._config });
  }
}

customElements.define("weather-card-editor", WeatherCardEditor);
