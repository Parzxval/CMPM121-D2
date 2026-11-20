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

//Clear functionality
import { ClearCmd } from "./clear.ts";

//Shared Types
import type { DragCmd, Point, StampDraw } from "./drawing/types.ts";

//Drawing History
import { addCommand, commands, redo, redoStack, undo } from "./history.ts";

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

const actionToolbar = document.createElement("div");
actionToolbar.className = "action-toolbar";

const canvasContainer = document.createElement("div");
canvasContainer.className = "canvas-container";

const brushTab = document.createElement("button");
brushTab.textContent = "Brush";

const lineTab = document.createElement("button");
lineTab.textContent = "Line";

const stampTab = document.createElement("button");
stampTab.textContent = "Stamp";

const settingsTab = document.createElement("button");
settingsTab.textContent = "Settings";

const optionsPanel = document.createElement("div");
optionsPanel.className = "options-panel";

const brushOptions = document.createElement("div");
brushOptions.className = "option-group";

const lineOptions = document.createElement("div");
lineOptions.className = "option-group";

const stampOptions = document.createElement("div");
stampOptions.className = "option-group";

const settingsOptions = document.createElement("div");
settingsOptions.className = "option-group";

toolbar.append(brushTab, lineTab, stampTab, settingsTab);
brushTab.classList.add("selected"); //default selected tab

optionsPanel.append(
  brushOptions,
  lineOptions,
  stampOptions,
  settingsOptions,
);

canvasContainer.append(actionToolbar, canvas);
layout.append(toolbar, optionsPanel, canvasContainer);
app.append(
  title,
  document.createTextNode("\t Current Color :   "),
  colorInput,
  layout,
);

const ctx = canvas.getContext("2d")!;

let currentStroke: DragCmd | null = null;

function redraw() {
  render(ctx, commands, canvas.width, canvas.height);
  if (currentStroke !== null) {
    currentStroke.display(ctx);
  }
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
  { label: "Brush", kind: "marker", size: 2 },
  { label: "Line", kind: "line", size: 2 },

  //stamps
  {
    label: "Perspective Stamp",
    kind: "stamp",
    size: 80,
    draw: (ctx, size, color, lineWidth) =>
      drawShape(ctx, GUIDE_SHAPE, size, color, lineWidth),
  },
  {
    label: "Cube Stamp",
    kind: "stamp",
    size: 60,
    draw: (ctx, size, color, lineWidth) =>
      drawShape(ctx, CUBE_SHAPE, size, color, lineWidth),
  },
  {
    label: "Ramp Stamp",
    kind: "stamp",
    size: 60,
    draw: (ctx, size, color, lineWidth) =>
      drawShape(ctx, RAMP_SHAPE, size, color, lineWidth),
  },
  {
    label: "Half-Cube Stamp",
    kind: "stamp",
    size: 60,
    draw: (ctx, size, color, lineWidth) =>
      drawShape(ctx, HALF_CUBE_SHAPE, size, color, lineWidth),
  },
];

let brushSize = 2; //default brush size
let lineSize = 2; //default line size
let stampSize = 60; //default stamp size
let stampLineWidth = 2; //default stamp line width

let currentTool: ToolDef = tools[0];

//creates the corresponding mark for the selected tool
function createStroke(start: Point): DragCmd {
  if (currentTool.kind === "stamp" && currentTool.draw !== undefined) {
    return new StampMark(
      start,
      currentTool.draw,
      currentColor,
      stampSize,
      stampLineWidth,
    );
  }
  if (currentTool.kind === "line") {
    return new StraightLine(start, currentColor, lineSize);
  }
  return new MarkerStroke(start, currentColor, brushSize);
}

canvas.addEventListener("pointerdown", (event) => {
  canvas.setPointerCapture(event.pointerId);
  currentStroke = createStroke({ x: event.offsetX, y: event.offsetY });
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
  addCommand(currentStroke);
  currentStroke = null;
  updateButtons();
});

