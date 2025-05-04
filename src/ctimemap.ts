const fontSize = "12";
const fontFamily = "'Meiryo UI','ヒラギノ角ゴシック','Hiragino Sans','Hiragino Kaku Gothic ProN','ヒラギノ角ゴ ProN W3',sans-serif";
const baseColor = "black";
const axisColor = "gray";

export class Scale {
  public minValue: number;
  public minCoord: number;
  public maxValue: number;
  public maxCoord: number;
  constructor(minValue: number, minCoord: number, maxValue: number, maxCoord: number) {
    this.minValue = minValue;
    this.minCoord = minCoord;
    this.maxValue = maxValue;
    this.maxCoord = maxCoord;
  }
  getCoord(value: number) {
    return (value - this.minValue) * (this.maxCoord - this.minCoord) / (this.maxValue - this.minValue) + this.minCoord;
  }
  getValue(coord: number) {
    return (coord - this.minCoord) * (this.maxValue - this.minValue) / (this.maxCoord - this.minCoord) + this.minValue;
  }
}
export type CTMDataRecord = { startDateTime: Date; endDateTime: Date; flag: number };
export type Colors = string[];
export type Legends = string[];

export class Time {
  private value: Date;
  private last: boolean;
  constructor(value: number | Date) {
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    if (value instanceof Date) {
      hours = value.getHours();
      minutes = value.getMinutes();
      seconds = value.getSeconds();
      this.last = false;
    }
    else {
      hours = Math.floor(value / 60 / 60);
      minutes = Math.floor((value - hours * 60 * 60) / 60);
      seconds = Math.floor((value - hours * 60 * 60 - minutes * 60));
      this.last = value == 86400;
    }
    this.value = new Date(2000, 0, 1, hours, minutes, seconds);
  }
  set(value: number | Date) {
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    if (value instanceof Date) {
      hours = value.getHours();
      minutes = value.getMinutes();
      seconds = value.getSeconds();
      this.last = false;
    }
    else {
      hours = Math.floor(value / 60 / 60);
      minutes = Math.floor((value - hours * 60 * 60) / 60);
      seconds = Math.floor((value - hours * 60 * 60 - minutes * 60));
      this.last = value == 86400;
    }
    this.value = new Date(2000, 0, 1, hours, minutes, seconds);
  }
  getValue() {
    return this.last ? 86400 : this.value.getHours() * 60 * 60 + this.value.getMinutes() * 60 + this.value.getSeconds();
  }
  getHours() {
    return this.value.getHours();
  }
  getMinutes() {
    return this.value.getMinutes();
  }
  getSeconds() {
    return this.value.getSeconds();
  }
  toString() {
    return this.value.getHours() + ":" + this.value.getMinutes().toString().padStart(2, "0") + ":" + this.value.getSeconds().toString().padStart(2, "0");
  }
  toHMString() {
    return this.value.getHours() + ":" + this.value.getMinutes().toString().padStart(2, "0");
  }
}
export class CTimeMap {
  private title: string | undefined;
  private xAxisLabel: string | undefined;
  private yAxisLabel: string | undefined;
  private svg: SVGSVGElement;
  private data: CTMDataRecord[];
  private colors: Colors;
  private legends: Legends;
  private xScale: Scale;
  private yScale: Scale;
  private year: number;
  private month: number;
  private dataPointAreas: SVGGElement[];
  constructor(svgElement: HTMLElement | SVGSVGElement | null, data: CTMDataRecord[], colors: Colors, legends: Legends, options?: {
    title?: string, xAxisLabel?: string, yAxisLabel?: string
  }) {
    if (!svgElement || !(svgElement instanceof SVGSVGElement)) throw new Error("SVG element not found!");
    this.title = options?.title;
    this.xAxisLabel = options?.xAxisLabel;
    this.yAxisLabel = options?.yAxisLabel;

    this.svg = svgElement;
    this.data = [...data];
    this.colors = colors;
    this.legends = legends;
    this.xScale = new Scale(0, 20 + (this.yAxisLabel ? 20 : 0), 86400, this.svg.width.baseVal.value - 100);
    this.yScale = new Scale(1, 20 + (this.title ? 20 : 0) + (this.xAxisLabel ? 20 : 0), 32, this.svg.height.baseVal.value - 20);
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
    this.xScale.maxCoord = this.svg.width.animVal.value - 100;
    this.yScale.maxCoord = this.svg.height.animVal.value - 20;
  }
  public drawYM() {
    const ym = document.createElementNS("http://www.w3.org/2000/svg", "text");
    ym.setAttribute("x", (50).toString());
    ym.setAttribute("y", (10 + (this.title ? 20 : 0)).toString());
    ym.setAttribute("font-family", fontFamily);
    ym.setAttribute("font-size", fontSize);
    ym.setAttribute("fill", "black");
    ym.setAttribute("text-anchor", "middle");
    ym.setAttribute("dominant-baseline", "middle");
    ym.textContent = this.year + "年" + this.month + "月";
    this.svg.appendChild(ym);
    const left = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    left.setAttribute("points", ""
      + `15,${5 + (this.title ? 20 : 0)} `
      + `5,${10 + (this.title ? 20 : 0)} `
      + `15,${15 + (this.title ? 20 : 0)} `
    );
    left.setAttribute("fill", "black");
    left.textContent = this.year + "年" + this.month + "月";
    const lastMonth = this.month > 1 ? { year: this.year, month: this.month - 1 } : { year: this.year - 1, month: 12 };
    if (this.data.some(dataRecord => dataRecord.startDateTime.getFullYear() < lastMonth.year || (dataRecord.startDateTime.getFullYear() == lastMonth.year && dataRecord.startDateTime.getMonth() + 1 <= lastMonth.month))) {
      left.classList.add("cgraph-inactive");
      left.addEventListener("mouseenter", () => left.classList.remove("cgraph-inactive"));
      left.addEventListener("mouseleave", () => left.classList.add("cgraph-inactive"));
      left.addEventListener("click", () => { this.setYM(lastMonth.year, lastMonth.month); this.render(); })
    }
    else {
      left.classList.add("cgraph-disable");
    }
    this.svg.appendChild(left);
    const right = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    right.setAttribute("points", ""
      + `85,${5 + (this.title ? 20 : 0)} `
      + `95,${10 + (this.title ? 20 : 0)} `
      + `85,${15 + (this.title ? 20 : 0)} `
    );
    right.setAttribute("fill", "black");
    right.textContent = this.year + "年" + this.month + "月";
    const nextMonth = this.month < 12 ? { year: this.year, month: this.month + 1 } : { year: this.year + 1, month: 1 };
    if (this.data.some(dataRecord => dataRecord.endDateTime.getFullYear() > nextMonth.year || (dataRecord.endDateTime.getFullYear() == nextMonth.year && dataRecord.endDateTime.getMonth() + 1 >= nextMonth.month))) {
      right.classList.add("cgraph-inactive");
      right.addEventListener("mouseenter", () => right.classList.remove("cgraph-inactive"));
      right.addEventListener("mouseleave", () => right.classList.add("cgraph-inactive"));
      right.addEventListener("click", () => { this.setYM(nextMonth.year, nextMonth.month); this.render(); })
    }
    else {
      right.classList.add("cgraph-disable");
    }
    this.svg.appendChild(right);
  }
  public drawAxes() {
    this.updateScale();
    if (this.xAxisLabel) {
      const xAxisTitle = document.createElementNS("http://www.w3.org/2000/svg", "text");
      xAxisTitle.setAttribute("x", ((this.xScale.maxCoord - this.xScale.minCoord) / 2 + this.xScale.minCoord).toString());
      xAxisTitle.setAttribute("y", (10 + (this.title ? 20 : 0)).toString());
      xAxisTitle.setAttribute("font-family", fontFamily);
      xAxisTitle.setAttribute("font-size", fontSize);
      xAxisTitle.setAttribute("fill", "black");
      xAxisTitle.setAttribute("text-anchor", "middle");
      xAxisTitle.setAttribute("dominant-baseline", "middle");
      xAxisTitle.textContent = this.xAxisLabel;
      this.svg.appendChild(xAxisTitle);
    }
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", this.xScale.minCoord.toString());
    xAxis.setAttribute("y1", (this.yScale.minCoord - 0.5).toString());
    xAxis.setAttribute("x2", this.xScale.maxCoord.toString());
    xAxis.setAttribute("y2", (this.yScale.minCoord - 0.5).toString());
    xAxis.setAttribute("stroke", axisColor);
    xAxis.setAttribute("stroke-width", "1");
    this.svg.appendChild(xAxis);
    const xDefaultSkip = 60 * 60;
    const xAllConut = (this.xScale.maxValue - this.xScale.minValue) / xDefaultSkip;
    const xSpace = (this.xScale.maxCoord - this.xScale.minCoord);
    const xOneSpace = 40;
    const xDisplayCount = xSpace / xOneSpace;
    const xSkip = Math.ceil(xAllConut / xDisplayCount);
    for (let i = 0; i <= 86400; i += 60 * 60) {
      const time = new Time(i);
      if (i < 86400 && i / xDefaultSkip % xSkip == 0) {
        const xAxisTickLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        xAxisTickLabel.setAttribute("x", this.xScale.getCoord(time.getValue()).toString());
        xAxisTickLabel.setAttribute("y", (this.yScale.minCoord - 8).toString());
        xAxisTickLabel.setAttribute("font-family", fontFamily);
        xAxisTickLabel.setAttribute("font-size", fontSize);
        xAxisTickLabel.setAttribute("fill", baseColor);
        xAxisTickLabel.textContent = time.toHMString();
        this.svg.appendChild(xAxisTickLabel);
      }
      if (time.getHours() % 2 == 0) {
        const xAxisTick = document.createElementNS("http://www.w3.org/2000/svg", "line");
        xAxisTick.setAttribute("x1", this.xScale.getCoord(time.getValue()).toString());
        xAxisTick.setAttribute("y1", this.yScale.minCoord.toString());
        xAxisTick.setAttribute("x2", this.xScale.getCoord(time.getValue()).toString());
        xAxisTick.setAttribute("y2", (this.yScale.minCoord - 4).toString());
        xAxisTick.setAttribute("stroke", axisColor);
        xAxisTick.setAttribute("stroke-width", "1");
        this.svg.appendChild(xAxisTick);
      }
      else {
        const xAxisTick = document.createElementNS("http://www.w3.org/2000/svg", "line");
        xAxisTick.setAttribute("x1", this.xScale.getCoord(time.getValue()).toString());
        xAxisTick.setAttribute("y1", this.yScale.minCoord.toString());
        xAxisTick.setAttribute("x2", this.xScale.getCoord(time.getValue()).toString());
        xAxisTick.setAttribute("y2", (this.yScale.minCoord - 2).toString());
        xAxisTick.setAttribute("stroke", axisColor);
        xAxisTick.setAttribute("stroke-width", "1");
        this.svg.appendChild(xAxisTick);

      }
    }
    if (this.yAxisLabel) {
      const yAxisTitle = document.createElementNS("http://www.w3.org/2000/svg", "text");
      yAxisTitle.setAttribute("x", (10).toString());
      yAxisTitle.setAttribute("y", ((this.yScale.maxCoord - this.yScale.minCoord) / 2 + this.yScale.minCoord).toString());
      yAxisTitle.setAttribute("font-family", fontFamily);
      yAxisTitle.setAttribute("font-size", fontSize);
      yAxisTitle.setAttribute("fill", "black");
      yAxisTitle.setAttribute("text-anchor", "middle");
      yAxisTitle.setAttribute("dominant-baseline", "middle");
      yAxisTitle.textContent = this.yAxisLabel;
      yAxisTitle.setAttribute("transform", `rotate(-90 10 ${(this.yScale.maxCoord - this.yScale.minCoord) / 2 + this.yScale.minCoord})`);
      this.svg.appendChild(yAxisTitle);
    }
    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", (this.xScale.minCoord - 0.5).toString());
    yAxis.setAttribute("y1", this.yScale.minCoord.toString());
    yAxis.setAttribute("x2", (this.xScale.minCoord - 0.5).toString());
    yAxis.setAttribute("y2", this.yScale.maxCoord.toString());
    yAxis.setAttribute("stroke", axisColor);
    yAxis.setAttribute("stroke-width", "1");
    this.svg.appendChild(yAxis);
    const yDefaultSkip = 1;
    const yAllConut = (this.yScale.maxValue - this.yScale.minValue) / yDefaultSkip;
    const ySpace = (this.yScale.maxCoord - this.yScale.minCoord);
    const yOneSpace = 14;
    const yDisplayCount = ySpace / yOneSpace;
    const ySkip = Math.ceil(yAllConut / yDisplayCount);
    const lastDay = this.getLastDay();
    for (let j = 1; j <= 31; j += 1) {
      if (j <= lastDay && (j - 1) / yDefaultSkip % ySkip == 0) {
        const yAxisTickLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        yAxisTickLabel.setAttribute("x", (this.xScale.minCoord - 6).toString());
        yAxisTickLabel.setAttribute("y", ((this.yScale.getCoord(j) + this.yScale.getCoord(j + 1)) / 2).toString())
        yAxisTickLabel.setAttribute("font-family", fontFamily);
        yAxisTickLabel.setAttribute("font-size", fontSize);
        yAxisTickLabel.setAttribute("fill", baseColor);
        yAxisTickLabel.setAttribute("text-anchor", "end");
        yAxisTickLabel.setAttribute("dominant-baseline", "middle");
        yAxisTickLabel.textContent = j.toString();
        this.svg.appendChild(yAxisTickLabel);
      }
      const yAxisTick = document.createElementNS("http://www.w3.org/2000/svg", "line");
      yAxisTick.setAttribute("x1", (this.xScale.minCoord - 3).toString());
      yAxisTick.setAttribute("y1", this.yScale.getCoord(j).toString());
      yAxisTick.setAttribute("x2", this.xScale.minCoord.toString());
      yAxisTick.setAttribute("y2", this.yScale.getCoord(j).toString());
      yAxisTick.setAttribute("stroke", axisColor);
      yAxisTick.setAttribute("stroke-width", "1");
      this.svg.appendChild(yAxisTick);
    }
  }
  public plotData() {
    const data = this.data.filter(dataRecord =>
      (dataRecord.startDateTime.getFullYear() == this.year && dataRecord.startDateTime.getMonth() + 1 == this.month)
      || (dataRecord.endDateTime.getFullYear() == this.year && dataRecord.endDateTime.getMonth() + 1 == this.month)
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
        + "時間: " + ((dataPoint.endDateTime.getTime() - dataPoint.startDateTime.getTime()) / 1000 / 60).toFixed(1) + "分\n"
        + "フラグ: " + this.legends[dataPoint.flag];
      dataPointArea.appendChild(title);
      for (let day = startDay; day <= endDay; day++) {
        let rowStartTime = day == startDay ? startTime : new Time(0);
        let rowEndTime = day == endDay ? endTime : new Time(86400);
        const box = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        box.setAttribute("x", this.xScale.getCoord(rowStartTime.getValue()).toString());
        box.setAttribute("y", this.yScale.getCoord(day).toString());
        box.setAttribute("width", ((this.xScale.getCoord(rowEndTime.getValue()) - this.xScale.getCoord(rowStartTime.getValue())) > 1 ? this.xScale.getCoord(rowEndTime.getValue()) - this.xScale.getCoord(rowStartTime.getValue()) - 1 : 1).toString());
        box.setAttribute("height", (this.yScale.getCoord(day + 1) - this.yScale.getCoord(day) - 1).toString());
        dataPointArea.appendChild(box);
        dataPointAreas.push(dataPointArea);
      }
      plotArea.appendChild(dataPointArea)
    }
    this.dataPointAreas.push(...dataPointAreas);
    this.svg.appendChild(plotArea);
  }
  public drawTitle() {
    if (this.title) {
      const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
      title.setAttribute("x", (10).toString());
      title.setAttribute("y", (10).toString());
      title.setAttribute("font-family", fontFamily);
      title.setAttribute("font-size", fontSize);
      title.setAttribute("font-weight", "bold");
      title.setAttribute("fill", "black");
      title.setAttribute("dominant-baseline", "middle");
      title.textContent = this.title;
      this.svg.appendChild(title);
    }
  }
  public drawLegends() {
    const legendRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    legendRect.setAttribute("x", (this.svg.width.animVal.value - 90).toString());
    legendRect.setAttribute("y", (20).toString());
    legendRect.setAttribute("width", (80).toString());
    legendRect.setAttribute("height", (20 * (this.legends.length + 1)).toString());
    legendRect.setAttribute("fill", "white");
    legendRect.setAttribute("stroke", "white");
    this.svg.appendChild(legendRect);
    const legendTitle = document.createElementNS("http://www.w3.org/2000/svg", "text");
    legendTitle.setAttribute("x", (this.svg.width.animVal.value - 80).toString());
    legendTitle.setAttribute("y", (10 + 20).toString());
    legendTitle.setAttribute("font-family", fontFamily);
    legendTitle.setAttribute("font-size", fontSize);
    legendTitle.setAttribute("font-weight", "bold");
    legendTitle.setAttribute("fill", baseColor);
    legendTitle.setAttribute("dominant-baseline", "middle");
    legendTitle.textContent = "凡例";
    this.svg.appendChild(legendTitle);
    for (let i = 0; i < this.legends.length; i++) {
      const box = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      box.setAttribute("x", (this.svg.width.animVal.value - 80).toString());
      box.setAttribute("y", (10 + (i + 2) * 20 - 10).toString());
      box.setAttribute("width", (20).toString());
      box.setAttribute("height", (18).toString());
      box.setAttribute("fill", this.colors[i]);
      this.svg.appendChild(box);
      const legend = document.createElementNS("http://www.w3.org/2000/svg", "text");
      legend.setAttribute("x", (this.svg.width.animVal.value - 50).toString());
      legend.setAttribute("y", (10 + (i + 2) * 20).toString());
      legend.setAttribute("font-family", fontFamily);
      legend.setAttribute("font-size", fontSize);
      legend.setAttribute("fill", baseColor);
      legend.setAttribute("dominant-baseline", "middle");
      legend.textContent = this.legends[i];
      this.svg.appendChild(legend);
    }
  }
  public render() {
    this.clear();
    this.drawTitle();
    this.drawYM();
    this.drawAxes();
    this.plotData();
    this.drawLegends();
  }
  public getLastDay() {
    const nextMonth = new Date(this.year, this.month, 1);
    nextMonth.setDate(nextMonth.getDate() - 1);
    return nextMonth.getDate();
  }
  public addData(data: CTMDataRecord[]) {
    this.data.push(...data.filter(newDataRecord => this.data.every(dataRecord =>
      dataRecord.startDateTime.getTime() != newDataRecord.startDateTime.getTime()
      || dataRecord.endDateTime.getTime() != newDataRecord.endDateTime.getTime()
      || dataRecord.flag != newDataRecord.flag
    )));
    this.render();
  }
}



