import { MatchstickDto } from '../dto/create-puzzle.dto';
import { normalizeAngle } from './angle.util';
import { toRelativeCoordinates } from './coordinate.util';

export function checkMoveSimilarity(currentState: MatchstickDto[], solution: MatchstickDto[], threshold = 30): boolean {    
  const relativeCurrent = toRelativeCoordinates(currentState);
  const relativeSolution = toRelativeCoordinates(solution);

  if (relativeCurrent.length !== relativeSolution.length) return false;

  return relativeCurrent.every((currentStick) => {
    return relativeSolution.some((solutionStick) => {
      const positionMatch =
        Math.abs(currentStick.relativeX - solutionStick.relativeX) <= threshold &&
        Math.abs(currentStick.relativeY - solutionStick.relativeY) <= threshold;
      
      const angleMatch =
        Math.abs(normalizeAngle(currentStick.angle) - normalizeAngle(solutionStick.angle)) <= threshold;
      
      return positionMatch && angleMatch;
    });
  });
}

export function checkRemoveSimilarity(currentState: MatchstickDto[], solution: MatchstickDto[], limit: number): boolean {
  const removedSticks = currentState.filter(stick => stick.isDeleted);
  
  if (removedSticks.length !== limit) return false;

  const removeIds = removedSticks.map(stick => stick.id);
  
  return solution.every((solutionStick: MatchstickDto) => 
    removeIds.includes(solutionStick.id)
  );
} 