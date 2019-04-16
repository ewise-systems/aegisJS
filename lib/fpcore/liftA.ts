import { curry } from "ramda";

// liftA3 :: (b -> c -> d -> e) -> (a -> b) -> (a -> c) -> (a -> d) -> F a -> F e
const liftA3 = curry((f, a, b, c, x) => x.map(a).map(f).ap(x.map(b)).ap(x.map(c)));

export {
    liftA3
}