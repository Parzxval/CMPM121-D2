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

const ctx = canvas.getContext("2d")!;

interface Point {
  x: number;
  y: number;
}

//an interface will allow for brushstrokes, stamps, and lines to be drawn
interface DrawCmd {
  display(ctx: CanvasRenderingContext2D): void;
}

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

    ctx.stroke();
    ctx.restore();
  }
}

//create an array to store each drawing mark
const commands: DrawCmd[] = [];

//Recreates all marks so that canvas marks can be later exported
function render(
  target: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  target.fillStyle = "white";
  target.fillRect(0, 0, width, height);

  for (let i = 0; i < commands.length; i++) {
    commands[i].display(target);
  }
}

function redraw() {
  render(ctx, canvas.width, canvas.height);
}

redraw();

let currentStroke: MarkerStroke | null = null;

canvas.addEventListener("pointerdown", (event) => {
  canvas.setPointerCapture(event.pointerId);
  currentStroke = new MarkerStroke(
    { x: event.offsetX, y: event.offsetY },
    "black",
    2,
  );
  commands.push(currentStroke);
  redraw();
});

canvas.addEventListener("pointermove", (event) => {
  if (currentStroke === null) {
    return;
  }
  currentStroke.drag({ x: event.offsetX, y: event.offsetY });
  redraw();
});

canvas.addEventListener("pointerup", () => {
  currentStroke = null;
});

//throw away stroke on browser interrupt
canvas.addEventListener("pointercancel", () => {
  if (currentStroke !== null) {
    commands.splice(commands.indexOf(currentStroke), 1);
    currentStroke = null;
    redraw();
  }
});

//Button to clear canvas
const clearButton = document.createElement("Button");
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
  commands.length = 0;
  redraw();
});
toolbar.append(clearButton);
