import React, { useState } from 'react';
import { ViewState } from '../types';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface QuizProps {
  setView: (view: ViewState) => void;
}

export const Quiz: React.FC<QuizProps> = ({ setView }) => {
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else setView({ page: 'category', categoryName: 'Drivers' }); // Mock result
  };

  return (
    <div class="max-w-3xl mx-auto px-4 py-16">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Fit</h1>
        <p class="text-gray-600">Answer a few quick questions and Golf AI will recommend the best gear for your game.</p>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        {/* Progress Bar */}
        <div class="flex justify-between mb-8 relative">
          <div class="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 transform -translate-y-1/2"></div>
          <div class="absolute top-1/2 left-0 h-1 bg-golf-500 -z-10 transform -translate-y-1/2 transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          
          {[1, 2, 3].map(num => (
            <div key={num} class={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= num ? 'bg-golf-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > num ? <CheckCircle2 size={16} /> : num}
            </div>
          ))}
        </div>

        {/* Questions */}
        <div class="min-h-[250px]">
          {step === 1 && (
            <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 class="text-xl font-bold text-gray-900 mb-6">What is your typical 18-hole score?</h2>
              <div class="space-y-3">
                {['Under 80 (Low Handicap)', '80 - 90 (Mid Handicap)', '90 - 100+ (High Handicap / Beginner)'].map(opt => (
                  <label key={opt} class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-golf-500 hover:bg-golf-50 transition-colors">
                    <input type="radio" name="score" class="text-golf-600 focus:ring-golf-500 w-5 h-5" />
                    <span class="ml-3 font-medium text-gray-900">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 class="text-xl font-bold text-gray-900 mb-6">What is your biggest goal right now?</h2>
              <div class="space-y-3">
                {['More Distance off the tee', 'More Forgiveness on mishits', 'Better Short Game control', 'Finding a great value'].map(opt => (
                  <label key={opt} class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-golf-500 hover:bg-golf-50 transition-colors">
                    <input type="radio" name="goal" class="text-golf-600 focus:ring-golf-500 w-5 h-5" />
                    <span class="ml-3 font-medium text-gray-900">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 class="text-xl font-bold text-gray-900 mb-6">What are you shopping for today?</h2>
              <div class="grid grid-cols-2 gap-3">
                {['Drivers', 'Irons', 'Wedges', 'Putters', 'Golf Balls', 'Apparel'].map(opt => (
                  <label key={opt} class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-golf-500 hover:bg-golf-50 transition-colors">
                    <input type="checkbox" class="text-golf-600 focus:ring-golf-500 rounded w-5 h-5" />
                    <span class="ml-3 font-medium text-gray-900">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div class="mt-8 flex justify-end">
          <button 
            onClick={handleNext}
            class="bg-golf-600 hover:bg-golf-700 text-white px-6 py-3 rounded-md font-bold flex items-center gap-2 transition-colors"
          >
            {step === 3 ? 'See Recommendations' : 'Next Question'} <ArrowRight size={18} />
          </button>
        </div>
      </div>
      
      <div class="mt-8 text-center text-sm text-gray-500">
        Need more personalized help? Click the <strong>Golf AI</strong> button in the bottom right to chat with our virtual assistant.
      </div>
    </div>
  );
};
