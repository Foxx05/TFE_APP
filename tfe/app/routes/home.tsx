import { useNavigate } from "react-router";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import Card from "../components/Card";
import CardManage from "../components/CardManage";

export default function Home() {

  type Greenhouse = {
    greenhouse_id: number;
    name: string;
  };

  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [readyStrawberries, setReadyStrawberries] = useState(0);
  
useEffect(() => {
  async function loadDemoData() {
    const response = await fetch(`${import.meta.env.BASE_URL}backend/get_greenhouse.php`);

    const result = await response.json();

    if (result.success) {
      setGreenhouses(result.greenhouses || []);
    }

    const readyResponse = await fetch(`${import.meta.env.BASE_URL}backend/get_ready_strawberries.php`);
    const readyResult = await readyResponse.json();

    if (readyResult.success) {
      setReadyStrawberries(readyResult.ready_strawberries);
    }

  }

  loadDemoData();
}, []);

  return (
    <>
      <div className="top--nav">
        <div className="section--logo">
          <img className="img--logo" src={import.meta.env.BASE_URL + "logo.svg"} alt="Logo de l'entreprise BerryCam"/>
          <p className="p--logo">BerryCam</p>
        </div>
      </div>

      <h1 className="section--title__big">Your exploitation</h1>
      <p className="p--intro">
         You have {greenhouses.length} greenhouse{greenhouses.length > 1 ? "s" : ""} in your exploitation. See the details&nbsp;below.
      </p>

      <div className="grid">
        {greenhouses.map((greenhouse) => (
          <Link key={greenhouse.greenhouse_id} to={`/projets/tfe_appDemo/greenhouseData/${greenhouse.greenhouse_id}`} className="card--click card--home">
            <Card>
              <p className="p--small">See datas for</p>
              <p className="p--big">{greenhouse.name}</p>
            </Card>
          </Link>
        ))}

        <Link to={`${import.meta.env.BASE_URL}manageGreenhouses`} className="card--click card--home">
          <CardManage>
            <p className="p--small">Manage</p>
            <p className="p--big">your farm</p>
          </CardManage>
        </Link>
      </div>

      <Card>
        <p className="p--small">Currently</p>
        <p className="p--big">{readyStrawberries} strawberries</p>
        <p className="p--small"> are ready to get picked up</p>
      </Card>
    </>
  );
}