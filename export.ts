import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import * as fs from 'fs'
import * as path from 'path'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const data = {
    Currency: await prisma.currency.findMany({ orderBy: { order: 'asc' } }),
    Account: await prisma.account.findMany(),
    CategoryGroup: await prisma.categoryGroup.findMany({ orderBy: { order: 'asc' } }),
    Category: await prisma.category.findMany({ orderBy: { order: 'asc' } }),
    CategoryBudget: await prisma.categoryBudget.findMany(),
    CategoryTarget: await prisma.categoryTarget.findMany(),
    Rule: await prisma.rule.findMany(),
    Investment: await prisma.investment.findMany(),
    InvestmentValueHistory: await prisma.investmentValueHistory.findMany({ orderBy: { date: 'asc' } }),
    Transaction: await prisma.transaction.findMany({ orderBy: { date: 'asc' } }),
    Subtransaction: await prisma.subtransaction.findMany(),
  }

  const outPath = process.argv[2] || path.join(__dirname, 'testdata.json')
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2))

  console.log(`Exported to ${outPath}:`)
  for (const [table, rows] of Object.entries(data)) {
    console.log(`  ${table}: ${(rows as unknown[]).length} rows`)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
