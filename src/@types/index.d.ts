declare type TODO = any;

/** @link source: https://stackoverflow.com/a/55032655/19535085 */
declare type Modify<T, R> = Omit<T, keyof R> & R; 
/** @link source: https://stackoverflow.com/a/72075415 */
declare type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** @link source: https://stackoverflow.com/a/75201302 */
declare type Only<T, U> = {
	[P in keyof T]: T[P];
} & {
	[P in keyof U]?: never;
};

/** @link source: https://stackoverflow.com/a/75201302 */
declare type Either<T, U> = Only<T, U> | Only<U, T>
