import { Link } from "react-router";
import { useEffect, useState } from "react";
import Card from "../components/card";

export default function Home() {
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

      <h1 className="section--title__big">Your exploitation</h1>
      <p className="p--intro">You have 3 greenhouses in your exploitation. See the details the details below.</p>

      <div className="grid">
        <Link to={`${import.meta.env.BASE_URL}greenhouseData/1`} className="card--click card--home">
            <Card>
              <p className="p--small">See datas for</p>
              <p className="p--big">No.1</p>
            </Card>
        </Link>

        <div className="card--click card--home">
          <Card>
            <p className="p--small">See datas for</p>
            <p className="p--big">No.2</p>
          </Card>
        </div>

        <div className="card--click card--home">
          <Card>
            <p className="p--small">See datas for</p>
            <p className="p--big">No.3</p>
          </Card>
        </div>

        <div className="card--click card--home">
          <Card>
            <p className="p--small">Add</p>
            <p className="p--big">+</p>
          </Card>
        </div>
      </div>

      <Card>
          <p className="p--small">Currently</p>
          <p className="p--big">206 strawberries</p>
          <p className="p--small">are ready to get picked up</p>
      </Card>
    </>
  );
}