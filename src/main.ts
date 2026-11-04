import "./style.css";

const app = document.querySelector<HTMLElement>("#app")!;

const title = document.createElement("h1");
title.textContent = "3d Sketchbook";

//Wrapper for canvas and toolbar
const layout = document.createElement("div");
layout.className = "layout";

const canvas = document.createElement("canvas");
canvas.width = 750;
canvas.height = 750;

const toolbar = document.createElement("div");
toolbar.className = "toolbar";

layout.append(canvas, toolbar);
app.append(title, layout);

const _ctx = canvas.getContext("2d")!;

interface Point {
  x: number;
  y: number;
}

//an interface will allow for brushstrokes, stamps, and lines to be drawn
interface DrawCmd {
  display(ctx: CanvasRenderingContext2D): void;
}

// deno-lint-ignore no-unused-vars
class MarkerStroke implements DrawCmd {
  private points: Point[] = [];
  private color: string;
  private width: number;

  constructor(start: Point, color: string, width: number) {
    this.points.push(start);
    this.color = color;
    this.width = width;
  }

  drag(pt: Point) {
    this.points.push(pt);
  }

  display(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);

    if (this.points.length === 1) {
      ctx.lineTo(this.points[0].x + 0.01, this.points[0].y); //click creates a dot
    }
    for (let i = 0; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y);
    }
  }
}
