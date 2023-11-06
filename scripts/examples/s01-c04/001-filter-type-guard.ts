import { from, filter, Observable } from "rxjs"

const string$:Observable<string> = from(["A", "X", "O"]);
const xsAndOs$:Observable<'X'|'O'> = string$.pipe(
  filter((item):item is 'X'|'O' => item === 'X'|| item ==='O')
);
