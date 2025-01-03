import { MatchstickDto } from '../dto/create-puzzle.dto';

export function toRelativeCoordinates(sticks: MatchstickDto[]) {
  if (typeof sticks === 'string') {
    sticks = JSON.parse(sticks);
  }
  
  const centerX = sticks.reduce((sum, stick) => sum + stick.x, 0) / sticks.length;
  const centerY = sticks.reduce((sum, stick) => sum + stick.y, 0) / sticks.length;

  return sticks.map((stick) => ({
    id: stick.id,
    relativeX: Math.round(stick.x - centerX),
    relativeY: Math.round(stick.y - centerY),
    angle: Math.abs(stick.angle)
  }));
} 