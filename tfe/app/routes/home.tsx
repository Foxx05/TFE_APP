import { useEffect, useState } from "react";
import Card from "../components/card";
import Gauge from "../components/gauge";
import WeatherIcon from "../components/weatherIcon";
import ProductionChart from "../components/productionChart";

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
  const [showT, setShowT] = useState(false);
  const [historyData, setHistoryData] = useState<Snapshot[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "https://theocolpaert.be/projets/tfe_test3/backend/import.php?greenhouse_id=1&limit=100"
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

    const weatherLabel =
      weatherType === "rain"
        ? "Rainy"
        : weatherType === "sun"
          ? "Sunny"
          : "Cloudy";

  const strawberriesReady =
    data != null ? Number(data.fruits_red || 0) : 0;

  function parseMysqlDate(dateStr: string): Date {
  // "2026-09-29 20:00:00" -> Date locale
  return new Date(dateStr.replace(" ", "T"));
  }

  const temp24hAverage = (() => {
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

  return (
    <>
      <div className="section--logo">
        <img
          className="img--logo"
          src={import.meta.env.BASE_URL + "logo.svg"}
          alt="Logo de l'entreprise BerryCam"
        />
        <p className="p--logo">BerryCam</p>
      </div>

      <h1 className="section--title__big">Data from Greenhouse No. 1</h1>

      {loading && <p>Chargement des données...</p>}
      {error && <p>{error}</p>}

      <div className="grid">
        <Card>
          <div
            onClick={() => setShowT((prev) => !prev)}
            style={{ cursor: "pointer" }}
          >
            <p className="p--small">Temperature</p>
            <p className="p--big">{temperature}</p>
            <Gauge />

            {showT && (
              <p className="p--small" style={{ marginTop: "12px" }}>
                Avg last 24h:{" "}
                {temp24hAverage != null ? `${temp24hAverage.toFixed(1)}°C` : "--"}
              </p>
            )}
          </div>
        </Card>

        <Card>
          <p className="p--small">Sunlight rate</p>
          <p className="p--big">{sunlight}</p>
          <Gauge />
        </Card>

        <Card>
          <p className="p--small">Humidity rate</p>
          <p className="p--big">{humidity}</p>
          <Gauge />
        </Card>

        <Card>
            <p className="p--small">Weather</p>
            <div style={{display: "flex", justifyContent: "center", marginTop: "8px"}}>
              <WeatherIcon type={weatherType} size={60} />
            </div>
        </Card>
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
          <button>See in details</button>
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