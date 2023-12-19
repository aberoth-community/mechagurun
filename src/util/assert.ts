/**
 * Assert truthy-ness *(use carefully)*
 * @param expr   Input expression
 * @param msg    Error message
 * @returns      Input
 */
export const assert = <T>(expr: T, msg: string): NonNullable<T> => {
  /* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */
  if (!expr) {
    throw new Error(msg)
  }
  return expr
}

export default assert
