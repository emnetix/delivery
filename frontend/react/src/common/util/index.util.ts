/**a와 b의 내용이 같은지 비교
 * 순서가 달라도 다른 내용으로 인식 -> 자동 정렬(오브젝트 한정)
 *
 * @param a 비교 대상 a
 * @param b 비교 대상 b
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const equals = (a: any, b: any): boolean => {
  if (typeof a !== typeof b) {
    return false;
  } else if (typeof a === 'object' && typeof b === 'object') {
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    else if (Array.isArray(a) && Array.isArray(b)) {
      const cloneA = JSON.stringify(a),
        cloneB = JSON.stringify(b);
      return cloneA === cloneB;
    } else if (a === null || b === null) {
      return a === b;
    } else {
      return !Object.keys(a)
        .reduce((rst, k) => {
          if (!rst.includes(k)) {
            rst.push(k);
          }
          return rst;
        }, Object.keys(b))
        .some(k => !equals(a[k], b[k]));
      // return JSON.stringify(a, Object.keys(a).sort()) === JSON.stringify(b, Object.keys(b).sort());
    }
  } else {
    return typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b) ? true : a === b;
  }
};