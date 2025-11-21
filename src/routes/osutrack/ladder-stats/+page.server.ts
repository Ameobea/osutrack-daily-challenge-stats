import { getLadderSimulationConfig } from '../../../api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
  const mode = url.searchParams.get('mode') ?? '0';
  const parsedMode = parseInt(mode, 10);
  if (isNaN(parsedMode) || parsedMode > 3 || parsedMode < 0) {
    throw new Error('invalid mode');
  }
  const simulationConfig = await getLadderSimulationConfig(parsedMode, fetch);
  return { simulationConfig, mode: parsedMode };
};
