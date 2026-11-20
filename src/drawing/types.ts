//Defines shared interfaces and types use throughout the system.

export interface Point {
  x: number;
  y: number;
}

//an interface will allow for brushstrokes, stamps, and lines to be drawn
export interface DrawCmd {
  display(ctx: CanvasRenderingContext2D): void;
}

//functionality for dragging while placing line (straight line tool)
export interface DragCmd extends DrawCmd {
  drag(pt: Point): void;
}

//drawing helper used by presets and custom images
export type StampDraw = (
  ctx: CanvasRenderingContext2D,
  size: number,
  color: string,
  lineWidth: number,
) => void;
