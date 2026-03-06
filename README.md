# Bell Budget - Test Data

Test data for the [bell-budget](https://github.com/) app.

## Contents

- `testdata.json` — Full database export (all tables)
- `import.ts` — Script to import test data into a bell-budget database
- `export.ts` — Script to export current database to `testdata.json`

## Usage

### Import test data

From the bell-budget project root:

```bash
npx tsx path/to/import.ts [path/to/testdata.json]
```

If no path is given, it reads `testdata.json` from the same directory as the script.

### Export current data

From the bell-budget project root:

```bash
npx tsx path/to/export.ts [output-path.json]
```

### Data summary

| Table | Rows |
|-------|------|
| Currency | 2 |
| Account | 3 |
| CategoryGroup | 6 |
| Category | 29 |
| CategoryBudget | 19 |
| CategoryTarget | 19 |
| Rule | 1 |
| Investment | 1 |
| InvestmentValueHistory | 7 |
| Transaction | 2 |
| Subtransaction | 0 |
