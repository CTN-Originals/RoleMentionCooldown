export type TODO = any

//* source: https://stackoverflow.com/a/55032655/19535085
export type Modify<T, R> = Omit<T, keyof R> & R

//* source: https://stackoverflow.com/a/72075415
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type KeyValuePair<T = string> = { [key: string]: T }
