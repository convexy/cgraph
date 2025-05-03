export type DataPoint = { startDateTime: Date; endDateTime: Date; flag: number };
export type Colors = string[];
export type Legends = string[];

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