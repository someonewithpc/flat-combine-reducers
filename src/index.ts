import { type Action, type Reducer } from 'redux';

export type Identity<T> = T extends object ? {
  [P in keyof T]: Identity<T[P]>
} : T;

type Intersection<T> = Identity<T extends [infer TH, ...infer TT]
  ? TH & Intersection<TT>
  : {}>;

type ReducerOrReducerMap = Reducer<any, Action, any> | Record<string, Reducer<any, Action, any>>;

function isReducerMap(r: ReducerOrReducerMap): r is Record<string, Reducer<any, Action, any>> {
  return typeof r !== 'function';
}
function isReducer<State, PreloadState>(r: ReducerOrReducerMap): r is Reducer<State, Action, PreloadState> {
  return typeof r === 'function';
}

type StateFromReducers<Reducers extends ReducerOrReducerMap[]> = Intersection<
  {
    [Key in keyof Reducers]: Reducers[Key] extends Reducer<infer State, Action, any> | undefined
      ? State
      : (Reducers[Key] extends Record<string, Reducer<any, Action, any>>
        ? {
          [InnerKey in keyof Reducers[Key]]: Reducers[Key][InnerKey] extends Reducer<infer State, Action, any> | undefined
            ? State
            : never
        }
        : never)
  }
>;

export function flatCombineReducers<R extends ReducerOrReducerMap[]>(
  ...reducers: R
): Reducer<StateFromReducers<R>, Action, undefined> {
  return (prevState: StateFromReducers<R> | undefined, action: Action) => Object.assign(
    {},
    ...reducers.map((r) => {
      if (isReducerMap(r)) {
        return Object.fromEntries(
          Object.entries(r)
            .map(
              ([key, ir]: [
                keyof StateFromReducers<R>,
                Reducer<
                  StateFromReducers<R>[keyof StateFromReducers<R>],
                  Action
                >,
              ]) => [
                key,
                ir(prevState !== undefined ? prevState[key] : undefined, action),
              ],
            ),
        );
      }
      if (isReducer(r)) return r(prevState, action);
      return {}
    }),
  );
}
