import { DataPoint, Colors, Scale, Time } from "./data";

const fontSize = "12";
const fontFamily = "Roboto";

export class TimeMap {
  private svg: SVGSVGElement;
  private data: DataPoint[];
  private colors: Colors;
  private xScale: Scale;
  private yScale: Scale;
  private year: number;
  private month: number;
  private dataPointAreas: SVGGElement[];
  constructor(svgElement: HTMLElement | SVGSVGElement | null, colors: Colors, data: DataPoint[]) {
    if (!svgElement || !(svgElement instanceof SVGSVGElement)) throw new Error("SVG element not found!");

    this.svg = svgElement;
    this.data = [...data];
    this.colors = colors;
    this.xScale = new Scale(0, 20, 86400, this.svg.width.baseVal.value - 30);
    this.yScale = new Scale(1, 20, 32, this.svg.height.baseVal.value - 30);
    this.year = 2000;
    this.month = 1;
    this.dataPointAreas = [];
  }
  public setYM(year: number, month: number) {
    this.year = year;
    this.month = month;
  }
  public clear() {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
    this.dataPointAreas.length = 0;
  }
  public updateScale() {
    this.xScale.maxCoord = this.svg.width.animVal.value - 30;
    this.yScale.maxCoord = this.svg.height.animVal.value - 30;
  }
  public drawAxes() {
    this.updateScale();
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", this.xScale.minCoord.toString());
    xAxis.setAttribute("y1", this.yScale.minCoord.toString());
    xAxis.setAttribute("x2", this.xScale.maxCoord.toString());
    xAxis.setAttribute("y2", this.yScale.minCoord.toString());
    xAxis.setAttribute("stroke", "black");
    xAxis.setAttribute("stroke-width", "1");
    this.svg.appendChild(xAxis);
    for (let i = 0; i <= 86400; i += 60 * 60) {
      const time = new Time(i);
      if (time.getHours() % 2 == 0) {
        if (i < 86400) {
          const xAxisTickLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
          xAxisTickLabel.setAttribute("x", this.xScale.getCoord(time.getValue()).toString());
          xAxisTickLabel.setAttribute("y", (this.yScale.minCoord - 4).toString());
          xAxisTickLabel.setAttribute("font-family", fontFamily);
          xAxisTickLabel.setAttribute("font-size", fontSize);
          xAxisTickLabel.setAttribute("fill", "black");
          xAxisTickLabel.textContent = time.toHMString();
          this.svg.appendChild(xAxisTickLabel);
        }
        const xAxisTick = document.createElementNS("http://www.w3.org/2000/svg", "line");
        xAxisTick.setAttribute("x1", this.xScale.getCoord(time.getValue()).toString());
        xAxisTick.setAttribute("y1", this.yScale.minCoord.toString());
        xAxisTick.setAttribute("x2", this.xScale.getCoord(time.getValue()).toString());
        xAxisTick.setAttribute("y2", (this.yScale.minCoord - 4).toString());
        xAxisTick.setAttribute("stroke", "black");
        xAxisTick.setAttribute("stroke-width", "1");
        this.svg.appendChild(xAxisTick);
      }
      else {
        const xAxisTick = document.createElementNS("http://www.w3.org/2000/svg", "line");
        xAxisTick.setAttribute("x1", this.xScale.getCoord(time.getValue()).toString());
        xAxisTick.setAttribute("y1", this.yScale.minCoord.toString());
        xAxisTick.setAttribute("x2", this.xScale.getCoord(time.getValue()).toString());
        xAxisTick.setAttribute("y2", (this.yScale.minCoord - 2).toString());
        xAxisTick.setAttribute("stroke", "black");
        xAxisTick.setAttribute("stroke-width", "1");
        this.svg.appendChild(xAxisTick);

      }
    }
    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", (this.xScale.minCoord - 0.5).toString());
    yAxis.setAttribute("y1", this.yScale.minCoord.toString());
    yAxis.setAttribute("x2", (this.xScale.minCoord - 0.5).toString());
    yAxis.setAttribute("y2", this.yScale.maxCoord.toString());
    yAxis.setAttribute("stroke", "black");
    yAxis.setAttribute("stroke-width", "1");
    this.svg.appendChild(yAxis);
    const lastDay = this.getLastDay();
    for (let j = 1; j <= 31; j += 1) {
      if (j <= lastDay) {
        const yAxisTickLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        yAxisTickLabel.setAttribute("x", (this.xScale.minCoord - 4).toString());
        yAxisTickLabel.setAttribute("y", ((this.yScale.getCoord(j) + this.yScale.getCoord(j + 1)) / 2).toString())
        yAxisTickLabel.setAttribute("font-family", fontFamily);
        yAxisTickLabel.setAttribute("font-size", fontSize);
        yAxisTickLabel.setAttribute("fill", "black");
        yAxisTickLabel.setAttribute("text-anchor", "end");
        yAxisTickLabel.setAttribute("dominant-baseline", "middle");
        yAxisTickLabel.textContent = j.toString();
        this.svg.appendChild(yAxisTickLabel);
      }
      const xAxisTick = document.createElementNS("http://www.w3.org/2000/svg", "line");
      xAxisTick.setAttribute("x1", (this.xScale.minCoord - 3).toString());
      xAxisTick.setAttribute("y1", this.yScale.getCoord(j).toString());
      xAxisTick.setAttribute("x2", this.xScale.minCoord.toString());
      xAxisTick.setAttribute("y2", this.yScale.getCoord(j).toString());
      xAxisTick.setAttribute("stroke", "black");
      xAxisTick.setAttribute("stroke-width", "1");
      this.svg.appendChild(xAxisTick);
    }
  }
  public plotData() {
    const data = this.data.filter(a =>
      (a.startDateTime.getFullYear() == this.year && a.startDateTime.getMonth() + 1 == this.month)
      || (a.endDateTime.getFullYear() == this.year && a.endDateTime.getMonth() + 1 == this.month)
    );
    data.sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());
    const plotArea = document.createElementNS("http://www.w3.org/2000/svg", "g");
    plotArea.classList.add("cgraph-plotarea");
    const dataPointAreas: SVGGElement[] = [];
    for (const dataPoint of data) {
      let startDay = 1;
      let startTime = new Time(0);
      let endDay = this.getLastDay();
      let endTime = new Time(86400);
      if ((new Date(this.year, this.month - 1, 1)).getTime() <= dataPoint.startDateTime.getTime()) {
        startDay = dataPoint.startDateTime.getDate();
        startTime.set(dataPoint.startDateTime);
      }
      if (dataPoint.endDateTime.getTime() <= (new Date(this.year, this.month, 1)).getTime()) {
        endDay = dataPoint.endDateTime.getDate();
        endTime.set(dataPoint.endDateTime);
      }
      console.log(startDay, startTime, endDay, endTime);
      const dataPointArea = document.createElementNS("http://www.w3.org/2000/svg", "g");
      dataPointArea.setAttribute("fill", this.colors[dataPoint.flag]);
      dataPointArea.classList.add("cgraph-tm-datapoint");
      dataPointArea.addEventListener("mouseenter", function () {
        dataPointArea.classList.add("cgraph-active");
        dataPointAreas.forEach(dpa => {
          if (dpa != dataPointArea) dpa.classList.add("cgraph-inactive");
        })
      });
      dataPointArea.addEventListener("mouseleave", function () {
        dataPointArea.classList.remove("cgraph-active");
        dataPointAreas.forEach(dpa => {
          if (dpa != dataPointArea) dpa.classList.remove("cgraph-inactive");
        })
      });
      const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = ""
        + "開始: " + dataPoint.startDateTime.toLocaleString() + "\n"
        + "終了: " + dataPoint.endDateTime.toLocaleString() + "\n"
        + "フラグ: " + dataPoint.flag;
      dataPointArea.appendChild(title);
      for (let day = startDay; day <= endDay; day++) {
        let rowStartTime = day == startDay ? startTime : new Time(0);
        let rowEndTime = day == endDay ? endTime : new Time(86400);
        const box = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        box.setAttribute("x", this.xScale.getCoord(rowStartTime.getValue()).toString());
        box.setAttribute("y", this.yScale.getCoord(day).toString());
        box.setAttribute("width", (this.xScale.getCoord(rowEndTime.getValue()) - this.xScale.getCoord(rowStartTime.getValue()) - 3).toString());
        box.setAttribute("height", (this.yScale.getCoord(day + 1) - this.yScale.getCoord(day) - 1).toString());
        dataPointArea.appendChild(box);
        dataPointAreas.push(dataPointArea);
      }
      plotArea.appendChild(dataPointArea)
    }
    this.dataPointAreas.push(...dataPointAreas);
    this.svg.appendChild(plotArea);
  }

  public render() {
    this.clear();
    this.drawAxes();
    this.plotData();
  }

  public getLastDay() {
    const nextMonth = new Date(this.year, this.month, 1);
    nextMonth.setDate(nextMonth.getDate() - 1);
    return nextMonth.getDate();
  }

}



