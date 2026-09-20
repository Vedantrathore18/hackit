// Cash-Flow Forecasting & Decision Intelligence Engine for MoneyView

export function computeCashflowMetrics(customers = [], suppliers = [], cashInHand = 14250) {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 86400000);

  // 1. Receivables Breakdown
  let totalReceivables = 0;
  let overdueAmount = 0;
  let overdueCustomersCount = 0;
  let dueWithin7Days = 0;
  let dueWithin7DaysCount = 0;
  let weightedExpectedInflow = 0; // adjusted for customer trust scores

  const overdueList = [];
  const upcomingList = [];

  customers.forEach(cust => {
    const bal = Number(cust.balance) || 0;
    if (bal <= 0) return;

    totalReceivables += bal;
    const dueDate = new Date(cust.dueDate);

    if (cust.status === 'overdue' || dueDate < now) {
      overdueAmount += bal;
      overdueCustomersCount += 1;
      overdueList.push(cust);
    } else if (dueDate <= sevenDaysFromNow) {
      dueWithin7Days += bal;
      dueWithin7DaysCount += 1;
      upcomingList.push(cust);
      // Trust score weighting (e.g. 90 trust score = 90% expected collection)
      const weight = (cust.trustScore || 80) / 100;
      weightedExpectedInflow += bal * weight;
    }
  });

  // 2. Payables Breakdown (Suppliers & Operating Outflow)
  let totalSupplierDues = 0;
  let supplierDues7Days = 0;
  const criticalSuppliers = [];

  suppliers.forEach(sup => {
    const due = Number(sup.amountDue) || 0;
    totalSupplierDues += due;
    const supDueDate = new Date(sup.dueDate);

    if (supDueDate <= sevenDaysFromNow) {
      supplierDues7Days += due;
      if (sup.urgency === 'high' || sup.urgency === 'critical') {
        criticalSuppliers.push(sup);
      }
    }
  });

  // 3. 7-Day Net Cash Position
  const projectedInflow = dueWithin7Days + (cashInHand * 0.4); // assumed baseline daily sales addition
  const netProjectedBalance = (cashInHand + dueWithin7Days) - supplierDues7Days;
  const isCashDeficit = netProjectedBalance < 5000; // safety buffer threshold
  const cashShortfall = isCashDeficit ? Math.abs(netProjectedBalance) : 0;

  // 4. Actionable Financial Insights
  const actionableInsights = [];

  // Insight A: Core 7-Day Cash Shortage / Surplus Alert
  if (isCashDeficit) {
    const recoverableFromOverdue = overdueList.reduce((acc, c) => acc + c.balance, 0);
    actionableInsights.push({
      id: "insight-shortage",
      type: "critical",
      title: "Potential Cash Shortage Detected",
      summary: `You owe ₹${supplierDues7Days.toLocaleString('en-IN')} to suppliers over the next 7 days, but only ₹${(cashInHand + dueWithin7Days).toLocaleString('en-IN')} is projected from in-hand cash and customer dues.`,
      actionPrompt: `Collect ₹${recoverableFromOverdue.toLocaleString('en-IN')} from ${overdueCustomersCount} overdue customers to guarantee smooth stock supply without borrowing.`,
      targetCustomers: overdueList,
      metric: `Deficit Risk: ₹${cashShortfall.toLocaleString('en-IN')}`,
      impactScore: 9.8
    });
  } else {
    actionableInsights.push({
      id: "insight-healthy",
      type: "success",
      title: "Strong Liquidity Buffer Ahead",
      summary: `₹${dueWithin7Days.toLocaleString('en-IN')} expected from customers covers all ₹${supplierDues7Days.toLocaleString('en-IN')} supplier liabilities with a healthy ₹${netProjectedBalance.toLocaleString('en-IN')} buffer.`,
      actionPrompt: "Opportunity: Avail 2-3% cash-settlement discounts from FMCG distributors on bulk oil & grains.",
      metric: `Buffer: +₹${netProjectedBalance.toLocaleString('en-IN')}`,
      impactScore: 8.5
    });
  }

  // Insight B: High-Value Credit Concentration
  const sortedByBal = [...customers].sort((a, b) => b.balance - a.balance);
  if (sortedByBal.length > 0 && totalReceivables > 0) {
    const topDebtor = sortedByBal[0];
    const debtorPercentage = Math.round((topDebtor.balance / totalReceivables) * 100);
    if (debtorPercentage >= 20) {
      actionableInsights.push({
        id: "insight-concentration",
        type: "warning",
        title: "Credit Concentration Risk",
        summary: `${topDebtor.name} owes ₹${topDebtor.balance.toLocaleString('en-IN')}, accounting for ${debtorPercentage}% of your total outstanding credit.`,
        actionPrompt: "Action: Pause additional credit lines for this account until current balance is brought below 15%.",
        targetCustomers: [topDebtor],
        metric: `${debtorPercentage}% of total credit`,
        impactScore: 8.9
      });
    }
  }

  // Insight C: Late Payment Pattern Detection
  const latePayers = customers.filter(c => c.behavior && c.behavior.toLowerCase().includes('late'));
  if (latePayers.length > 0) {
    actionableInsights.push({
      id: "insight-late-pattern",
      type: "info",
      title: "Late Payment Behavioral Pattern Detected",
      summary: `${latePayers.map(c => c.name).join(', ')} consistently settle invoices 4-7 days past due date.`,
      actionPrompt: "Recommended: Shift these accounts from 15-day to 7-day credit cycles to protect store working capital.",
      targetCustomers: latePayers,
      metric: `${latePayers.length} chronic late payers`,
      impactScore: 7.8
    });
  }

  // 5. Generate 7-day visualization curve for charts
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartData = [];
  let runningCash = cashInHand;

  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    const dayName = dayNames[d.getDay()];
    const dateStr = d.toISOString().split('T')[0];

    // Inflow: daily cash sales ~ ₹4,000 + customer udhaar due that day
    const dayDues = customers
      .filter(c => c.dueDate === dateStr)
      .reduce((sum, c) => sum + c.balance, 0);
    const dayInflow = 4200 + dayDues;

    // Outflow: supplier dues due that day
    const dayOutflow = suppliers
      .filter(s => s.dueDate === dateStr)
      .reduce((sum, s) => sum + s.amountDue, 0);

    runningCash = runningCash + dayInflow - dayOutflow;

    chartData.push({
      day: `${dayName} (${d.getDate()})`,
      date: dateStr,
      inflow: dayInflow,
      outflow: dayOutflow,
      netCash: runningCash,
      customerDues: dayDues,
    });
  }

  return {
    cashInHand,
    totalReceivables,
    overdueAmount,
    overdueCustomersCount,
    dueWithin7Days,
    dueWithin7DaysCount,
    totalSupplierDues,
    supplierDues7Days,
    netProjectedBalance,
    isCashDeficit,
    cashShortfall,
    overdueList,
    upcomingList,
    criticalSuppliers,
    actionableInsights,
    chartData
  };
}
