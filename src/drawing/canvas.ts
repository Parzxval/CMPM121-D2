//Handles rendering drawing commands onto the canvas.

import type { DrawCmd } from "./types.ts";

//Recreates all marks so that canvas marks can be later exported
export function render(
  target: CanvasRenderingContext2D,
  commands: DrawCmd[],
  width: number,
  height: number,
) {
  target.fillStyle = "white";
  target.fillRect(0, 0, width, height);

  for (let i = 0; i < commands.length; i++) {
    commands[i].display(target);
  }
}
