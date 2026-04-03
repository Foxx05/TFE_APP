import Card from "../components/card";
import Gauge from "../components/gauge";
import GaugePercentage from "../components/gaugePercentage"
//import ProductionChart from "../components/productionChart";

export default function Index() {
return (
    <>
      <div className="section--logo">
        <img className="img--logo" src={import.meta.env.BASE_URL + "logo.svg"} alt="Logo de l'entreprise BerryCam"/>
        <p className="p--logo">BerryCam</p>
      </div>

      {/* <div className="section--top"> */}
        <h1 className="section--title__big">Data from Greenhouse No. 1</h1>
        {/* <span>The sensor data below is shown in real time.</span> */}
      {/* </div> */}

      <div className="grid">
        <Card>
          <p className="p--small">Temperature</p>
          <p className="p--big">22&#176;C</p>
          <Gauge/>
        </Card>

        <Card>
          <p className="p--small">Sunlight rate</p>
          <p className="p--big">22.5 Lx</p>
          <Gauge/>
        </Card>

        <Card>
          <p className="p--small">Humidity rate</p>
          <p className="p--big">66 %</p>
          <Gauge/>
        </Card>

        <Card>
          <p className="p--small">Culture ready at</p>
          <p className="p--big">85 %</p>
          <GaugePercentage/>
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