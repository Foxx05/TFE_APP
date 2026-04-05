import { useEffect, useState } from "react";
import Card from "../components/card";
import Gauge from "../components/gauge";
import GaugePercentage from "../components/gaugePercentage";
// import ProductionChart from "../components/productionChart";

type Snapshot = {
  captured_at: string;
  temperature_air_c: number | null;
  humidity_pct: number | null;
  pressure_hpa: number | null;
  lux: number | null;
  flowers_white: number;
  fruits_green: number;
  fruits_yellow: number;
  fruits_red: number;
  harvested_now: number;
  harvest_total: number;
  status: string;
};

type ApiResponse = {
  success: boolean;
  greenhouse_id: number;
  last: Snapshot | null;
  history: Snapshot[];
  message?: string;
};

export default function Index() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSensors() {
      try {
        setLoading(true);
        setError(null);

      const response = await fetch(
        "https://theocolpaert.be/projets/tfe_test2/backend/import.php?greenhouse_id=1&limit=100"
      );

        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }

        const json: ApiResponse = await response.json();

        if (!json.success) {
          throw new Error(json.message || "Erreur API");
        }

        setData(json.last);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les données capteurs.");
      } finally {
        setLoading(false);
      }
    }

    loadSensors();
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

      {loading && <p>Chargement des données capteurs...</p>}
      {error && <p>{error}</p>}

      <div className="grid">
        <Card>
          <p className="p--small">Temperature</p>
          <p className="p--big">{temperature}</p>
          <Gauge />
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
          <p className="p--small">Culture ready at</p>
          <p className="p--big">85 %</p>
          <GaugePercentage />
        </Card>
      </div>

      <Card>
        <div>
          <p className="p--small">Currently</p>
          <p className="p--big">206 strawberries</p>
          <p className="p--small">are ready to get picked up</p>
        </div>
      </Card>

      <h1 className="section--title__big">Additional data</h1>

    <div className="card--gap">
      <Card>
        <h1>Your production per month</h1>
        {/* <ProductionChart/> */}
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