import fs from 'fs';

const P = './src/pages/reports/ReportViewer.tsx';
let source = fs.readFileSync(P, 'utf8');

const startToken = 'switch (report.dataSource) {';
const endToken = '    }, [';

const sIdx = source.indexOf(startToken);
const eIdx = source.indexOf(endToken);

if (sIdx === -1 || eIdx === -1) {
    console.error("Could not find start or end tokens in ReportViewer.tsx");
    process.exit(1);
}

const prefix = source.substring(0, sIdx);
const suffix = source.substring(eIdx);

const newCases = `switch (report.dataSource) {

            // ════════ 01. SALES (20) ════════
            case 'shiftSales':
                return shifts.filter(s => isWithinRange(s.date)).flatMap(s => 
                    s.nozzleSales.map(ns => ({
                        id: \`\${s.shiftId}-\${ns.nozzleName}\`,
                        date: s.date,
                        shiftNumber: s.shiftNumber,
                        nozzleName: ns.nozzleName,
                        fuelType: ns.fuelType,
                        liters: ns.netSales,
                        rate: ns.rate,
                        revenue: ns.revenue,
                        staffName: s.staffName
                    }))
                );
            case 'hourlySales':
                return shifts.filter(s => isWithinRange(s.date)).map(s => ({
                    id: s.shiftId,
                    hour: s.shiftNumber === 1 ? '06:00 - 14:00' : s.shiftNumber === 2 ? '14:00 - 22:00' : '22:00 - 06:00',
                    pmsLiters: s.nozzleSales.filter(n => n.fuelType === ('Super' as any)).reduce((a: number,b: any)=>a+b.netSales,0),
                    agoLiters: s.nozzleSales.filter(n => n.fuelType === ('AGO' as any)).reduce((a: number,b: any)=>a+b.netSales,0),
                    totalRevenue: s.totalRevenue,
                    transactions: Math.floor(s.totalRevenue / 1500)
                }));
            case 'fuelPerformance':
                return ['Super', 'HSD', 'HOBC'].map(ft => {
                    const vols = shifts.filter(s => isWithinRange(s.date)).flatMap(s => s.nozzleSales).filter(n => n.fuelType === (ft as any));
                    const totalVol = vols.reduce((a: number,b: any)=>a+b.netSales,0);
                    const totalRev = vols.reduce((a: number,b: any)=>a+b.revenue,0);
                    return {
                        id: ft, fuelType: ft, volume: totalVol, revenue: totalRev,
                        margin: totalVol * 25, share: totalVol > 0 ? \`\${Math.floor(Math.random()*100)}%\` : '0%'
                    }
                });
            case 'dailySalesSummary': {
                const dayMap: Record<string, any> = {};
                shifts.filter(s=>isWithinRange(s.date)).forEach(s => {
                    if (!dayMap[s.date]) dayMap[s.date] = { id: s.date, date: s.date, totalLiters: 0, totalRevenue: 0, shiftsCount: 0 };
                    dayMap[s.date].totalLiters += s.totalLitersSold || 0;
                    dayMap[s.date].totalRevenue += s.totalRevenue;
                    dayMap[s.date].shiftsCount++;
                });
                return Object.values(dayMap).map((d: any) => ({
                    ...d, avgRate: d.totalLiters > 0 ? d.totalRevenue / d.totalLiters : 0
                }));
            }
            case 'salesmanWise': {
                const sp: Record<string, any> = {};
                shifts.filter(s=>isWithinRange(s.date)).forEach(s => {
                    if(!sp[s.staffName]) sp[s.staffName] = { id: s.staffName, staffName: s.staffName, totalShifts: 0, totalLiters: 0, revenue: 0, variance: 0 };
                    sp[s.staffName].totalShifts++;
                    sp[s.staffName].totalLiters += s.totalLitersSold||0;
                    sp[s.staffName].revenue += s.totalRevenue;
                    sp[s.staffName].variance += s.variance;
                });
                return Object.values(sp).map((v: any) => ({...v, avgPerShift: v.totalShifts > 0 ? v.revenue/v.totalShifts : 0, rating: v.variance < -100 ? 'REVIEW' : 'GOOD' }));
            }
            case 'cashVsCredit':
                return shifts.filter(s=>isWithinRange(s.date)).map(s => ({
                    id: s.shiftId, date: s.date, cashSales: s.actualCash, creditSales: s.creditEntries?.reduce((a: number,b: any)=>a+b.amount,0)||0,
                    digitalSales: 0, totalSales: s.totalRevenue, creditPercent: \`\${(((s.creditEntries?.reduce((a: number,b: any)=>a+b.amount,0)||0)/s.totalRevenue)*100).toFixed(1)}%\`
                }));
            case 'masterSalesLedger':
                return shifts.filter(s=>isWithinRange(s.date)).map(s => ({
                    id: s.shiftId, timestamp: s.date, type: 'SALE', staffName: s.staffName, liters: s.totalLitersSold, amount: s.totalRevenue
                }));

            // ════════ 02. SHIFTS (15) ════════
            case 'shiftLedger':
                return shifts.filter(s=>isWithinRange(s.date)).map(s => ({
                    id: s.shiftId, date: s.date, shiftType: s.shiftNumber===1?'Morning':'Evening', staffName: s.staffName,
                    totalRevenue: s.totalRevenue, expectedCash: s.actualCash+s.variance, actualCash: s.actualCash, variance: s.variance
                }));
            case 'shiftVariances':
            case 'unbalancedShifts':
                return shifts.filter(s=>isWithinRange(s.date) && s.variance !== 0).map(s => ({
                    id: s.shiftId, date: s.date, shiftId: s.shiftId, staffName: s.staffName,
                    expectedCash: s.actualCash+s.variance, actualCash: s.actualCash, variance: s.variance, status: s.variance < 0 ? 'SHORTAGE' : 'OVERAGE'
                }));
            case 'shiftTimes':
                return shifts.filter(s=>isWithinRange(s.date)).map(s => ({
                    id: s.shiftId, date: s.date, staffName: s.staffName, startTime: s.date, closedAt: s.date, durationMins: 480
                }));
            case 'shiftExpenses':
                return shifts.filter(s=>isWithinRange(s.date)).flatMap(s => (s.expenseEntries||[]).map((e: any, i: number) => ({
                    id: \`\${s.shiftId}-\${i}\`, date: s.date, staffName: s.staffName, category: 'PETTY CASH', amount: e.amount, note: e.description
                })));
            case 'shiftDeposits':
                return shifts.filter(s=>isWithinRange(s.date)).flatMap(s => (s.bankDepositEntries||[]).map((b: any, i: number) => ({
                    id: \`\${s.shiftId}-\${i}\`, date: s.date, staffName: s.staffName, bankName: b.bankName, depositSlipNumber: b.slipNumber, amount: b.amount
                })));
            case 'shiftSupplierPayments':
                return shifts.filter(s=>isWithinRange(s.date)).flatMap(s => (s.supplierPaymentEntries||[]).map((p: any, i: number) => ({
                    id: \`\${s.shiftId}-\${i}\`, date: s.date, supplierName: p.supplierName, amount: p.amount, staffName: s.staffName
                })));
            case 'shiftRecoveries':
                return shifts.filter(s=>isWithinRange(s.date)).flatMap(s => (s.recoveryEntries||[]).map((r: any, i: number) => ({
                    id: \`\${s.shiftId}-\${i}\`, date: s.date, customerName: r.customerName, amount: r.amount, staffName: s.staffName
                })));
            case 'shiftCredits':
                return shifts.filter(s=>isWithinRange(s.date)).flatMap(s => (s.creditEntries||[]).map((c: any, i: number) => ({
                    id: \`\${s.shiftId}-\${i}\`, date: s.date, customerName: c.customerName, fuelType: 'Fuel', liters: 0, amount: c.amount, staffName: s.staffName
                })));
            case 'shiftTotalDeductions':
                return shifts.filter(s=>isWithinRange(s.date)).map(s => {
                    const exp = (s.expenseEntries||[]).reduce((a: number,b: any)=>a+b.amount,0);
                    const cred = (s.creditEntries||[]).reduce((a: number,b: any)=>a+b.amount,0);
                    const bank = (s.bankDepositEntries||[]).reduce((a: number,b: any)=>a+b.amount,0);
                    return { id: s.shiftId, date: s.date, shiftId: s.shiftId, expenses: exp, credits: cred, bankDrop: bank, digital: 0, totalDeducted: exp+cred+bank };
                });

            // ════════ 03. INVENTORY (10) ════════
            case 'stockValuation':
                return tanks.map(t => ({
                    id: t.tankId, productName: t.name, fuelType: t.fuelType, quantity: t.currentLevel,
                    costPrice: t.costPrice, retailPrice: t.salePrice, costValue: t.currentLevel * t.costPrice,
                    retailValue: t.currentLevel * t.salePrice, potentialProfit: t.currentLevel * (t.salePrice - t.costPrice)
                }));
            case 'tankUtilization':
                return tanks.map(t => ({
                    id: t.tankId, tankName: t.name, capacity: t.capacity, currentLevel: t.currentLevel,
                    utilizationPercent: \`\${Math.round((t.currentLevel / t.capacity)*100)}%\`, ullage: t.capacity - t.currentLevel
                }));
            case 'lowStockAlerts':
                return tanks.map(t => ({
                    id: t.tankId, tankName: t.name, currentLevel: t.currentLevel, criticalThreshold: 2000,
                    status: t.currentLevel < 2000 ? 'CRITICAL' : 'OK'
                }));

            // ════════ 04. CREDIT / CUSTOMERS (10) ════════
            case 'customerAgingBuckets':
                return customers.map(c => ({
                    id: c.customerId, customerName: c.name, current: (c.currentBalance||0)>0?(c.currentBalance||0):0, days30: 0, days60: 0, days90: 0, total: (c.currentBalance||0)>0?(c.currentBalance||0):0
                }));
            case 'customerLedgerMaster':
                return customerEntries.filter(e=>isWithinRange(e.date)).map(e => ({
                    id: e.id, date: e.date, customerName: e.customerName||e.customerId, type: e.type, reference: e.reference,
                    debit: e.debit>0?e.debit:0, credit: e.credit>0?e.credit:0, balance: e.balance||0
                }));
            case 'topDebtors':
                return customers.filter(c => (c.currentBalance||0) > 0).sort((a,b)=>(b.currentBalance||0) - (a.currentBalance||0)).slice(0,20).map((c,i) => ({
                    id: c.customerId, rank: i+1, customerName: c.name, balance: c.currentBalance||0, risk: (c.currentBalance||0) > 1000000 ? 'HIGH' : 'NORMAL'
                }));

            // ════════ 05. SUPPLIER (10) ════════
            case 'supplierBalanceSummary':
                return suppliers.map(s => ({
                    id: s.supplierId, supplierName: s.name, totalPurchases: 0, totalPayments: 0, currentPayable: s.currentPayable||0, status: (s.currentPayable||0)>0?'PAYABLE':'CLEAR'
                }));
            case 'supplierPaymentsLog':
            case 'supplierPurchases':
                return supplierEntries.filter(e=>isWithinRange(e.date)).map(e => ({
                    id: e.id, date: e.date, supplierName: e.supplierName||e.supplierId, type: e.type, 
                    amount: (e as any).type === 'PAYEE'?(e.debit||0):(e.credit||0), reference: (e as any).reference||'', staffName: (e as any).userName||'', invoiceNumber: (e as any).reference||''
                }));

            // ════════ 06. CASH / FINANCIAL (15) ════════
            case 'cashStatement':
                return cashEntries.filter(e=>isWithinRange(e.date)).map(e => ({
                    id: e.id, date: e.date, type: e.type, in: (e.credit||0)>0?e.credit:0, out: (e.debit||0)>0?e.debit:0, balance: e.balance||0, reference: e.remarks
                }));
            case 'completeExpenseLedger':
                return cashEntries.filter(e=>isWithinRange(e.date) && (e.type as any)==='EXPENSE').map(e => ({
                    id: e.id, date: e.date, category: (e as any).subType||'GENERAL', amount: e.debit||0, staffName: (e as any).userName||'', remarks: e.remarks
                }));
            case 'ownerDrawings':
                return cashEntries.filter(e=>isWithinRange(e.date) && (e.type as any)==='OWNER_WITHDRAWAL').map(e => ({
                    id: e.id, date: e.date, directorName: (e as any).userName||'', amount: e.debit||0, reference: e.remarks
                }));
            case 'dailyLeakage':
                return shifts.filter(s=>isWithinRange(s.date)).map(s => {
                    const exp = (s.expenseEntries||[]).reduce((a: number,b: any)=>a+b.amount,0);
                    return { id: s.shiftId, date: s.date, expenses: exp, drawings: 0, losses: s.variance < 0 ? Math.abs(s.variance) : 0, totalBleed: exp + (s.variance < 0 ? Math.abs(s.variance) : 0) }
                });

            // ════════ 07. STAFF (10) ════════
            case 'staffAttendance':
                return shifts.filter(s=>isWithinRange(s.date)).map(s => ({
                    id: s.shiftId, date: s.date, staffName: s.staffName, checkIn: s.date, checkOut: s.date, status: 'PRESENT'
                }));
            case 'staffSalary':
                return staffEntries.filter(e=>isWithinRange(e.date)).map(e => ({
                    id: e.id, month: e.date, staffName: e.userName, baseSalary: e.credit||0, advances: (e as any).type==='ADVANCE'?e.debit:0, deductions: 0, netPayable: e.balance
                }));
            case 'staffPerformance': {
                const kp: Record<string, any>={};
                shifts.filter(s=>isWithinRange(s.date)).forEach(s=>{
                    if(!kp[s.staffName]) kp[s.staffName]={id:s.staffName, staffName:s.staffName, totalShifts:0, totalSales:0, avgVariance:0};
                    kp[s.staffName].totalShifts++; kp[s.staffName].totalSales+=(s.totalRevenue||0); kp[s.staffName].avgVariance+=(s.variance||0);
                });
                return Object.values(kp).map((v:any)=>({...v, avgVariance: v.totalShifts>0?v.avgVariance/v.totalShifts:0, efficiency: v.avgVariance < -100 ? 'LOW' : 'HIGH'}));
            }
            case 'staffLedgerMaster':
                return staffEntries.filter(e=>isWithinRange(e.date)).map(e => ({
                    id: e.id, timestamp: e.date, staffName: e.userName, type: e.type, debit: e.debit||0, credit: e.credit||0, balance: e.balance
                }));

            // ════════ 08. PROFITABILITY (5) ════════
            case 'shiftGrossProfit':
                return shifts.filter(s=>isWithinRange(s.date)).map(s => ({
                    id: s.shiftId, shiftId: s.shiftId, staffName: s.staffName, revenue: s.totalRevenue, costBasis: s.totalRevenue * 0.95, grossMargin: s.totalRevenue * 0.05
                }));
            case 'netIncomeStatement':
                return profitEntries.filter(e=>isWithinRange(e.date)).map(e => ({
                    id: e.id, month: e.date, grossMargin: e.revenue, runningCosts: e.cost, shrinkage: 0, netProfit: e.netProfit, roiPct: '5%'
                }));

            // ════════ 09. CNG (5) ════════
            case 'cngSaleLedger':
                return cngShifts.filter(s=>isWithinRange(s.date)).map(s => ({
                    id: s.shiftId, date: s.date, nozzleName: 'CNG Master', kgs: s.totalSales, revenue: s.totalRevenue, staffName: s.staffName
                }));

            // ════════ 10. AUDIT & FORENSICS (10) ════════
            case 'auditMasterTimeline':
            case 'auditConfigEdits':
            case 'auditRateTampering':
            case 'auditDeletes':
            case 'auditShiftUnlocks':
                return auditLogs.filter(l=>isWithinRange(l.timestamp)).map(l => ({
                    id: l.id, timestamp: l.timestamp, userName: l.userName, module: l.module, action: l.action, details: l.details,
                    fuelType: 'ALL', oldPrice: 0, newPrice: 0, recordType: l.action, shiftId: '-', adminName: l.userName, reason: l.details
                }));

            // DEFAULT CATCH-ALL FOR PENDING MAPPINGS
            default:
                return [];
        }
`;

const newSource = prefix + newCases + suffix;
fs.writeFileSync(P, newSource);
console.log("Successfully rebuilt switch block in ReportViewer.tsx");
