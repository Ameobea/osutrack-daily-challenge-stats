export interface AnalysisDataset {
  dates: Date[];
  buckets: Uint32Array;
  pp_matrix: Float32Array;
  decay_matrix: Float32Array;
}
