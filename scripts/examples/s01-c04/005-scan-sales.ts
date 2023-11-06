import { from, scan } from "rxjs";

type SalesRecord = {name: string, amount: number};
type Scoreboard = Record<string, {total:number, max:number}>

const sale$ = from([
  {name: 'Jeff', amount: 100},
  {name: 'Janet', amount: 200},
  {name: 'Jeff', amount: 100},
  {name: 'Mike', amount: 300}
])

sale$.pipe(
  scan<SalesRecord, Scoreboard>((agg, {name, amount}) => {
    const lastRecordForName = agg[name];
    const nextRecordForName = 
      lastRecordForName === undefined
        ? { total: amount, max: amount }
        : { 
          total: lastRecordForName.total + amount, 
          max: Math.max(lastRecordForName.max, amount) 
        };
    return {
      ...agg,
      [name]: nextRecordForName
    }
  }, {})
).subscribe(console.log);

// CONSOLE:
// { Jeff: { total: 100, max: 100 } }
// { Jeff: { total: 100, max: 100 }, Janet: { total: 200, max: 200 } }
// { Jeff: { total: 200, max: 100 }, Janet: { total: 200, max: 200 } }
// {
//   Jeff: { total: 200, max: 100 },
//   Janet: { total: 200, max: 200 },
//   Mike: { total: 300, max: 300 }
// }