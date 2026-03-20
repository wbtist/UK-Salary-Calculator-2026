import React, { useState, useMemo } from 'react';
import './index.css';

const dictionary = {
  UK: {
    title1: "Understanding Your UK Salary",
    desc: "This calculator breaks down your gross income into your true take-home pay by accurately calculating Income Tax, National Insurance, Auto-enrolment Pension contributions, and ",
    slLink: "Student Loan (Plan 2)",
    descCont: " deductions for the 2025/2026 tax year.",
    bandTitle: "Tax Bands:",
    bandDesc: "Adapts to the 20%, 40%, and 45% bands automatically.",
    paTitle: "Personal Allowance:",
    paDesc: "Standard £12,570 (reduces if income exceeds £100,000).",
    rtTitle: "Real-time:",
    rtDesc: "Type your rates and see your net pay instantly.",
    calcTitle: "UK Salary Calculator 2026 tax year",
    hourlyRate: "Hourly Rate (£)",
    hoursPerWeek: "Hours per Week",
    pension: "Deduct Pension (3%)",
    studentLoan: "Student Loan (Plan 2)",
    takeHome: "Take-Home Pay (Net)",
    weekly: "Weekly:",
    monthly: "Monthly:",
    annually: "Annually:",
    breakdown: "Annual Breakdown",
    grossPay: "Gross Pay:",
    incomeTax: "Income Tax:",
    basic: "↳ Basic (20%)",
    higher: "↳ Higher (40%)",
    additional: "↳ Additional (45%)",
    nationalInsurance: "National Insurance:",
    pensionOutput: "Pension:",
    slOutput: "Student Loan:",
    totalDeductions: "Total Deductions:"
  },
  HUN: {
    title1: "Az Egyesült Királyságbeli fizetésed megértése",
    desc: "Ez a kalkulátor a bruttó jövedelmedből pontosan kiszámolja a tényleges nettó béredet, levonva a személyi jövedelemadót (Income Tax), a társadalombiztosítást (National Insurance), az automatikus nyugdíjjárulékot, valamint a ",
    slLink: "diákhitel (Student Loan - Plan 2)",
    descCont: " törlesztését a 2025/2026-os adóévre vonatkozóan.",
    bandTitle: "Adósávok:",
    bandDesc: "Automatikusan alkalmazkodik a 20%, 40% és 45%-os sávokhoz.",
    paTitle: "Adómentes keret (Personal Allowance):",
    paDesc: "Alapérték £12,570 (csökken, ha a jövedelem meghaladja a £100,000-t).",
    rtTitle: "Valós idejű:",
    rtDesc: "Írd be a béred és azonnal láthatod a nettó összeget.",
    calcTitle: "UK Fizetés Kalkulátor 2026-os adóév",
    hourlyRate: "Órabér (£)",
    hoursPerWeek: "Heti munkaóra",
    pension: "Nyugdíj levonása (3%)",
    studentLoan: "Diákhitel (Plan 2)",
    takeHome: "Nettó fizetés (Kézhez kapott)",
    weekly: "Heti:",
    monthly: "Havi:",
    annually: "Éves:",
    breakdown: "Éves bontás",
    grossPay: "Bruttó fizetés:",
    incomeTax: "Személyi jövedelemadó (Tax):",
    basic: "↳ Alap (20%)",
    higher: "↳ Magasabb (40%)",
    additional: "↳ Kiegészítő (45%)",
    nationalInsurance: "Társadalombiztosítás (NI):",
    pensionOutput: "Nyugdíj:",
    slOutput: "Diákhitel:",
    totalDeductions: "Összes levonás:"
  }
};

