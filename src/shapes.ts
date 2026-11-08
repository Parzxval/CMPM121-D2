//3D shape stamps; floor lines are 30 degrees below horizontal for all
//changing FLOOR_ANGLE will tilt the shape stamps and guide stamp together
//TODO: Add an angle slider for FLOOR_ANGLE
// deno-lint-ignore-file no-unused-vars
const FLOOR_ANGLE = Math.PI / 6;
const COS_A = Math.cos(FLOOR_ANGLE);
const SIN_A = Math.sin(FLOOR_ANGLE);

//List of 3d shapes consisting of 3 lines that make up each shape; each line consists of 3 points (x, y, z)
type Shape3D = number[][][];

//Perspective guide stamp
export const GUIDE_SHAPE: Shape3D = [
  [[1, 0, 0], [0, 0, 0], [0, 1, 0]], //two lines for floor
  [[0, 0, 0], [0, 0, 1]], //wall corner going up in middle
];

//3D cube stamp
export const CUBE_SHAPE: Shape3D = [
  [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]], //top face
  [[1, 0, 1], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 1, 1]], //sides and bottom
  [[1, 1, 0], [1, 1, 1]], //front corner edge
];

//Ramp 3d stamp; half of the cube stamp cut diagonally
export const RAMP_SHAPE: Shape3D = [
  [[0, 0, 1], [0, 1, 1], [1, 1, 0], [1, 0, 0], [0, 0, 1]], //slanted face
  [[0, 1, 1], [0, 1, 0], [1, 1, 0]], //triangle in front
];

//Rectangular prism stamp; half the cube's height
export const HALF_CUBE_SHAPE: Shape3D = [
  [[0, 0, 0.5], [1, 0, 0.5], [1, 1, 0.5], [0, 1, 0.5], [0, 0, 0.5]],
  [[1, 0, 0.5], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 1, 0.5]],
  [[1, 1, 0], [1, 1, 0.5]],
];

//Turns 3d corner into 2d offset on the canvas
function project(corner: number[], size: number): { x: number; y: number } {
  const x = corner[0];
  const y = corner[1];
  const z = corner[2];
  return {
    x: (x - y) * COS_A * size,
    y: ((x + y) * SIN_A - z) * size,
  };
}

//function that draws any preset shape
function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape3D,
  size: number,
  color: string,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  for (let i = 0; i < shape.length; i++) {
    const line = shape[i];
    const first = project(line[0], size);
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);

    for (let a = 1; a < line.length; a++) {
      const pt = project(line[a], size);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
  }
}
