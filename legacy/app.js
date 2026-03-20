// --- UK Salary Calculator - Core Logic ---

const hourlyRateInput = document.getElementById('hourlyRate');
const hoursPerWeekInput = document.getElementById('hoursPerWeek');
const hasPensionInput = document.getElementById('hasPension');
const hasStudentLoanInput = document.getElementById('hasStudentLoan');

// UI Elements for output
const els = {
    grossAnnual: document.getElementById('grossAnnual'),
    taxAnnual: document.getElementById('taxAnnual'),
    niAnnual: document.getElementById('niAnnual'),
    pensionAnnual: document.getElementById('pensionAnnual'),
    loanAnnual: document.getElementById('loanAnnual'),
    totalDeductions: document.getElementById('totalDeductions'),
    netWeekly: document.getElementById('netWeekly'),
    netMonthly: document.getElementById('netMonthly'),
    netAnnual: document.getElementById('netAnnual'),
    pensionRow: document.getElementById('pensionRow'),
    loanRow: document.getElementById('loanRow')
};

// Helper for currency formatting
const formatCurrency = (amount) => `£${amount.toFixed(2)}`;

function calculateUKNetPay() {
    // 1. Inputs & Error Handling: Use Math.max to prevent negative hours or rates
    const rate = Math.max(0, parseFloat(hourlyRateInput.value) || 0);
    const hours = Math.max(0, parseFloat(hoursPerWeekInput.value) || 0);

    const weeklyGross = rate * hours;
    const annualGross = weeklyGross * 52;

    // 2. Personal Allowance & Income Tax
    // Standard Personal Allowance is £12,570.
    // It is reduced by £1 for every £2 earned above £100,000.
    let personalAllowance = 12570;
    if (annualGross > 100000) {
        const reduction = (annualGross - 100000) / 2;
        personalAllowance = Math.max(0, personalAllowance - reduction);
    }

    const taxableIncome = Math.max(0, annualGross - personalAllowance);
    let annualTax = 0;

    if (taxableIncome > 0) {
        let tax = 0;
        let basicBand = 37700;
        
        // Basic rate (20%)
        let taxableAtBasic = Math.min(taxableIncome, basicBand);
        tax += taxableAtBasic * 0.20;
        
        // Additional rate (45%) on income over £125,140
        let incomeAboveAdditional = Math.max(0, annualGross - 125140);
        tax += incomeAboveAdditional * 0.45;

        // Higher rate (40%) on income between (PA + BasicBand) and £125,140
        let higherRateStart = personalAllowance + basicBand;
        if (annualGross > higherRateStart) {
            let taxableAtHigher = Math.min(annualGross, 125140) - higherRateStart;
            tax += Math.max(0, taxableAtHigher) * 0.40;
        }
        annualTax = tax;
    }

    // 3. National Insurance (Class 1) - 2024/25 rate 8%
    let niIncome = Math.max(0, annualGross - 12570);
    let annualNI = 0;
    if (niIncome > 0) {
        let mainNI = Math.min(niIncome, 37700) * 0.08;
        let upperNI = Math.max(0, niIncome - 37700) * 0.02;
        annualNI = mainNI + upperNI;
    }

    // 4. Pension Contribution (3% auto-enrolment)
    let annualPension = 0;
    if (hasPensionInput.checked) {
        let pensionableEarnings = Math.max(0, Math.min(annualGross, 50270) - 6240);
        annualPension = pensionableEarnings * 0.03;
        els.pensionRow.style.display = 'flex';
    } else {
        els.pensionRow.style.display = 'none';
        annualPension = 0;
    }

    // 5. Student Loan (Plan 2: 9% over £27,295 threshold)
    let annualLoan = 0;
    if (hasStudentLoanInput.checked) {
        let loanableEarnings = Math.max(0, annualGross - 27295);
        annualLoan = loanableEarnings * 0.09;
        els.loanRow.style.display = 'flex';
    } else {
        els.loanRow.style.display = 'none';
        annualLoan = 0;
    }

    // 6. Net Pay Calculation
    const totalDeductions = annualTax + annualNI + annualPension + annualLoan;
    const annualNet = Math.max(0, annualGross - totalDeductions);

    // 7. Update UI
    els.grossAnnual.textContent = formatCurrency(annualGross);
    els.taxAnnual.textContent = `-${formatCurrency(annualTax)}`;
    els.niAnnual.textContent = `-${formatCurrency(annualNI)}`;
    els.pensionAnnual.textContent = `-${formatCurrency(annualPension)}`;
    els.loanAnnual.textContent = `-${formatCurrency(annualLoan)}`;
    els.totalDeductions.textContent = `-${formatCurrency(totalDeductions)}`;
    
    els.netAnnual.textContent = formatCurrency(annualNet);
    els.netMonthly.textContent = formatCurrency(annualNet / 12);
    els.netWeekly.textContent = formatCurrency(annualNet / 52);
}

// Initial calculation on load
calculateUKNetPay();

// Attach event listeners for real-time calculation
hourlyRateInput.addEventListener('input', calculateUKNetPay);
hoursPerWeekInput.addEventListener('input', calculateUKNetPay);
hasPensionInput.addEventListener('change', calculateUKNetPay);
hasStudentLoanInput.addEventListener('change', calculateUKNetPay);