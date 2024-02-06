import { NBitNumber } from "./nbit.mjs";

const n = new NBitNumber(4)

n.set(7)

n.set(n.get() >> 1)


console.log(n.get());