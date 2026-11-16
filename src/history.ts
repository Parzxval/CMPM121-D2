/* 
  Manages drawing history, including undo and redo functionality,
  as well as adding and removing drawing commands.
*/

import type { DrawCmd } from "./drawing/types.ts";

//create an array to store each drawing mark
export const commands: DrawCmd[] = [];

//store list of undos
export const redoStack: DrawCmd[] = [];

export function addCommand(command: DrawCmd) {
  commands.push(command);
}

export function undo() {
  if (commands.length === 0) {
    return;
  }
  const cmd = commands.pop()!;
  redoStack.push(cmd);
}

export function redo() {
  if (redoStack.length === 0) {
    return;
  }
  const cmd = redoStack.pop()!;
  commands.push(cmd);
}

export function clearHistory() {
  commands.length = 0;
  redoStack.length = 0;
}

export function removeCommand(command: DrawCmd) {
  const index = commands.indexOf(command);
  if (index !== -1) {
    commands.splice(index, 1);
  }
}

///////////////////////
