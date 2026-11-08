import "./style.css";
import {
  CUBE_SHAPE,
  drawShape,
  GUIDE_SHAPE,
  HALF_CUBE_SHAPE,
  RAMP_SHAPE,
} from "./shapes.ts";

const app = document.querySelector<HTMLElement>("#app")!;

const title = document.createElement("h1");
title.textContent = "3d Sketchbook";

//Wrapp er for canvas and toolbar
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

//functionality for dragging while placing line (straight line tool)
interface DragCmd extends DrawCmd {
  drag(pt: Point): void;
}

class MarkerStroke implements DragCmd {
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
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y);
    }

    ctx.stroke();
    ctx.restore();
  }
}

//straight line tool from point where pressed to point where released
class StraightLine implements DragCmd {
  private start: Point;
  private end: Point;
  private color: string;
  private size: number;

  constructor(start: Point, color: string, size: number) {
    this.start = start;
    this.end = start; //if user doesn't drag, end = start and so only a point is drawn
    this.color = color;
    this.size = size;
  }

  drag(pt: Point): void {
    this.end = pt; //end moves dynamically with drag motion
  }

  display(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.size;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(this.start.x, this.start.y);
    ctx.lineTo(this.end.x, this.end.y);
    ctx.stroke();
    ctx.restore();
  }
}

//drawing helper used by presets and custom images
type StampDraw = (
  ctx: CanvasRenderingContext2D,
  size: number,
  color: string,
) => void;

//drag to move stamp, release to place stamp
class StampMark implements DragCmd {
  private pos: Point;
  private draw: StampDraw;
  private color: string;
  private size: number;

  constructor(pos: Point, draw: StampDraw, color: string, size: number) {
    this.pos = pos;
    this.draw = draw;
    this.color = color;
    this.size = size;
  }

  drag(pt: Point): void {
    this.pos = pt; //stamp follows mouse until release
  }

  display(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y); //move origin to spot where stamp is
    this.draw(ctx, this.size, this.color);
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

//interface to create different tools based on tool data
interface ToolDef {
  label: string; //button label
  kind: "marker" | "line" | "stamp";
  size: number;
  draw?: StampDraw;
}

const tools: ToolDef[] = [
  { label: "Thin", kind: "marker", size: 2 },
  { label: "Thick", kind: "marker", size: 8 },
  { label: "Thin Line", kind: "line", size: 2 },
  { label: "Thick Line", kind: "line", size: 8 },

  //stamps
  {
    label: "Perspective Stamp",
    kind: "stamp",
    size: 80,
    draw: (ctx, size, color) => drawShape(ctx, GUIDE_SHAPE, size, color),
  },
  {
    label: "Cube Stamp",
    kind: "stamp",
    size: 60,
    draw: (ctx, size, color) => drawShape(ctx, CUBE_SHAPE, size, color),
  },
  {
    label: "Ramp Stamp",
    kind: "stamp",
    size: 60,
    draw: (ctx, size, color) => drawShape(ctx, RAMP_SHAPE, size, color),
  },
  {
    label: "Half-Cube Stamp",
    kind: "stamp",
    size: 60,
    draw: (ctx, size, color) => drawShape(ctx, HALF_CUBE_SHAPE, size, color),
  },
];

let currentTool: ToolDef = tools[0];
let currentSize = currentTool.size;
// deno-lint-ignore prefer-const
let currentColor = "#000000";

//creates the corresponding mark for the selected tool
function createStroke(start: Point): DragCmd {
  if (currentTool.kind === "stamp" && currentTool.draw !== undefined) {
    return new StampMark(start, currentTool.draw, currentColor, currentSize);
  }
  if (currentTool.kind === "line") {
    return new StraightLine(start, currentColor, currentSize);
  }
  return new MarkerStroke(start, currentColor, currentSize);
}

let currentStroke: DragCmd | null = null;

canvas.addEventListener("pointerdown", (event) => {
  canvas.setPointerCapture(event.pointerId);
  currentStroke = createStroke({ x: event.offsetX, y: event.offsetY });
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
  if (currentStroke === null) {
    return;
  }
  redoStack.length = 0; //reset branch for a new line drawing
  currentStroke = null;
  updateButtons();
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
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
  commands.length = 0;
  redoStack.length = 0;
  redraw();
  updateButtons();
});
toolbar.append(clearButton);

//store list of undos
const redoStack: DrawCmd[] = [];

function undo() {
  if (commands.length === 0) {
    return;
  }
  const cmd = commands.pop()!;
  redoStack.push(cmd);
  redraw();
  updateButtons();
}

function redo() {
  if (redoStack.length === 0) {
    return;
  }
  const cmd = redoStack.pop()!;
  commands.push(cmd);
  redraw();
  updateButtons();
}

//undo button
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.addEventListener("click", undo);
toolbar.append(undoButton);

//redo button
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.addEventListener("click", redo);
toolbar.append(redoButton);

//disable undo and redo if there is nothing in stack
function updateButtons() {
  undoButton.disabled = commands.length === 0;
  redoButton.disabled = redoStack.length === 0;
}

updateButtons();

const toolButtons: HTMLButtonElement[] = [];

function selectTool(tool: ToolDef) {
  currentTool = tool;
  currentSize = tool.size; //For now, maps to the presets

  for (let i = 0; i < tools.length; i++) {
    toolButtons[i].classList.toggle("selected", tools[i] === tool);
  }
}

function addToolButton(tool: ToolDef) {
  const button = document.createElement("button");
  button.textContent = tool.label;
  button.addEventListener("click", () => selectTool(tool));
  toolbar.append(button);
  toolButtons.push(button);
}

for (let i = 0; i < tools.length; i++) {
  addToolButton(tools[i]);
}

selectTool(tools[0]);
