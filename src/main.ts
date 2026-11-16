import "./style.css";
import {
  CUBE_SHAPE,
  drawShape,
  GUIDE_SHAPE,
  HALF_CUBE_SHAPE,
  RAMP_SHAPE,
} from "./shapes.ts";

//Drawing functionality
import { render } from "./drawing/canvas.ts";
import { MarkerStroke, StampMark, StraightLine } from "./drawing/strokes.ts";

//Shared Types
import type { DragCmd, Point, StampDraw } from "./drawing/types.ts";

//Drawing History
import {
  addCommand,
  clearHistory,
  commands,
  redo,
  redoStack,
  removeCommand,
  undo,
} from "./history.ts";

const app = document.querySelector<HTMLElement>("#app")!;

const title = document.createElement("h1");
title.textContent = "3D Sketchbook";

//Wrapper for canvas and toolbar
const layout = document.createElement("div");
layout.className = "layout";

const canvas = document.createElement("canvas");
canvas.width = 750;
canvas.height = 750;

let currentColor = "#000000"; //Default color is black

//Color picker for brushes and stamps
const colorInput = document.createElement("input");
colorInput.type = "color";
colorInput.value = currentColor;
document.body.append(colorInput);

colorInput.addEventListener("input", (event: Event) => {
  const target = event.target as HTMLInputElement;
  currentColor = target.value;
});

const toolbar = document.createElement("div");
toolbar.className = "toolbar";

layout.append(canvas, toolbar);
app.append(
  title,
  document.createTextNode("\t Current Color :   "),
  colorInput,
  layout,
);

const ctx = canvas.getContext("2d")!;

function redraw() {
  render(ctx, commands, canvas.width, canvas.height);
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
  addCommand(currentStroke);
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
    removeCommand(currentStroke);
    currentStroke = null;
    redraw();
  }
});

//Button to clear canvas
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
  clearHistory();
  currentStroke = null;
  redraw();
  updateButtons();
});
toolbar.append(clearButton);

//undo button
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.addEventListener("click", () => {
  undo();
  redraw();
  updateButtons();
});
toolbar.append(undoButton);

//redo button
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.addEventListener("click", () => {
  redo();
  redraw();
  updateButtons();
});
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