function App() {
  const [lang, setLang] = useState('UK');
  const t = dictionary[lang];

  const [hourlyRate, setHourlyRate] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('');
  const [hasPension, setHasPension] = useState(true);
  const [hasStudentLoan, setHasStudentLoan] = useState(false);

  // Compute logic
  const results = useMemo(() => {
    const rate = Math.max(0, parseFloat(hourlyRate) || 0);
    const hours = Math.max(0, parseFloat(hoursPerWeek) || 0);

    const weeklyGross = rate * hours;
    const annualGross = weeklyGross * 52;

    let personalAllowance = 12570;
    if (annualGross > 100000) {
      const reduction = (annualGross - 100000) / 2;
      personalAllowance = Math.max(0, personalAllowance - reduction);
    }

    const taxableIncome = Math.max(0, annualGross - personalAllowance);
    let annualTax = 0;
    let basicTax = 0;
    let higherTax = 0;
    let additionalTax = 0;

    if (taxableIncome > 0) {
      let basicBand = 37700;
      let taxableAtBasic = Math.min(taxableIncome, basicBand);
      basicTax = taxableAtBasic * 0.20;

      let incomeAboveAdditional = Math.max(0, annualGross - 125140);
      additionalTax = incomeAboveAdditional * 0.45;

      let higherRateStart = personalAllowance + basicBand;
      if (annualGross > higherRateStart) {
        let taxableAtHigher = Math.min(annualGross, 125140) - higherRateStart;
        higherTax = Math.max(0, taxableAtHigher) * 0.40;
      }
      annualTax = basicTax + higherTax + additionalTax;
    }

    let niIncome = Math.max(0, annualGross - 12570);
    let annualNI = 0;
    if (niIncome > 0) {
      let mainNI = Math.min(niIncome, 37700) * 0.08;
      let upperNI = Math.max(0, niIncome - 37700) * 0.02;
      annualNI = mainNI + upperNI;
    }

    let annualPension = 0;
    if (hasPension) {
      let pensionableEarnings = Math.max(0, Math.min(annualGross, 50270) - 6240);
      annualPension = pensionableEarnings * 0.03; 
    }

    let annualLoan = 0;
    if (hasStudentLoan) {
      let loanableEarnings = Math.max(0, annualGross - 27295);
      annualLoan = loanableEarnings * 0.09;
    }

    const totalDeductions = annualTax + annualNI + annualPension + annualLoan;
    const annualNet = Math.max(0, annualGross - totalDeductions);

    return {
      annualGross,
      annualTax,
      basicTax,
      higherTax,
      additionalTax,
      annualNI,
      annualPension,
      annualLoan,
      totalDeductions,
      annualNet,
      monthlyNet: annualNet / 12,
      weeklyNet: annualNet / 52
    };
  }, [hourlyRate, hoursPerWeek, hasPension, hasStudentLoan]);

  const formatCurrency = (amount) => `£${amount.toFixed(2)}`;

  return (
    <div className="app-container">
      <div className="language-toggle animate-fade-in-up delay-1">
        <button className={lang === 'UK' ? 'active' : ''} onClick={() => setLang('UK')}>🇬🇧 UK</button>
        <button className={lang === 'HUN' ? 'active' : ''} onClick={() => setLang('HUN')}>🇭🇺 HUN</button>
      </div>

      <div className="info-section animate-fade-in-up delay-1">
        <h1>{t.title1}</h1>
        <p>
          {t.desc}
          <a href="https://www.gov.uk/government/publications/sl3-student-loan-deduction-tables/2025-to-2026-student-and-postgraduate-loan-deduction-tables" target="_blank" rel="noopener noreferrer" style={{ color: '#3498db', textDecoration: 'underline' }}>{t.slLink}</a>
          {t.descCont}
        </p>
        <ul>
          <li><strong>{t.bandTitle}</strong> {t.bandDesc}</li>
          <li><strong>{t.paTitle}</strong> {t.paDesc}</li>
          <li><strong>{t.rtTitle}</strong> {t.rtDesc}</li>
        </ul>
      </div>

      <div className="calculator-card animate-fade-in-up delay-2">
        <h2>{t.calcTitle}</h2>
        
        <div className="input-group">
          <label htmlFor="hourlyRate">{t.hourlyRate}</label>
          <input 
            type="number" 
            id="hourlyRate" 
            value={hourlyRate}
            onChange={e => setHourlyRate(e.target.value)}
            placeholder="e.g. 11.44" 
            step="0.01" 
            min="0" 
          />
        </div>

        <div className="input-group">
          <label htmlFor="hoursPerWeek">{t.hoursPerWeek}</label>
          <input 
            type="number" 
            id="hoursPerWeek" 
            value={hoursPerWeek}
            onChange={e => setHoursPerWeek(e.target.value)}
            placeholder="e.g. 37.5" 
            step="0.5" 
            min="0" 
          />
        </div>

        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="hasPension" 
            checked={hasPension}
            onChange={e => setHasPension(e.target.checked)}
          />
          <label htmlFor="hasPension" style={{marginBottom: 0, cursor: 'pointer'}}>{t.pension}</label>
        </div>

        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="hasStudentLoan" 
            checked={hasStudentLoan}
            onChange={e => setHasStudentLoan(e.target.checked)}
          />
          <label htmlFor="hasStudentLoan" style={{marginBottom: 0, cursor: 'pointer'}}>{t.studentLoan}</label>
        </div>

        <div className="section-title">{t.takeHome}</div>
        <div className="net-box">
          <div className="result-item">
            <span>{t.weekly}</span>
            <span className="text-green">{formatCurrency(results.weeklyNet)}</span>
          </div>
          <div className="result-item">
            <span>{t.monthly}</span>
            <span className="text-green">{formatCurrency(results.monthlyNet)}</span>
          </div>
          <div className="result-item total">
            <span>{t.annually}</span>
            <span className="text-green">{formatCurrency(results.annualNet)}</span>
          </div>
        </div>

        <div className="section-title">{t.breakdown}</div>
        <div className="results-box">
          <div className="result-item">
            <span>{t.grossPay}</span>
            <span>{formatCurrency(results.annualGross)}</span>
          </div>
        </div>
        
        <div className="deductions-box">
          <div className="result-item text-red">
            <span>{t.incomeTax}</span>
            <span>-{formatCurrency(results.annualTax)}</span>
          </div>
          {results.basicTax > 0 && (
            <div className="result-item text-red" style={{ fontSize: '14px', marginTop: '-6px', opacity: 0.85 }}>
              <span style={{ paddingLeft: '20px' }}>{t.basic}</span>
              <span>-{formatCurrency(results.basicTax)}</span>
            </div>
          )}
          {results.higherTax > 0 && (
            <div className="result-item text-red" style={{ fontSize: '14px', marginTop: '-6px', opacity: 0.85 }}>
              <span style={{ paddingLeft: '20px' }}>{t.higher}</span>
              <span>-{formatCurrency(results.higherTax)}</span>
            </div>
          )}
          {results.additionalTax > 0 && (
            <div className="result-item text-red" style={{ fontSize: '14px', marginTop: '-6px', opacity: 0.85 }}>
              <span style={{ paddingLeft: '20px' }}>{t.additional}</span>
              <span>-{formatCurrency(results.additionalTax)}</span>
            </div>
          )}
          <div className="result-item text-red">
            <span>{t.nationalInsurance}</span>
            <span>-{formatCurrency(results.annualNI)}</span>
          </div>
          {results.annualPension > 0 && (
            <div className="result-item text-red">
              <span>{t.pensionOutput}</span>
              <span>-{formatCurrency(results.annualPension)}</span>
            </div>
          )}
          {results.annualLoan > 0 && (
            <div className="result-item text-red">
              <span>{t.slOutput}</span>
              <span>-{formatCurrency(results.annualLoan)}</span>
            </div>
          )}
          <div className="result-item total text-red">
            <span>{t.totalDeductions}</span>
            <span>-{formatCurrency(results.totalDeductions)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
