import { useEffect, useState } from "react";
import Card from "../components/card";
import Gauge from "../components/gauge";
import WeatherIcon from "../components/weatherIcon";
import ProductionChart from "../components/productionChart";
import LineChart from "../components/lineChart";

type Snapshot = {
  captured_at: string;
  temperature_air_c: number | string | null;
  humidity_pct: number | string | null;
  pressure_hpa: number | string | null;
  lux: number | string | null;
  flowers_white: number | string;
  fruits_green: number | string;
  fruits_yellow: number | string;
  fruits_red: number | string;
  harvested_now: number | string;
  harvest_total: number | string;
  status: string;
};

type ProductionPoint = {
  label: string;
  value: number;
};

type ApiResponse = {
  success: boolean;
  greenhouse_id: number;
  last: Snapshot | null;
  history: Snapshot[];
  monthly_production?: ProductionPoint[];
  message?: string;
};

export default function Index() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [monthlyProduction, setMonthlyProduction] = useState<ProductionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<Snapshot[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [showChartDetails, setShowChartDetails] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
        "https://theocolpaert.be/projets/tfe_test5/backend/import.php?greenhouse_id=1&limit=100"
        );

        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }

        const json: ApiResponse = await response.json();

        if (!json.success) {
          throw new Error(json.message || "Erreur API");
        }

        setData(json.last);
        setMonthlyProduction(json.monthly_production || []);
        setHistoryData(json.history || []);

      } catch (err) {
        console.error(err);
        setError("Impossible de charger les données du dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const temperature =
    data?.temperature_air_c != null
      ? `${Number(data.temperature_air_c).toFixed(1)}°C`
      : "--";

  const sunlight =
    data?.lux != null
      ? `${Number(data.lux).toFixed(1)} Lx`
      : "--";

  const humidity =
    data?.humidity_pct != null
      ? `${Number(data.humidity_pct).toFixed(0)} %`
      : "--";
  
  const pressureValue =
    data?.pressure_hpa != null ? Number(data.pressure_hpa) : null;

    const weatherType =
      pressureValue == null
        ? "cloud"
        : pressureValue < 1011
          ? "rain"
          : pressureValue > 1015
            ? "sun"
            : "cloud";

  const strawberriesReady =
    data != null ? Number(data.fruits_red || 0) : 0;

  function parseMysqlDate(dateStr: string): Date {
    return new Date(dateStr.replace(" ", "T"));
  }

  const tempAverage = (() => {
  if (!data || !historyData.length) return null;

  const lastDate = parseMysqlDate(data.captured_at);
  const minTime = lastDate.getTime() - 24 * 60 * 60 * 1000;

  const values = historyData
    .filter((row) => {
      if (!row.captured_at || row.temperature_air_c == null) return false;
      const rowDate = parseMysqlDate(row.captured_at);
      return rowDate.getTime() >= minTime && rowDate.getTime() <= lastDate.getTime();
    })
    .map((row) => Number(row.temperature_air_c))
    .filter((value) => !Number.isNaN(value));

    if (!values.length) return null;

    const sum = values.reduce((acc, value) => acc + value, 0);
    return sum / values.length;
  })();

  const sunRateAverage = (() => {
    if (!data || !historyData.length) return null;

    const lastDate = parseMysqlDate(data.captured_at);
    const minTime = lastDate.getTime() - 24 * 60 * 60 * 1000;

    const values = historyData
      .filter((row) => {
        if (!row.captured_at || row.lux == null) return false;
        const rowDate = parseMysqlDate(row.captured_at);
        return rowDate.getTime() >= minTime && rowDate.getTime() <= lastDate.getTime();
      })
      .map((row) => Number(row.lux))
      .filter((value) => !Number.isNaN(value));

    if (!values.length) return null;

    const sum = values.reduce((acc, value) => acc + value, 0);
    return sum / values.length;
  })();

  const humidityAverage = (() => {
    if (!data || !historyData.length) return null;

    const lastDate = parseMysqlDate(data.captured_at);
    const minTime = lastDate.getTime() - 24 * 60 * 60 * 1000;

    const values = historyData
      .filter((row) => {
        if (!row.captured_at || row.humidity_pct == null) return false;
        const rowDate = parseMysqlDate(row.captured_at);
        return rowDate.getTime() >= minTime && rowDate.getTime() <= lastDate.getTime();
      })
      .map((row) => Number(row.humidity_pct))
      .filter((value) => !Number.isNaN(value));

    if (!values.length) return null;

    const sum = values.reduce((acc, value) => acc + value, 0);
    return sum / values.length;
  })();

  const pressureAverage = (() => {
    if (!data || !historyData.length) return null;

    const lastDate = parseMysqlDate(data.captured_at);
    const minTime = lastDate.getTime() - 24 * 60 * 60 * 1000;

    const values = historyData
      .filter((row) => {
        if (!row.captured_at || row.pressure_hpa == null) return false;
        const rowDate = parseMysqlDate(row.captured_at);
        return rowDate.getTime() >= minTime && rowDate.getTime() <= lastDate.getTime();
      })
      .map((row) => Number(row.pressure_hpa))
      .filter((value) => !Number.isNaN(value));

    if (!values.length) return null;

    const sum = values.reduce((acc, value) => acc + value, 0);
    return sum / values.length;
  })();

  function formatDayLabel(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
  }

  const monthTempData = buildDailyAverageData(historyData, "temperature_air_c");
  const monthHumidityData = buildDailyAverageData(historyData, "humidity_pct");
  const monthPresData = buildDailyAverageData(historyData, "pressure_hpa");
  const monthSunlightData = buildDailyAverageData(historyData, "lux");

  function buildDailyAverageData( rows: Snapshot[], field: "temperature_air_c" | "humidity_pct" | "pressure_hpa" | "lux") {
    const grouped = new Map<string, number[]>();

    for (const row of rows) {
      if (!row.captured_at || row[field] == null) continue;

      const value = Number(row[field]);
      if (Number.isNaN(value)) continue;

      const date = parseMysqlDate(row.captured_at);
      const key = date.toISOString().slice(0, 10);

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }

      grouped.get(key)!.push(value);
    }

    return Array.from(grouped.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, values]) => {
        const avg = values.reduce((acc, v) => acc + v, 0) / values.length;
        const date = new Date(`${key}T00:00:00`);
        return {
          label: formatDayLabel(date),
          value: Number(avg.toFixed(2)),
        };
      });
  }

  return (
    <>
      <div className="section--logo">
        <img className="img--logo" src={import.meta.env.BASE_URL + "logo.svg"} alt="Logo de l'entreprise BerryCam"/>
        <p className="p--logo">BerryCam</p>
      </div>

      <h1 className="section--title__big">Data from Greenhouse No. 1</h1>

      {loading && <p>Chargement des données...</p>}
      {error && <p>{error}</p>}

      <div className="grid">
        <div className="card--click" onClick={() => setShowDetails((prev) => !prev)}>
          <Card>
            <p className="p--small">Temperature</p>
            <p className="p--big">{temperature}</p>
            <Gauge />

            {showDetails && (
              <p className="p--small" style={{ marginTop: "12px" }}>
                Avg last 24h:{" "}
                {tempAverage != null ? `${tempAverage.toFixed(1)}°C` : "--"}
              </p>
            )}
          </Card>
        </div>

        <div className="card--click" onClick={() => setShowDetails((prev) => !prev)}>
          <Card>
            <p className="p--small">Sunlight rate</p>
            <p className="p--big">{sunlight}</p>
            <Gauge />

            {showDetails && (
              <p className="p--small" style={{ marginTop: "12px" }}>
                Avg last 24h:{" "}
                {sunRateAverage != null ? `${sunRateAverage.toFixed(1)} Lx` : "--"}
              </p>
            )}
          </Card>
        </div>

        <div className="card--click" onClick={() => setShowDetails((prev) => !prev)}>
          <Card>
            <p className="p--small">Humidity rate</p>
            <p className="p--big">{humidity}</p>
            <Gauge />

            {showDetails && (
              <p className="p--small" style={{ marginTop: "12px" }}>
                Avg last 24h:{" "}
                {humidityAverage != null ? `${humidityAverage.toFixed(1)} %` : "--"}
              </p>
            )}
          </Card>
        </div>

        <div className="card--click" onClick={() => setShowDetails((prev) => !prev)}>
          <Card>
            <p className="p--small">Weather</p>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
              <WeatherIcon type={weatherType} size={60} />
            </div>

            {showDetails && (
              <p className="p--small" style={{ marginTop: "12px" }}>
                Avg last 24h:{" "}
                {pressureAverage != null ? `${pressureAverage.toFixed(1)} hPa` : "--"}
              </p>
            )}
          </Card>
        </div>
      </div>

      <Card>
        <div>
          <p className="p--small">Currently</p>
          <p className="p--big">{strawberriesReady} strawberries</p>
          <p className="p--small">are ready to get picked up</p>
        </div>
      </Card>

      <h1 className="section--title__big">Additional data</h1>

      <div className="card--gap">
        <Card>
          <h1>Your production per month</h1>
          <ProductionChart data={monthlyProduction} />

          <button onClick={() => setShowChartDetails((prev) => !prev)}>
            {showChartDetails ? "Close details" : "See details"}
          </button>

          {showChartDetails && (
            <div style={{ marginTop: "8px" }}>
              <LineChart
                title="Temperature over last 5 days"
                unit="°C"
                data={monthTempData}
              />

              <LineChart
                title="Humidity over last 5 days"
                unit="%"
                data={monthHumidityData}
              />

              <LineChart
                title="Pressure over last 5 days"
                unit="hPa"
                data={monthPresData}
              />

              <LineChart
                title="Sunlight over last 5 days"
                unit="Lx"
                data={monthSunlightData}
              />
            </div>
          )}
        </Card>

        <Card>
          <h1>Greenhouse data</h1>
          <div className="data--props">
            <p className="p--small__props">Length :</p>
            <p className="p--small__props">Width :</p>
            <p className="p--small__props">Height :</p>
            <p className="p--small__props">Orientation :</p>
          </div>
          <button>Change something ?</button>
        </Card>
      </div>
    </>
  );
}