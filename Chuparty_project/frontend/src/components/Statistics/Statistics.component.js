import React, { Component } from "react";
import GrowthGraph from "./GrowthGraph.component";
import BarChart from "./BarChart.component";

export default class Statistics extends Component {
  render() {
    return (
      <div>
        <GrowthGraph />
        <br /> <br />
        <hr />
        <BarChart />
      </div>
    );
  }
}
