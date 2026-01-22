import React, { useState } from 'react';
import { Calculator, DollarSign, Percent, Calendar } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function MortgageCalculator({ propertyPrice }) {
  const [homePrice, setHomePrice] = useState(propertyPrice || 500000);
  const [downPayment, setDownPayment] = useState(20);
  const [interestRate, setInterestRate] = useState(7.0);
  const [loanTerm, setLoanTerm] = useState(30);

  const downPaymentAmount = (homePrice * downPayment) / 100;
  const loanAmount = homePrice - downPaymentAmount;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  const monthlyPayment = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  // Estimate property tax and insurance (rough estimates)
  const propertyTax = (homePrice * 0.012) / 12; // 1.2% annually
  const homeInsurance = (homePrice * 0.005) / 12; // 0.5% annually
  const totalMonthly = monthlyPayment + propertyTax + homeInsurance;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
          <Calculator className="w-6 h-6 text-teal-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Mortgage Calculator</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Home Price */}
        <div className="space-y-3">
          <Label className="text-white/80 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Home Price
          </Label>
          <Input
            type="number"
            value={homePrice}
            onChange={(e) => setHomePrice(Number(e.target.value))}
            className="bg-white/5 border-white/20 text-white text-lg h-12"
          />
        </div>

        {/* Down Payment */}
        <div className="space-y-3">
          <Label className="text-white/80 flex items-center gap-2">
            <Percent className="w-4 h-4" />
            Down Payment: {downPayment}%
          </Label>
          <Slider
            value={[downPayment]}
            onValueChange={(value) => setDownPayment(value[0])}
            min={0}
            max={50}
            step={1}
            className="py-4"
          />
          <p className="text-teal-400 text-sm font-medium">
            ${downPaymentAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>

        {/* Interest Rate */}
        <div className="space-y-3">
          <Label className="text-white/80 flex items-center gap-2">
            <Percent className="w-4 h-4" />
            Interest Rate
          </Label>
          <Input
            type="number"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="bg-white/5 border-white/20 text-white text-lg h-12"
          />
        </div>

        {/* Loan Term */}
        <div className="space-y-3">
          <Label className="text-white/80 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Loan Term (years)
          </Label>
          <select
            value={loanTerm}
            onChange={(e) => setLoanTerm(Number(e.target.value))}
            className="w-full h-12 px-4 rounded-lg bg-white/5 border border-white/20 text-white text-lg"
          >
            <option value={15}>15 years</option>
            <option value={20}>20 years</option>
            <option value={30}>30 years</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-2xl p-4 border border-teal-500/20">
          <p className="text-white/60 text-sm mb-1">Principal & Interest</p>
          <p className="text-2xl font-bold text-white">
            ${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}<span className="text-lg text-white/60">/mo</span>
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl p-4 border border-blue-500/20">
          <p className="text-white/60 text-sm mb-1">Estimated Total Payment</p>
          <p className="text-2xl font-bold text-white">
            ${totalMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}<span className="text-lg text-white/60">/mo</span>
          </p>
          <p className="text-xs text-white/40 mt-1">Includes taxes & insurance</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-4 border border-purple-500/20">
          <p className="text-white/60 text-sm mb-1">Total Interest Paid</p>
          <p className="text-2xl font-bold text-white">
            ${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      <p className="text-white/40 text-xs mt-4 text-center">
        *This is an estimate. Actual payments may vary based on property taxes, insurance, and HOA fees.
      </p>
    </div>
  );
}