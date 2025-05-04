import { CTMDataRecord, CTimeMapWithTable, Calculation } from "./ctimemapwithtable";

window.addEventListener("DOMContentLoaded", function () {
  const svgElement = document.getElementById("maincanvas");
  const colors = ["#00ff00", "#00ffff", "#ffff00"];
  const legends = ["稼働", "段替", "停止"];
  const data: CTMDataRecord[] = [];
  const start = new Date(2025, 2, 1, 0, 0, 0);
  const end = new Date(2025, 4, 1, 0, 0, 0);
  const calculations: { func: Calculation[], legends: string[] } = {
    func: [array => {
      let x0 = array.reduce((sum, value) => sum + (value.flag == 0 ? value.time : 0), 0);
      let x1 = array.reduce((sum, value) => sum + (value.flag == 1 ? value.time : 0), 0);
      let x2 = array.reduce((sum, value) => sum + (value.flag == 2 ? value.time : 0), 0);
      return (x0 / (x0 + x1 + x2) * 100).toFixed(1);
    },
    array => array.filter(value => value.flag == 1).length.toString()
    ],
    legends: ["稼働率", "段替回数"]
  }
  let dt = start;
  let flag = 0;
  while (dt.getTime() < end.getTime()) {
    // const delta = (60 + Math.floor(Math.random() * (20000 - 60))) * 1000;
    const delta = (60 + Math.floor(Math.random() * (10000 - 60))) * 1000;
    data.push(
      { startDateTime: dt, endDateTime: new Date(dt.getTime() + delta), flag: flag }
    );
    dt = new Date(dt.getTime() + delta);
    flag++;
    if (flag >= 3) flag = 0;
  }
  const data2: CTMDataRecord[] = [];
  const end2 = new Date(2025, 6, 1, 0, 0, 0);
  while (dt.getTime() < end2.getTime()) {
    const delta = (60 + Math.floor(Math.random() * (4000 - 60))) * 1000;
    data2.push(
      { startDateTime: dt, endDateTime: new Date(dt.getTime() + delta), flag: flag }
    );
    dt = new Date(dt.getTime() + delta);
    flag++;
    if (flag >= 3) flag = 0;
  }
  const timemap = new CTimeMapWithTable(svgElement, data, colors, legends, { title: "稼働マップ", xAxisLabel: "時刻", yAxisLabel: "日付", calculations: calculations });
  timemap.setYM(2025, 4);
  timemap.render();
  setTimeout(() => {
    timemap.addData(data2);
  }, 3000);
});