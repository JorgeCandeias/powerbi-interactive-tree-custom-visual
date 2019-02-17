# Power BI Interactive Tree Custom Visual

This is a custom visual for Power BI featuring an interactive tree.

## How to use it

1. Model your input data so it looks like a recursive hierarchy when aggregated. Only one root element is allowed. See the [Sample Dataset](dataset.pbix) for an example.

    | Parent | Child | Measure |
    |--------|-------|---------|
    |        | X     | 0       |
    | X      | A     | 1       |
    | X      | B     | 2       |
    | A      | AA    | 3       |
    | A      | AB    | 4       |
    | AA     | AAA   | 5       |
    | AA     | AAB   | 6       |
    | AB     | ABA   | 7       |
    | AB     | ABB   | 8       |
    | B      | BA    | 9       |
    | B      | BB    | 10      |
    | BA     | BAA   | 11      |
    | BA     | BAB   | 12      |
    | BB     | BBA   | 13      |
    | BB     | BBB   | 14      |

2. Add your respective `Parent` and `Child` columns to the `Hierarchy` field group in Power BI.
3. Map some measure field to the `Measure` field group. Measures are ignored for now but Power BI requires at least one measure to execute a data query.

## Credits

* [d3noob](https://github.com/d3noob) for creating the vanilla [d3 visualization](http://bl.ocks.org/d3noob/8375092).