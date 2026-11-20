//Contains drawing classes for strokes, lines, and stamps.

import type { DragCmd, Point, StampDraw } from "./types.ts";

export class MarkerStroke implements DragCmd {
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
export class StraightLine implements DragCmd {
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

//drag to move stamp, release to place stamp
export class StampMark implements DragCmd {
  private pos: Point;
  private draw: StampDraw;
  private color: string;
  private size: number;
  private lineWidth: number;

  constructor(
    pos: Point,
    draw: StampDraw,
    color: string,
    size: number,
    lineWidth: number,
  ) {
    this.pos = pos;
    this.draw = draw;
    this.color = color;
    this.size = size;
    this.lineWidth = lineWidth;
  }

  drag(pt: Point): void {
    this.pos = pt; //stamp follows mouse until release
  }

  display(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y); //move origin to spot where stamp is
    this.draw(ctx, this.size, this.color, this.lineWidth);
    ctx.restore();
  }
}
