//Definition for clear command that can be undone with undo button
import type { DrawCmd } from "./drawing/types.ts";

export class ClearCmd implements DrawCmd {
  display(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }
}
