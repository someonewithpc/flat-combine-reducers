# Flat Combine Reducers

A Redux reducer that merges the provided reducers. A combination of
`combineReducers` from `redux` and `reduceReducers` from `reduce-reducers`.

``` typescript
const reducer = flatCombineReducers(
    aReducer,
    bReducer,
    {
        c: cReducer,
        d: dReducer,
    },
);
```

Will yield a `reducer` which merges the state from `aReducer` and `bReducer`
without nesting, together with the state from `cReducer` under the `c` key, and
`dReducer` under the `d` key.

I.e., the type of `reducer` will be

``` typescript
Reducer<
    StateFromReducer<aReducer> & StateFromReducer<bReducer> & { c: StateFromReducer<cReducer>, d: StateFromReducer<dReducer> },
    Action
>
```

Additionally, a big difference to `reduce-reducers` is that the state for the
reducers isn't required to be the same, but rather the states from all reducers is merged