//throw away stroke on browser interrupt
canvas.addEventListener("pointercancel", () => {
  if (currentStroke !== null) {
    currentStroke = null;
    redraw();
  }
});

//Button to clear canvas
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
  //double-clear guard
  if (
    commands.length !== 0 &&
    !(commands[commands.length - 1] instanceof ClearCmd)
  ) {
    addCommand(new ClearCmd());
    currentStroke = null;
    redraw();
    updateButtons();
  }
});
actionToolbar.append(clearButton);

//undo button
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.addEventListener("click", () => {
  undo();
  redraw();
  updateButtons();
});
actionToolbar.append(undoButton);

//redo button
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.addEventListener("click", () => {
  redo();
  redraw();
  updateButtons();
});
actionToolbar.append(redoButton);

//disable undo and redo if there is nothing in stack
function updateButtons() {
  undoButton.disabled = commands.length === 0;
  redoButton.disabled = redoStack.length === 0;
}

updateButtons();

const toolButtons: HTMLButtonElement[] = [];

function selectTool(tool: ToolDef) {
  currentTool = tool;

  for (let i = 0; i < tools.length; i++) {
    toolButtons[i].classList.toggle("selected", tools[i] === tool);
  }
}

function addToolButton(tool: ToolDef, container: HTMLElement) {
  const button = document.createElement("button");
  button.textContent = tool.label;
  button.addEventListener("click", () => selectTool(tool));
  container.append(button);
  toolButtons.push(button);
}

function createSizeSlider(
  labelText: string,
  min: number,
  max: number,
  initialValue: number,
  onChange: (value: number) => void,
  container: HTMLElement,
) {
  const label = document.createElement("label");
  label.textContent = `${labelText}: `;

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = min.toString();
  slider.max = max.toString();
  slider.value = String(initialValue);

  const valueDisplay = document.createElement("span");
  valueDisplay.textContent = String(initialValue);

  slider.addEventListener("input", () => {
    const value = Number(slider.value);
    onChange(value);
    valueDisplay.textContent = String(value);
  });

  container.append(label, slider, valueDisplay);
}

function showOptions(group: HTMLElement, tab: HTMLButtonElement) {
  // Hide every options group
  brushOptions.style.display = "none";
  lineOptions.style.display = "none";
  stampOptions.style.display = "none";
  settingsOptions.style.display = "none";

  // Remove selected appearance from all tabs
  brushTab.classList.remove("selected");
  lineTab.classList.remove("selected");
  stampTab.classList.remove("selected");
  settingsTab.classList.remove("selected");

  // Show the selected group
  group.style.display = "flex";
  tab.classList.add("selected");
}

for (let i = 0; i < tools.length; i++) {
  const tool = tools[i];

  if (tool.kind === "marker") {
    addToolButton(tool, brushOptions);
  } else if (tool.kind === "line") {
    addToolButton(tool, lineOptions);
  } else if (tool.kind === "stamp") {
    addToolButton(tool, stampOptions);
  }
}

selectTool(tools[0]);

createSizeSlider("Brush Size", 1, 20, brushSize, (value) => {
  brushSize = value;
}, brushOptions);

createSizeSlider("Line Size", 1, 20, lineSize, (value) => {
  lineSize = value;
}, lineOptions);

createSizeSlider("Stamp Size", 10, 200, stampSize, (value) => {
  stampSize = value;
}, stampOptions);

createSizeSlider("Stamp Line Size", 1, 20, stampLineWidth, (value) => {
  stampLineWidth = value;
}, stampOptions);

brushTab.addEventListener("click", () => {
  selectTool(tools[0]);
  showOptions(brushOptions, brushTab);
});

lineTab.addEventListener("click", () => {
  selectTool(tools[1]);
  showOptions(lineOptions, lineTab);
});

stampTab.addEventListener("click", () => {
  selectTool(tools[2]);
  showOptions(stampOptions, stampTab);
});

settingsTab.addEventListener("click", () => {
  showOptions(settingsOptions, settingsTab);
});

showOptions(brushOptions, brushTab);
