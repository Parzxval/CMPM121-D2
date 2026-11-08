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
const GUIDE_SHAPE: Shape3D = [
  [[1, 0, 0], [0, 0, 0], [0, 1, 0]], //two lines for floor
  [[0, 0, 0], [0, 0, 1]], //wall corner going up in middle
];

const CUBE_SHAPE: Shape3D = [
  [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]], //top face
  [[1, 0, 1], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 1, 1]], //sides and bottom
  [[1, 1, 0], [1, 1, 1]], //front corner edge
];
