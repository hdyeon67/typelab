// 시드 해시 + 시드 기반 결정적 유틸 (munhae/shinjo hash.ts 를 그대로 재사용)
//
// 입력 문자열을 FNV-1a 32bit 해시로 시드화하고, mulberry32 로 결정적 난수를 뽑는다.
// 같은 입력이면 항상 같은 시드/난수가 나오므로 재계산해도 결과가 동일하다.
// typelab 은 자체 도메인이라 saju-core 에 의존하지 않고 원시함수를 여기에 직접 둔다.

/** FNV-1a 32bit 해시 (부호 없는 정수 반환) */
export function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    // hash *= 16777619 (32bit)
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32 결정적 PRNG. [0,1) 실수 하나 반환 */
export function mulberry32(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * 시드로부터 [-range, +range] 정수 미세 난수.
 * range=2 이면 -2 ~ +2 (정수).
 */
export function seededJitter(seed: number, range: number): number {
  const r = mulberry32(seed); // 0 ~ 1
  return Math.round((r * 2 - 1) * range);
}

/**
 * 시드 + 태그로부터 0..n-1 결정적 인덱스.
 * 태그가 시드를 네임스페이스화하므로 서로 다른 선택이 상관되지 않는다.
 */
export function deriveIndex(seed: number, tag: string, n: number): number {
  if (n <= 0) return 0;
  return fnv1a(`${tag}#${seed}`) % n;
}

/**
 * 시드 기반 결정적 셔플 (Fisher-Yates). 원본 배열은 변형하지 않고 새 배열을 반환.
 *
 * 각 단계의 교환 인덱스 j 를 스트림 상태 대신 per-step 해시
 * `fnv1a(`${seed}#${i}`) % (i+1)` 로 뽑는다 → 완전 결정적이며 같은 시드면 항상 동일한 순열.
 */
export function seededShuffle<T>(arr: readonly T[], seed: number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = fnv1a(`${seed}#${i}`) % (i + 1);
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/**
 * 시드 기반 결정적 비복원 추출: 셔플 후 앞 k개.
 * k 가 배열 길이보다 크면 전체(셔플된)를 반환.
 */
export function seededSample<T>(arr: readonly T[], k: number, seed: number): T[] {
  return seededShuffle(arr, seed).slice(0, Math.max(0, k));
}
