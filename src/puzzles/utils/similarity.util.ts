import { MatchstickDto } from '../dto/create-puzzle.dto';
import { normalizeAngle } from './angle.util';
import { toRelativeCoordinates } from './coordinate.util';

export function checkMoveSimilarity(currentState: MatchstickDto[], solution: MatchstickDto[], threshold = 30): boolean {    
  const relativeCurrent = toRelativeCoordinates(currentState);
  const relativeSolution = toRelativeCoordinates(solution);
  console.log('relativeCurrent',relativeCurrent)
  console.log('relativeSolution',relativeSolution)

  if (relativeCurrent.length !== relativeSolution.length) return false;

  return relativeCurrent.every((currentStick) => {
    return relativeSolution.some((solutionStick) => {
      const positionMatch =
        Math.abs(currentStick.relativeX - solutionStick.relativeX) <= threshold &&
        Math.abs(currentStick.relativeY - solutionStick.relativeY) <= threshold;
      
      const angle1 = normalizeAngle(currentStick.angle);
      const angle2 = normalizeAngle(solutionStick.angle);
      const angleMatch = Math.abs(angle1 - angle2) <= threshold;
      
      return positionMatch && angleMatch;
    });
  });
}

export function checkRemoveSimilarity(currentState: MatchstickDto[], solution: MatchstickDto[], limit: number): boolean {
  const removedSticks = currentState.filter(stick => stick.isDeleted);

  if (removedSticks.length !== limit) return false;

  const removeIds = removedSticks.map(stick => stick.id);

  return !solution.some((solutionStick: MatchstickDto) => 
    removeIds.includes(solutionStick.id)
  );
} 