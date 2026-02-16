import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Ruler, User, Award, X, Scale, Clock, Check, Activity, ShieldCheck, HeartPulse } from 'lucide-react';

const SizingWizard = ({ onClose, sector = 'general' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [language, setLanguage] = useState('ar'); // 'ar' or 'en'
  const [showLogic, setShowLogic] = useState(false);

  // Helper to check if user is child based on answer
  const isChild = () => {
    // If demographic is boy/girl, they are children
    // If age is < 15, they are children
    if (answers.demographic === 'boy' || answers.demographic === 'girl') return true;
    if (answers.age && parseInt(answers.age) < 15) return true;
    return false;
  };

  const questions = [
    {
      id: 'demographic',
      icon: <User className="w-6 h-6" />,
      questionAr: 'من سيرتدي الزي الموحد؟',
      questionEn: 'Who will wear the uniform?',
      type: 'choice',
      getOptions: () => {
        if (sector === 'schools') {
          return [
            { valueAr: 'ولد (طلاب)', valueEn: 'Boy (Student)', value: 'boy' },
            { valueAr: 'بنت (طالبات)', valueEn: 'Girl (Student)', value: 'girl' }
          ];
        }
        return [
          { valueAr: 'رجل بالغ', valueEn: 'Adult Male', value: 'adult_male' },
          { valueAr: 'امرأة بالغة', valueEn: 'Adult Female', value: 'adult_female' },
          { valueAr: 'ولد (طلاب)', valueEn: 'Boy (Student)', value: 'boy' },
          { valueAr: 'بنت (طالبات)', valueEn: 'Girl (Student)', value: 'girl' }
        ];
      },
      logicAr: 'تحديد الفئة المستهدفة يساعدنا في اختيار جدول المقاسات الصحيح (أطفال / بالغين) ونوع القصّة.',
      logicEn: 'Identifying the target group helps us choose the right size chart (kids/adults) and cut type.'
    },
    {
      id: 'age',
      icon: <Clock className="w-6 h-6" />,
      questionAr: 'كم العمر (بالسنوات)؟',
      questionEn: 'Age (in years)?',
      type: 'number',
      placeholder: '10',
      min: 4,
      max: 99,
      logicAr: 'لمن هم تحت 15 سنة، العمر هو المؤشر الأساسي للمقاس (مثلاً مقاس 10 لعمر 10). للكبار، يساعدنا في توقع توزيع الوزن.',
      logicEn: 'For those under 15, age is the primary indicator (e.g., size 10 for age 10). For adults, it helps predict weight distribution.'
    },
    {
      id: 'height',
      icon: <Ruler className="w-6 h-6" />,
      questionAr: 'الطول التقريبي (سم)؟',
      questionEn: 'Approximate Height (cm)?',
      type: 'number',
      placeholder: '140',
      min: 80,
      max: 220,
      logicAr: 'الطول يحدد إذا ما كنا بحاجة لمقاس أكبر للحصول على طول مناسب، خاصة للأشخاص طوال القامة.',
      logicEn: 'Height determines if we need a size up for proper length, especially for tall individuals.'
    },
    {
      id: 'weight',
      icon: <Scale className="w-6 h-6" />,
      questionAr: 'الوزن التقريبي (كجم)؟',
      questionEn: 'Approximate Weight (kg)?',
      type: 'number',
      placeholder: '40',
      min: 10,
      max: 200,
      logicAr: 'الوزن هو العامل الحاسم. حتى لو كان العمر مناسباً، الوزن الزائد يتطلب مقاساً أكبر للراحة.',
      logicEn: 'Weight is the deciding factor. Even if age matches, higher weight requires a larger size for comfort.'
    },
    {
      id: 'bodyShape',
      icon: <User className="w-6 h-6" />,
      questionAr: 'أين يتركز الوزن؟',
      questionEn: 'Where is weight concentrated?',
      type: 'choice',
      options: [
        { valueAr: 'الصدر / الأكتاف', valueEn: 'Chest / Shoulders', value: 'shoulders' },
        { valueAr: 'البطن / الخصر', valueEn: 'Midsection / Waist', value: 'midsection' },
        { valueAr: 'الأرداف / الأسفل', valueEn: 'Hips / Bottom', value: 'bottom' },
        { valueAr: 'متناسق', valueEn: 'Proportional', value: 'proportional' }
      ],
      logicAr: 'معرفة توزيع الوزن تساعدنا في ضمان أن الزي لن يكون ضيقاً في مناطق معينة.',
      logicEn: 'Knowing weight distribution ensures the uniform won\'t be tight in specific areas.'
    },
    {
      id: 'fitPreference',
      icon: <ShieldCheck className="w-6 h-6" />,
      questionAr: 'كيف تفضل مقاس الزي؟',
      questionEn: 'How do you prefer the fit?',
      type: 'choice',
      options: [
        { valueAr: 'مضبوط / على المقاس', valueEn: 'Fitted', value: 'fitted' },
        { valueAr: 'عادي / مريح', valueEn: 'Regular', value: 'regular' },
        { valueAr: 'فضفاض / واسع', valueEn: 'Loose', value: 'loose' }
      ],
      logicAr: 'تفضيل القَصّة شخصي ويختلف حسب الرغبة في الراحة أو المظهر.',
      logicEn: 'Fit preference is personal and depends on desired comfort or look.'
    },
    {
      id: 'growth',
      icon: <Activity className="w-6 h-6" />,
      questionAr: 'معدل نمو الطفل؟',
      questionEn: 'Child\'s growth rate?',
      type: 'choice',
      condition: (answers) => answers.age && parseInt(answers.age) < 15,
      options: [
        { valueAr: 'نمو طبيعي', valueEn: 'Normal Growth', value: 'normal' },
        { valueAr: 'نمو سريع', valueEn: 'Fast Growing', value: 'fast' }
      ],
      logicAr: 'للأطفال في مرحلة نمو سريع، نوصي عادةً بمقاس أكبر قليلاً ليدوم لفترة أطول.',
      logicEn: 'For fast-growing children, we usually recommend a slightly larger size to last longer.'
    }
  ];

  // Filter questions based on conditions
  const availableQuestions = questions.filter(q => !q.condition || q.condition(answers));

  const getCurrentQuestion = () => {
    if (currentStep >= availableQuestions.length) return {};
    const question = availableQuestions[currentStep];
    if (question.getOptions) {
      return {
        ...question,
        options: question.getOptions()
      };
    }
    return question;
  };

  const handleAnswer = (value) => {
    const questionId = availableQuestions[currentStep].id;
    setAnswers({ ...answers, [questionId]: value });
  };

  const nextStep = () => {
    if (currentStep < availableQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(availableQuestions.length); // Show results
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateSize = () => {
    const age = parseInt(answers.age);
    const weight = parseInt(answers.weight);
    const height = parseInt(answers.height);
    const fit = answers.fitPreference;
    const bodyShape = answers.bodyShape;
    const growth = answers.growth;

    let recommendedSize = '';
    const notes = [];

    if (age < 15) {
      // --- CHILD LOGIC (Numeric Sizes: 4, 6, 8, 10, 12, 14, 16) ---
      // 1. Base Size roughly equals Age
      let baseSize = age;

      // 2. Adjust for Weight
      // Heuristic: If weight > Age * 3.5, size up significantly
      if (weight > (age * 3.5)) {
        baseSize += 2;
        notes.push(language === 'ar' ? 'تم اختيار مقاس أكبر بناءً على الوزن.' : 'Sized up based on weight.');
      } else if (weight > (age * 3)) {
        baseSize += 1;
      }

      // 3. Adjust for Fit/Growth
      if (fit === 'loose' || growth === 'fast') {
        baseSize += 2;
        if (growth === 'fast') {
          notes.push(language === 'ar' ? 'تم مراعاة نمو الطفل السريع.' : 'Accounted for fast growth.');
        }
      }

      // Clamp to known sizes: 4, 6, 8, 10, 12, 14, 16
      // Ensure it's even
      if (baseSize % 2 !== 0) baseSize += 1;

      baseSize = Math.max(4, Math.min(16, baseSize));
      recommendedSize = baseSize.toString();

    } else {
      // --- ADULT LOGIC (Letter Sizes: XS, S, M, L, XL, XXL, 3XL) ---
      const sizeMap = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
      let sizeIdx = 2; // Default M

      // Base Index via Weight
      if (weight < 55) sizeIdx = 0;      // XS
      else if (weight < 65) sizeIdx = 1; // S
      else if (weight < 75) sizeIdx = 2; // M
      else if (weight < 85) sizeIdx = 3; // L
      else if (weight < 98) sizeIdx = 4; // XL
      else if (weight < 110) sizeIdx = 5;// XXL
      else sizeIdx = 6;                  // 3XL

      // Adjust for Body Shape
      if (bodyShape === 'midsection' || bodyShape === 'bottom') {
        sizeIdx += 1;
        notes.push(language === 'ar' ? 'تم تعديل المقاس لراحة منطقة الوسط/الأرداف.' : 'Adjusted for comfort in midsection/hips.');
      }

      // Adjust for Fit
      if (fit === 'loose') sizeIdx += 1;
      if (fit === 'fitted') sizeIdx -= 1;

      // Clamp index
      sizeIdx = Math.max(0, Math.min(6, sizeIdx));
      recommendedSize = sizeMap[sizeIdx];
    }

    return { size: recommendedSize, notes };
  };

  const currentQuestion = getCurrentQuestion();
  // Safe calculation for progress
  const progress = availableQuestions.length > 0 ? ((currentStep + 1) / availableQuestions.length) * 100 : 0;

  if (currentStep === availableQuestions.length) {
    const result = calculateSize();
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
          <button
            onClick={onClose}
            className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} p-2 text-gray-400 hover:text-gray-600 z-10`}
          >
            <X className="w-6 h-6" />
          </button>

          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                <HeartPulse className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {language === 'ar' ? 'مقاسك الموصى به' : 'Your Recommended Size'}
              </h2>
            </div>

            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl p-8 mb-6 text-center shadow-lg">
              <div className="text-6xl font-bold mb-2 tracking-tight">{result.size}</div>
              <div className="text-xl opacity-90 font-medium">
                {language === 'ar' ? 'المقاس الموصى به لك' : 'Recommended Size for You'}
              </div>
            </div>

            {result.notes.length > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  {language === 'ar' ? 'ملاحظات مهمة:' : 'Important Notes:'}
                </h3>
                <ul className="list-disc list-inside text-yellow-700 space-y-1">
                  {result.notes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 text-lg border-b border-gray-200 pb-2">
                {language === 'ar' ? 'ملخص إجاباتك:' : 'Your Answers Summary:'}
              </h3>
              <div className="space-y-0 text-gray-600">
                {availableQuestions.map((q, idx) => {
                  let displayValue = answers[q.id];
                  // If choice, find the label
                  if (q.type === 'choice') {
                    const opts = q.options || q.getOptions?.();
                    const found = opts?.find(opt => opt.value === displayValue);
                    displayValue = language === 'ar' ? found?.valueAr : found?.valueEn;
                  } else {
                    // Number inputs
                    if (q.id === 'height') displayValue += ' cm';
                    if (q.id === 'weight') displayValue += ' kg';
                    if (q.id === 'age') displayValue += (language === 'ar' ? ' سنوات' : ' years');
                  }

                  return (
                    <div key={idx} className="flex flex-col py-3 border-b border-gray-200 last:border-0 gap-1.5">
                      <span className="text-gray-500 text-xs sm:text-sm leading-tight flex items-center gap-1">
                        {q.icon && React.cloneElement(q.icon, { className: "w-3 h-3" })}
                        {language === 'ar' ? q.questionAr : q.questionEn}
                      </span>
                      <span className="font-bold text-gray-800 text-sm sm:text-base px-1">
                        {displayValue}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setCurrentStep(0);
                  setAnswers({});
                }}
                className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition shadow-sm"
              >
                {language === 'ar' ? 'إعادة البداية' : 'Start Over'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <button
          onClick={onClose}
          className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} p-2 text-gray-400 hover:text-gray-600 z-10`}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-indigo-600 rounded-full mb-4 shadow-lg shadow-indigo-200">
              <Ruler className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
              {language === 'ar' ? 'اعرف مقاسك' : 'Know Your Size'}
            </h1>
            <p className="text-gray-500 text-sm">
              {language === 'ar' ? 'أجب عن الأسئلة التالية للحصول على المقاس المناسب' : 'Answer the following questions to get the right size'}

              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="mx-2 px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600 hover:bg-gray-200 transition"
              >
                {language === 'ar' ? 'English' : 'العربية'}
              </button>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              <span>{language === 'ar' ? `السؤال ${currentStep + 1} من ${availableQuestions.length}` : `Question ${currentStep + 1} of ${availableQuestions.length}`}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                {currentQuestion.icon}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                {language === 'ar' ? currentQuestion.questionAr : currentQuestion.questionEn}
              </h2>
            </div>

            <div className="min-h-[200px] flex flex-col justify-center">
              {currentQuestion.type === 'choice' ? (
                <div className="space-y-3">
                  {(currentQuestion.options || currentQuestion.getOptions())?.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(option.value)}
                      className={`w-full p-4 rounded-xl border-2 text-right transition-all flex items-center justify-between group ${answers[currentQuestion.id] === option.value
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md'
                        : 'border-gray-100 hover:border-indigo-300 hover:bg-gray-50'
                        }`}
                    >
                      <span className={`font-bold ${answers[currentQuestion.id] === option.value ? 'text-indigo-700' : 'text-gray-700'}`}>
                        {language === 'ar' ? option.valueAr : option.valueEn}
                      </span>
                      {answers[currentQuestion.id] === option.value && <Check className="w-5 h-5 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      handleAnswer(val);
                    }}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl text-center text-4xl font-bold text-gray-800 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-gray-300"
                    placeholder={language === 'ar' ? 'أدخل الرقم...' : 'Enter number...'}
                    autoFocus
                    dir="ltr"
                  />
                  {currentQuestion.id === 'age' && (
                    <p className="text-center text-gray-400 text-sm">
                      {language === 'ar' ? 'السنوات' : 'Years'}
                    </p>
                  )}
                  {currentQuestion.id === 'height' && (
                    <p className="text-center text-gray-400 text-sm">cm</p>
                  )}
                  {currentQuestion.id === 'weight' && (
                    <p className="text-center text-gray-400 text-sm">kg</p>
                  )}
                </div>
              )}
            </div>

            {/* Navigation for Number Inputs */}
            {currentQuestion.type === 'number' && (
              <div className="mt-8 flex justify-end">
                <div className="flex gap-4 w-full">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className={`px-6 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${currentStep === 0
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {language === 'ar' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    {language === 'ar' ? 'عودة' : 'Back'}
                  </button>

                  <button
                    onClick={nextStep}
                    disabled={!answers[currentQuestion.id]}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition shadow-lg ${!answers[currentQuestion.id]
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                      }`}
                  >
                    {language === 'ar' ? 'التالي' : 'Next'}
                    {language === 'ar' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Navigation for Choice Inputs (Only Back needed as choice auto-advances or selects) */}
            {currentQuestion.type === 'choice' && (
              <div className="mt-8 flex justify-between gap-4">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`px-6 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${currentStep === 0
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {language === 'ar' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                  {language === 'ar' ? 'عودة' : 'Back'}
                </button>

                {/* Show Next button only if answered, allowing to confirm selection or move forward if user went back */}
                <button
                  onClick={nextStep}
                  disabled={!answers[currentQuestion.id]}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition ${!answers[currentQuestion.id]
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                    }`}
                >
                  {currentStep === availableQuestions.length - 1
                    ? (language === 'ar' ? 'احصل على النتيجة' : 'Get Result')
                    : (language === 'ar' ? 'التالي' : 'Next')
                  }
                  {language === 'ar' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            )}


          </div>

          {/* Tailoring Logic Toggle */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <button
              onClick={() => setShowLogic(!showLogic)}
              className="w-full flex items-center justify-between text-right font-semibold text-gray-600 text-sm hover:text-indigo-600 transition"
            >
              <span className="flex items-center gap-2">
                <Scale className="w-4 h-4" />
                {language === 'ar' ? 'لماذا نسأل هذا السؤال؟' : 'Why do we ask this?'}
              </span>
              <span className="text-lg text-gray-400">{showLogic ? '−' : '+'}</span>
            </button>

            {showLogic && (
              <div className="text-gray-500 text-xs sm:text-sm leading-relaxed border-t border-gray-200 pt-3 mt-3 animate-fade-in">
                {language === 'ar' ? currentQuestion.logicAr : currentQuestion.logicEn}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizingWizard;
