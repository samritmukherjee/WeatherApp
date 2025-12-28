class WxApp {
  constructor() {
    this.key = this.getApiKey();
    this.loc = "Kolkata";
    this.lat = 22.5726;
    this.lon = 88.3639;
    this.isC = true;
    this.data = null;
    this.useMockData = false;
    this.init();
  }

  getApiKey() {
    if (window.__ENV && window.__ENV.OPENWEATHER_API_KEY) {
      console.log("Using API key from .env file");
      return window.__ENV.OPENWEATHER_API_KEY;
    }
    console.log("Using fallback API key");
    return "e2171af7c43b9eb3f9417fc352f3d504";
  }

  async init() {
    const tgl = document.getElementById("temp-toggle");
    if (tgl) {
      tgl.addEventListener("change", () => {
        this.isC = !tgl.checked;
        this.upT();
      });
    }
    await this.fetchAll();
    this.upT();
  }

  async fetchAll() {
    console.log("API Called");
    try {
      const wUrl = `https://api.openweathermap.org/data/2.5/weather?q=${this.loc}&units=metric&appid=${this.key}`;
      const fUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${this.loc}&units=metric&appid=${this.key}`;
      const aUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${this.lat}&lon=${this.lon}&appid=${this.key}`;

      const [wRes, fRes, aRes] = await Promise.all([
        fetch(wUrl),
        fetch(fUrl),
        fetch(aUrl)
      ]);

      if (!wRes.ok || !fRes.ok || !aRes.ok) {
        console.log("Failed to fetch API data");
        this.useMockData = true;
        this.data = this.getMockData();
        this.upMain();
        return;
      }

      const wData = await wRes.json();
      const fData = await fRes.json();
      const aData = await aRes.json();

      this.data = {
        cur: wData,
        fct: fData,
        aqi: aData.list[0]
      };

      console.log("API Data Successfully Fetched");
      this.upMain();
    } catch (e) {
      console.log("Failed to fetch API data");
      this.useMockData = true;
      this.data = this.getMockData();
      this.upMain();
    }
  }

  getMockData() {
    return {
      cur: {
        name: "Kolkata",
        main: {
          temp: 17,
          temp_max: 25,
          temp_min: 12,
          feels_like: 18,
          pressure: 1014
        },
        weather: [{ main: "Cloudy", icon: "04d" }],
        wind: { speed: 12 },
        rain: { "1h": 1.8 },
        visibility: 8000
      },
      fct: {
        list: [
          { main: { temp: 20 }, weather: [{ icon: "01d" }] },
          { main: { temp: 21 }, weather: [{ icon: "01d" }] },
          { main: { temp: 20 }, weather: [{ icon: "01d" }] },
          { main: { temp: 19 }, weather: [{ icon: "02d" }] },
          { main: { temp: 18 }, weather: [{ icon: "02d" }] },
          { main: { temp: 18 }, weather: [{ icon: "03d" }] }
        ]
      },
      aqi: {
        main: { aqi: 233 }
      }
    };
  }

  upMain() {
    if (!this.data) return;
    const d = this.data.cur;

    const locEl = document.querySelector(".location-pill span");
    const tv = document.querySelector(".temp-value");
    const hl = document.querySelector(".hi-low");
    const fl = document.querySelector(".feels-like");

    if (locEl) locEl.textContent = d.name;
    if (tv) tv.textContent = Math.round(d.main.temp);
    if (hl) hl.textContent = `High: ${Math.round(d.main.temp_max)}° Low: ${Math.round(d.main.temp_min)}°`;
    if (fl) fl.textContent = `Feels like ${Math.round(d.main.feels_like)}°`;

    const mini = document.querySelectorAll(".mini-main");
    if (mini[0]) mini[0].textContent = `${Math.round(d.wind.speed)} km/h`;
    if (mini[1]) mini[1].textContent = `${(d.rain?.["1h"] || 0).toFixed(1)} mm`;
    if (mini[2]) mini[2].textContent = `${d.main.pressure} hPa`;

    const ai = this.data.aqi.main.aqi;
    const aTxt = this.aqiTxt(ai);
    if (mini[3]) mini[3].textContent = `${ai} ${aTxt}`;

    const aBar = document.querySelector(".air-quality-bar span");
    if (aBar) aBar.style.width = `${(ai / 5) * 100}%`;

    if (mini[4]) mini[4].textContent = `${(d.visibility / 1000).toFixed(1)} km`;

    const mapVal = document.querySelector(".map-pin .value");
    if (mapVal) mapVal.textContent = Math.round(d.main.temp);

    const dayEl = document.getElementById("day-name");
    if (dayEl) {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const today = new Date();
      dayEl.textContent = days[today.getDay()];
    }

    const dateEl = document.getElementById("current-date");
    if (dateEl) {
      const today = new Date();
      const opts = { year: "numeric", month: "short", day: "numeric" };
      dateEl.textContent = today.toLocaleDateString("en-US", opts);
    }

    this.upH();
  }

  aqiTxt(i) {
    const lv = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
    return lv[Math.min(i - 1, 4)] + " Health Risk";
  }

  upH() {
    if (!this.data) return;
    const list = this.data.fct.list;
    const hourlyStrip = document.getElementById("hourly-strip");
    
    if (hourlyStrip) {
      const pills = hourlyStrip.querySelectorAll(".hour-pill");
      
      for (let i = 0; i < 6 && i < list.length && i < pills.length; i++) {
        const f = list[i];
        const temp = this.isC ? Math.round(f.main.temp) : Math.round((f.main.temp * 9 / 5) + 32);
        
        const timeEl = pills[i].querySelector(".hour-time");
        if (timeEl) {
          const date = new Date(f.dt * 1000);
          const hours = date.getHours();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const displayHours = hours % 12 || 12;
          timeEl.textContent = `${displayHours} ${ampm}`;
        }
        
        const tempEl = pills[i].querySelector(".temp");
        if (tempEl) tempEl.textContent = `${temp}°`;
        
        const ico = pills[i].querySelector(".hour-icon");
        if (ico) {
          ico.src = `https://openweathermap.org/img/wn/${f.weather[0].icon}@2x.png`;
        }
      }
    }

    if (list.length > 8) {
      const tomorrow = list[8];
      const tomorrowTemp = this.isC ? Math.round(tomorrow.main.temp) : Math.round((tomorrow.main.temp * 9 / 5) + 32);
      const tomorrowCondition = tomorrow.weather[0].main;
      
      const condEl = document.getElementById("tomorrow-condition");
      if (condEl) condEl.textContent = tomorrowCondition;
      
      const tempEl = document.getElementById("tomorrow-temp");
      if (tempEl) tempEl.textContent = `${tomorrowTemp}°`;
      
      const iconEl = document.getElementById("tomorrow-icon");
      if (iconEl) {
        iconEl.src = `https://openweathermap.org/img/wn/${tomorrow.weather[0].icon}@2x.png`;
      }
    }
  }

  upT() {
    if (!this.data) return;
    const d = this.data.cur;
    const u = this.isC ? "C" : "F";
    const toF = c => Math.round((c * 9 / 5) + 32);

    const tv = document.querySelector(".temp-value");
    const tu = document.querySelector(".temp-unit");
    const hl = document.querySelector(".hi-low");
    const fl = document.querySelector(".feels-like");

    const mainT = this.isC ? d.main.temp : toF(d.main.temp);
    if (tv) tv.textContent = Math.round(mainT);
    if (tu) tu.textContent = u;

    const hi = this.isC ? d.main.temp_max : toF(d.main.temp_max);
    const lo = this.isC ? d.main.temp_min : toF(d.main.temp_min);
    if (hl) hl.textContent = `High: ${Math.round(hi)}° Low: ${Math.round(lo)}°`;

    const feel = this.isC ? d.main.feels_like : toF(d.main.feels_like);
    if (fl) fl.textContent = `Feels like ${Math.round(feel)}°`;

    this.upH();
  }
}

new WxApp();
