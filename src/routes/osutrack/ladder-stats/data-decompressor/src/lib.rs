use pco::standalone::simple_decompress;
use wasm_bindgen::prelude::*;

pub struct DecompressedData {
  pub start_date_epoch: i64,
  pub days_count: u32,
  pub rank_buckets: Vec<u32>,
  pub pp_matrix: Vec<f32>,
  pub decay_matrix: Vec<f32>,
}

#[wasm_bindgen]
pub fn decompress_data(input: &[u8]) -> *mut DecompressedData {
  let mut offset = 0;

  let start_date_epoch = i64::from_le_bytes(input[offset..offset + 8].try_into().unwrap());
  offset += 8;

  let days_count = u32::from_le_bytes(input[offset..offset + 4].try_into().unwrap());
  offset += 4;

  let rank_buckets_size =
    u32::from_le_bytes(input[offset..offset + 4].try_into().unwrap()) as usize;
  offset += 4;
  let rank_buckets_compressed = &input[offset..offset + rank_buckets_size];
  offset += rank_buckets_size;
  let rank_buckets: Vec<u32> = simple_decompress(rank_buckets_compressed).unwrap();

  let pp_matrix_size = u32::from_le_bytes(input[offset..offset + 4].try_into().unwrap()) as usize;
  offset += 4;
  let pp_matrix_compressed = &input[offset..offset + pp_matrix_size];
  offset += pp_matrix_size;
  let truncated_pp_matrix: Vec<u32> = simple_decompress(pp_matrix_compressed).unwrap();
  let pp_matrix: Vec<f32> = truncated_pp_matrix
    .into_iter()
    .map(|val| (val as f32) / 100.)
    .collect();

  let decay_matrix_size =
    u32::from_le_bytes(input[offset..offset + 4].try_into().unwrap()) as usize;
  offset += 4;
  let decay_matrix_compressed = &input[offset..offset + decay_matrix_size];
  // offset += decay_matrix_size;
  let truncated_decay_matrix: Vec<i32> = simple_decompress(decay_matrix_compressed).unwrap();
  let decay_matrix: Vec<f32> = truncated_decay_matrix
    .into_iter()
    .map(|val| (val as f32) / 100.)
    .collect();

  let data = DecompressedData {
    start_date_epoch,
    days_count,
    rank_buckets,
    pp_matrix,
    decay_matrix,
  };

  Box::into_raw(Box::new(data))
}

#[wasm_bindgen]
pub fn get_start_date_epoch(data: *const DecompressedData) -> i64 {
  let data = unsafe { &*data };
  data.start_date_epoch
}

#[wasm_bindgen]
pub fn get_days_count(data: *const DecompressedData) -> u32 {
  let data = unsafe { &*data };
  data.days_count
}

#[wasm_bindgen]
pub fn take_rank_buckets(data: *mut DecompressedData) -> Vec<u32> {
  let data = unsafe { &mut *data };
  std::mem::take(&mut data.rank_buckets)
}

#[wasm_bindgen]
pub fn take_pp_matrix(data: *mut DecompressedData) -> Vec<f32> {
  let data = unsafe { &mut *data };
  std::mem::take(&mut data.pp_matrix)
}

#[wasm_bindgen]
pub fn take_decay_matrix(data: *mut DecompressedData) -> Vec<f32> {
  let data = unsafe { &mut *data };
  std::mem::take(&mut data.decay_matrix)
}

#[wasm_bindgen]
pub fn free_decompressed_data(data: *mut DecompressedData) {
  if data.is_null() {
    return;
  }

  unsafe {
    drop(Box::from_raw(data));
  }
}
