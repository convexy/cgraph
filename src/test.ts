import { DataPoint } from "./data";
import { TimeMap } from "./timemap";

window.addEventListener("DOMContentLoaded", function () {
  const svgElement = document.getElementById("maincanvas");
  const colors = ["#00ff00", "#00ffff", "#ffff00"];
  const data: DataPoint[] = [];
  const start = new Date(2025, 3, 1, 0, 0, 0);
  const end = new Date(2025, 4, 1, 0, 0, 0);
  let dt = start;
  let flag = 0;
  while (dt.getTime() < end.getTime()) {
    const delta = (60 + Math.floor(Math.random() * (20000 - 60))) * 1000;
    // const delta = (60 + Math.floor(Math.random() * (259200 - 60))) * 1000;
    data.push(
      { startDateTime: dt, endDateTime: new Date(dt.getTime() + delta), flag: flag }
    );
    dt = new Date(dt.getTime() + delta);
    flag++;
    if (flag >= 3) flag = 0;
  }
  const timemap = new TimeMap(svgElement, colors, data);
  timemap.setYM(2025, 4);
  timemap.render();
});