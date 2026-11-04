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
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

let isDrawing = false;
let prevX = 0;
let prevY = 0;

canvas.addEventListener("pointerdown", (event) => {
  isDrawing = true;
  canvas.setPointerCapture(event.pointerId);
  prevX = event.offsetX;
  prevY = event.offsetY;
});

canvas.addEventListener("pointermove", (event) => {
  if (isDrawing === false) {
    return;
  }

  //default pen settings for now
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(prevX, prevY);
  ctx.lineTo(event.offsetX, event.offsetY);
  ctx.stroke();

  prevX = event.offsetX;
  prevY = event.offsetY;
});

function endStroke() {
  isDrawing = false;
}

canvas.addEventListener("pointerup", endStroke);
canvas.addEventListener("pointercancel", endStroke);
