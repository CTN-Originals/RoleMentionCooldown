declare type TODO = any;

declare type Modify<T, R> = Omit<T, keyof R> & R; //* source: https://stackoverflow.com/a/55032655/19535085
declare type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>; //* source: https://stackoverflow.com/a/72075415
declare type OptionalFields<T, K extends keyof T> = T & Partial<Pick<T, K>>;

declare type KeyValuePair<T = string> = {[key: string]: T};
