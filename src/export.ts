//Exports drawing as a high-res png by replaying commands
import { render } from "./drawing/canvas.ts";
import type { DrawCmd } from "./drawing/types.ts";

export function exportPNG(
  cmds: DrawCmd[],
  width: number,
  height: number,
  scale: number,
) {
  const exportCanvas = document.createElement("canvas");

  exportCanvas.width = width * scale;
  exportCanvas.height = height * scale;

  const exportCtx = exportCanvas.getContext("2d")!;
  exportCtx.scale(scale, scale);
  render(exportCtx, cmds, width, height);
  exportCanvas.toBlob((blob) => {
    if (blob === null) {
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sketch.png";
    link.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}
