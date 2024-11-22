export type TODO = any;
export type Modify<T, R> = Omit<T, keyof R> & R; //* source: https://stackoverflow.com/a/55032655/19535085

export type KeyValuePair<T = string> = {[key: string]: T};