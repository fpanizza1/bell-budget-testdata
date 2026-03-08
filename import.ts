import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

interface TestData {
  Currency: Array<{ code: string; symbol: string; order: number }>
  Account: Array<{ id: string; name: string; type: string; currencyCode: string; color: string | null }>
  CategoryGroup: Array<{ id: string; name: string; order: number; [key: string]: unknown }>
  Category: Array<{ id: string; groupId: string; name: string; order: number }>
  CategoryBudget: Array<{ id: string; categoryId: string; currencyCode: string; month: string; amount: number }>
  CategoryTarget: Array<{ id: string; categoryId: string; currencyCode: string; type: string; amount: number; targetDate: string | null; cadence: string | null; cadenceInterval: number | null; snoozedUntil: string | null }>
  Rule: Array<{ id: string; payeeContains: string; categoryId: string | null; memo: string | null; order: number }>
  Investment: Array<{ id: string; name: string; currencyCode: string; color: string | null; currentValue: number; totalDeposited: number; totalWithdrawn: number }>
  InvestmentValueHistory: Array<{ id: string; investmentId: string; date: string; currentValue: number; source: string; transferAmount: number | null; transactionId: string | null }>
  Transaction: Array<{ id: string; accountId: string; date: string; amount: number; payee: string | null; categoryId: string | null; memo: string | null; cleared: number; transferAccountId: string | null; exchangeRate: number | null; transferInvestmentId: string | null }>
  Subtransaction: Array<{ id: string; transactionId: string; amount: number; categoryId: string | null; memo: string | null }>
}

async function main() {
  const projectRoot = path.resolve(__dirname, '..')
  const dbPath = path.resolve(projectRoot, 'dev.db')

  // Ensure schema is up to date (creates DB if missing)
  console.log('Syncing database schema...')
  execSync('npx prisma db push --accept-data-loss', {
    cwd: projectRoot,
    stdio: 'inherit',
  })

  const dbUrl = process.env.DATABASE_URL || `file:${dbPath}`
  const adapter = new PrismaLibSql({ url: dbUrl })
  const prisma = new PrismaClient({ adapter })

  const dataPath = process.argv[2] || path.join(__dirname, 'testdata.json')
  const data: TestData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  console.log('Clearing existing data...')
  await prisma.investmentValueHistory.deleteMany()
  await prisma.subtransaction.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.categoryBudget.deleteMany()
  await prisma.categoryTarget.deleteMany()
  await prisma.category.deleteMany()
  await prisma.categoryGroup.deleteMany()
  await prisma.rule.deleteMany()
  await prisma.investment.deleteMany()
  await prisma.account.deleteMany()
  await prisma.currency.deleteMany()

  console.log('Importing currencies...')
  for (const c of data.Currency) {
    await prisma.currency.create({ data: c })
  }

  console.log('Importing accounts...')
  for (const a of data.Account) {
    await prisma.account.create({ data: a })
  }

  console.log('Importing category groups...')
  for (const { is_hidden, ...g } of data.CategoryGroup) {
    await prisma.categoryGroup.create({ data: g })
  }

  console.log('Importing categories...')
  for (const c of data.Category) {
    await prisma.category.create({ data: c })
  }

  console.log('Importing category budgets...')
  for (const b of data.CategoryBudget) {
    await prisma.categoryBudget.create({ data: b })
  }

  console.log('Importing category targets...')
  for (const t of data.CategoryTarget) {
    await prisma.categoryTarget.create({ data: t })
  }

  console.log('Importing rules...')
  for (const r of data.Rule) {
    await prisma.rule.create({ data: r })
  }

  console.log('Importing investments...')
  for (const i of data.Investment) {
    await prisma.investment.create({ data: i })
  }

  console.log('Importing transactions...')
  for (const t of data.Transaction) {
    await prisma.transaction.create({ data: { ...t, cleared: Boolean(t.cleared) } })
  }

  console.log('Importing subtransactions...')
  for (const s of data.Subtransaction) {
    await prisma.subtransaction.create({ data: s })
  }

  console.log('Importing investment value history...')
  for (const h of data.InvestmentValueHistory) {
    await prisma.investmentValueHistory.create({ data: h })
  }

  console.log('Done! Imported:')
  console.log(`  ${data.Currency.length} currencies`)
  console.log(`  ${data.Account.length} accounts`)
  console.log(`  ${data.CategoryGroup.length} category groups`)
  console.log(`  ${data.Category.length} categories`)
  console.log(`  ${data.CategoryBudget.length} category budgets`)
  console.log(`  ${data.CategoryTarget.length} category targets`)
  console.log(`  ${data.Rule.length} rules`)
  console.log(`  ${data.Investment.length} investments`)
  console.log(`  ${data.InvestmentValueHistory.length} investment value history entries`)
  console.log(`  ${data.Transaction.length} transactions`)
  console.log(`  ${data.Subtransaction.length} subtransactions`)

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  process.exit(1)
})
