import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Fuel, TestTube, DollarSign, CreditCard, TrendingUp, Sparkles, Droplets, Zap, Wallet, TrendingDown, User, Clock, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NozzleReading {
  opening: string;
  closing: string;
}

interface ShiftData {
  salesman: string;
  shiftType: string;
  petrolNozzle1: NozzleReading;
  petrolNozzle2: NozzleReading;
  dieselNozzle1: NozzleReading;
  dieselNozzle2: NozzleReading;
  petrolTestLiters: string;
  dieselTestLiters: string;
  recoveries: string;
  credits: string;
  expenses: string;
  discounts: string;
  bankCash: string;
  digitalCash: string;
}

const initialData: ShiftData = {
  salesman: '',
  shiftType: '',
  petrolNozzle1: { opening: '', closing: '' },
  petrolNozzle2: { opening: '', closing: '' },
  dieselNozzle1: { opening: '', closing: '' },
  dieselNozzle2: { opening: '', closing: '' },
  petrolTestLiters: '',
  dieselTestLiters: '',
  recoveries: '',
  credits: '',
  expenses: '',
  discounts: '',
  bankCash: '',
  digitalCash: '',
};

const salesmen = [
  'Rajesh Kumar',
  'Amit Sharma',
  'Priya Patel',
  'Vijay Singh',
  'Sunita Verma',
  'Ravi Gupta',
  'Neha Reddy',
  'Sanjay Yadav',
];

const PETROL_PRICE = 95.50;
const DIESEL_PRICE = 89.75;

export function ShiftWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<ShiftData>(initialData);

  const steps = [
    { number: 0, title: 'Welcome', icon: Sparkles, gradient: 'from-indigo-500 to-purple-600' },
    { number: 1, title: 'Nozzle Readings', icon: Fuel, gradient: 'from-blue-500 to-cyan-500' },
    { number: 2, title: 'Test Liters', icon: TestTube, gradient: 'from-purple-500 to-pink-500' },
    { number: 3, title: 'Recoveries & Credits', icon: DollarSign, gradient: 'from-green-500 to-emerald-500' },
    { number: 4, title: 'Financial Details', icon: CreditCard, gradient: 'from-orange-500 to-red-500' },
    { number: 5, title: 'Summary', icon: TrendingUp, gradient: 'from-indigo-500 to-purple-600' },
  ];

  const updateNozzleReading = (type: keyof ShiftData, field: keyof NozzleReading, value: string) => {
    setData(prev => ({
      ...prev,
      [type]: {
        ...(prev[type] as NozzleReading),
        [field]: value,
      },
    }));
  };

  const updateField = (field: keyof ShiftData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const calculateSales = (opening: string, closing: string, testLiters: string = '0') => {
    const open = parseFloat(opening) || 0;
    const close = parseFloat(closing) || 0;
    const test = parseFloat(testLiters) || 0;
    return Math.max(0, close - open - test);
  };

  const getTotalPetrolSales = () => {
    const n1 = calculateSales(data.petrolNozzle1.opening, data.petrolNozzle1.closing, data.petrolTestLiters);
    const n2 = calculateSales(data.petrolNozzle2.opening, data.petrolNozzle2.closing, data.petrolTestLiters);
    return n1 + n2;
  };

  const getTotalDieselSales = () => {
    const n1 = calculateSales(data.dieselNozzle1.opening, data.dieselNozzle1.closing, data.dieselTestLiters);
    const n2 = calculateSales(data.dieselNozzle2.opening, data.dieselNozzle2.closing, data.dieselTestLiters);
    return n1 + n2;
  };

  const getTotalRevenue = () => {
    const petrolRevenue = getTotalPetrolSales() * PETROL_PRICE;
    const dieselRevenue = getTotalDieselSales() * DIESEL_PRICE;
    return petrolRevenue + dieselRevenue;
  };

  const getNetAmount = () => {
    const revenue = getTotalRevenue();
    const recoveries = parseFloat(data.recoveries) || 0;
    const credits = parseFloat(data.credits) || 0;
    const expenses = parseFloat(data.expenses) || 0;
    const discounts = parseFloat(data.discounts) || 0;
    return revenue + recoveries - credits - expenses - discounts;
  };

  const getTotalCashCollected = () => {
    const bankCash = parseFloat(data.bankCash) || 0;
    const digitalCash = parseFloat(data.digitalCash) || 0;
    return bankCash + digitalCash;
  };

  const getCashVariance = () => {
    return getTotalCashCollected() - getNetAmount();
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  const renderWelcome = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 p-12 shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        
        <div className="relative text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center mb-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="bg-white/20 backdrop-blur-md p-6 rounded-3xl"
            >
              <Sparkles className="w-16 h-16 text-white" />
            </motion.div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-5xl md:text-6xl font-extrabold text-white mb-4"
          >
            {getCurrentGreeting()}! 👋
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-2xl text-white/90 mb-2"
          >
            Welcome to Shift Starting Wizard
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-lg text-white/80 max-w-2xl mx-auto"
          >
            Let's make your shift documentation smooth and effortless. Get ready to track every detail with precision and style! ✨
          </motion.p>
        </div>
      </motion.div>

      {/* Selection Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl p-10"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl -ml-24 -mb-24"></div>
        
        <div className="relative">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-3xl font-bold text-gray-800 mb-8 text-center flex items-center justify-center gap-3"
          >
            <User className="w-8 h-8 text-purple-500" />
            Let's Get Started
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Salesman Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              whileHover={{ scale: 1.02 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <label className="text-xl font-semibold text-gray-800">Select Salesman</label>
                </div>
                
                <div className="relative">
                  <select
                    value={data.salesman}
                    onChange={(e) => updateField('salesman', e.target.value)}
                    className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-lg font-medium hover:border-blue-300 appearance-none cursor-pointer"
                  >
                    <option value="">Choose a salesman...</option>
                    {salesmen.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none rotate-90" />
                </div>
                
                {data.salesman && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-3 bg-blue-50 rounded-xl"
                  >
                    <p className="text-sm text-blue-700 font-medium flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Selected: {data.salesman}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Shift Type Selection */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
              whileHover={{ scale: 1.02 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-3 rounded-xl shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <label className="text-xl font-semibold text-gray-800">Shift Timing</label>
                </div>
                
                <div className="space-y-4">
                  {/* Morning Shift */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateField('shiftType', 'morning')}
                    className={`relative cursor-pointer p-5 rounded-xl border-2 transition-all duration-300 ${
                      data.shiftType === 'morning'
                        ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl transition-all ${
                        data.shiftType === 'morning'
                          ? 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg'
                          : 'bg-gray-100'
                      }`}>
                        <Sun className={`w-6 h-6 ${data.shiftType === 'morning' ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 text-lg">Morning Shift</div>
                        <div className="text-sm text-gray-600">6:00 AM - 2:00 PM</div>
                      </div>
                      {data.shiftType === 'morning' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-orange-500 rounded-full p-1"
                        >
                          <Check className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  {/* Night Shift */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateField('shiftType', 'night')}
                    className={`relative cursor-pointer p-5 rounded-xl border-2 transition-all duration-300 ${
                      data.shiftType === 'night'
                        ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl transition-all ${
                        data.shiftType === 'night'
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg'
                          : 'bg-gray-100'
                      }`}>
                        <Moon className={`w-6 h-6 ${data.shiftType === 'night' ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 text-lg">Night Shift</div>
                        <div className="text-sm text-gray-600">2:00 PM - 10:00 PM</div>
                      </div>
                      {data.shiftType === 'night' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-indigo-500 rounded-full p-1"
                        >
                          <Check className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Info Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-8 max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">What's Next?</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    After selecting your details, you'll proceed through 5 easy steps to complete your shift documentation:
                    <span className="font-medium"> Nozzle Readings → Test Liters → Recoveries & Credits → Financial Details → Summary</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderNozzleReadings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Petrol Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-400/20 via-cyan-400/20 to-blue-500/20 backdrop-blur-xl border border-white/30 shadow-2xl p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-400/30 to-blue-400/30 rounded-full blur-3xl -ml-24 -mb-24"></div>
        
        <div className="relative">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-75"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-2xl shadow-xl">
                <Fuel className="w-7 h-7 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                Petrol Nozzles
                <Droplets className="w-5 h-5 text-blue-500" />
              </h3>
              <p className="text-sm text-gray-600">Record opening and closing readings</p>
            </div>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((nozzleNum, idx) => (
              <motion.div
                key={nozzleNum}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group relative bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800 text-lg">Nozzle {nozzleNum}</h4>
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      #{nozzleNum}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Opening Reading (L)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={nozzleNum === 1 ? data.petrolNozzle1.opening : data.petrolNozzle2.opening}
                          onChange={(e) => updateNozzleReading(
                            nozzleNum === 1 ? 'petrolNozzle1' : 'petrolNozzle2',
                            'opening',
                            e.target.value
                          )}
                          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-300"
                          placeholder="0.00"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">L</div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Closing Reading (L)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={nozzleNum === 1 ? data.petrolNozzle1.closing : data.petrolNozzle2.closing}
                          onChange={(e) => updateNozzleReading(
                            nozzleNum === 1 ? 'petrolNozzle1' : 'petrolNozzle2',
                            'closing',
                            e.target.value
                          )}
                          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-300"
                          placeholder="0.00"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">L</div>
                      </div>
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="pt-4 mt-4 border-t-2 border-blue-200/50"
                    >
                      <div className="flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-3 rounded-xl">
                        <span className="text-sm text-gray-700 font-medium">Sales</span>
                        <span className="font-bold text-blue-600 text-lg flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          {calculateSales(
                            nozzleNum === 1 ? data.petrolNozzle1.opening : data.petrolNozzle2.opening,
                            nozzleNum === 1 ? data.petrolNozzle1.closing : data.petrolNozzle2.closing
                          ).toFixed(2)} L
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Diesel Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400/20 via-orange-400/20 to-amber-500/20 backdrop-blur-xl border border-white/30 shadow-2xl p-8"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-amber-400/30 to-orange-400/30 rounded-full blur-3xl -ml-32 -mt-32"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tr from-orange-400/30 to-amber-400/30 rounded-full blur-3xl -mr-24 -mb-24"></div>
        
        <div className="relative">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl blur-lg opacity-75"></div>
              <div className="relative bg-gradient-to-br from-amber-500 to-orange-500 p-4 rounded-2xl shadow-xl">
                <Fuel className="w-7 h-7 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                Diesel Nozzles
                <Droplets className="w-5 h-5 text-amber-500" />
              </h3>
              <p className="text-sm text-gray-600">Record opening and closing readings</p>
            </div>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((nozzleNum, idx) => (
              <motion.div
                key={nozzleNum}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group relative bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800 text-lg">Nozzle {nozzleNum}</h4>
                    <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      #{nozzleNum}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Opening Reading (L)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={nozzleNum === 1 ? data.dieselNozzle1.opening : data.dieselNozzle2.opening}
                          onChange={(e) => updateNozzleReading(
                            nozzleNum === 1 ? 'dieselNozzle1' : 'dieselNozzle2',
                            'opening',
                            e.target.value
                          )}
                          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 hover:border-amber-300"
                          placeholder="0.00"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">L</div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Closing Reading (L)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={nozzleNum === 1 ? data.dieselNozzle1.closing : data.dieselNozzle2.closing}
                          onChange={(e) => updateNozzleReading(
                            nozzleNum === 1 ? 'dieselNozzle1' : 'dieselNozzle2',
                            'closing',
                            e.target.value
                          )}
                          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 hover:border-amber-300"
                          placeholder="0.00"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">L</div>
                      </div>
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="pt-4 mt-4 border-t-2 border-amber-200/50"
                    >
                      <div className="flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-3 rounded-xl">
                        <span className="text-sm text-gray-700 font-medium">Sales</span>
                        <span className="font-bold text-amber-600 text-lg flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          {calculateSales(
                            nozzleNum === 1 ? data.dieselNozzle1.opening : data.dieselNozzle2.opening,
                            nozzleNum === 1 ? data.dieselNozzle1.closing : data.dieselNozzle2.closing
                          ).toFixed(2)} L
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderTestLiters = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-purple-500/20 backdrop-blur-xl border border-white/30 shadow-2xl p-10"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-400/20 to-purple-400/20 rounded-full blur-3xl -ml-32 -mb-32"></div>
        
        <div className="relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-75"
              ></motion.div>
              <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-5 rounded-2xl shadow-2xl">
                <TestTube className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                Test Liters
                <Sparkles className="w-6 h-6 text-purple-500" />
              </h3>
              <p className="text-gray-600 mt-1">Record fuel used for testing purposes</p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.03, y: -8 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl">
                    <Droplets className="w-6 h-6 text-white" />
                  </div>
                  <label className="text-lg font-semibold text-gray-800">Petrol Test Liters</label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={data.petrolTestLiters}
                    onChange={(e) => updateField('petrolTestLiters', e.target.value)}
                    className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-xl font-semibold hover:border-blue-300"
                    placeholder="0.00"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Liters</div>
                </div>
                <p className="text-xs text-gray-500 mt-3 ml-1">Liters used for petrol testing</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.03, y: -8 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-xl">
                    <Droplets className="w-6 h-6 text-white" />
                  </div>
                  <label className="text-lg font-semibold text-gray-800">Diesel Test Liters</label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={data.dieselTestLiters}
                    onChange={(e) => updateField('dieselTestLiters', e.target.value)}
                    className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:border-amber-500 transition-all duration-300 text-xl font-semibold hover:border-amber-300"
                    placeholder="0.00"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Liters</div>
                </div>
                <p className="text-xs text-gray-500 mt-3 ml-1">Liters used for diesel testing</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            className="mt-8 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-xl"
          >
            <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              Adjusted Sales Summary
            </h4>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-4 rounded-xl">
                <span className="text-sm text-gray-600 block mb-1">Adjusted Petrol Sales</span>
                <div className="font-bold text-blue-600 text-2xl">{getTotalPetrolSales().toFixed(2)} L</div>
              </div>
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-4 rounded-xl">
                <span className="text-sm text-gray-600 block mb-1">Adjusted Diesel Sales</span>
                <div className="font-bold text-amber-600 text-2xl">{getTotalDieselSales().toFixed(2)} L</div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderRecoveriesCredits = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-400/20 via-emerald-400/20 to-teal-500/20 backdrop-blur-xl border border-white/30 shadow-2xl p-10"
      >
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl -ml-48 -mt-48"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tr from-emerald-400/20 to-green-400/20 rounded-full blur-3xl -mr-32 -mb-32"></div>
        
        <div className="relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl blur-xl opacity-75"
              ></motion.div>
              <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 p-5 rounded-2xl shadow-2xl">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                Recoveries & Credits
                <Sparkles className="w-6 h-6 text-green-500" />
              </h3>
              <p className="text-gray-600 mt-1">Record additional income and credit sales</p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.03, y: -8 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <label className="text-lg font-semibold text-gray-800">Recoveries</label>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</div>
                  <input
                    type="number"
                    step="0.01"
                    value={data.recoveries}
                    onChange={(e) => updateField('recoveries', e.target.value)}
                    className="w-full pl-10 pr-6 py-4 bg-white/90 backdrop-blur-sm border-2 border-green-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/30 focus:border-green-500 transition-all duration-300 text-xl font-semibold hover:border-green-300"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3 ml-1">Previous dues recovered</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.03, y: -8 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-red-500 to-pink-500 p-3 rounded-xl">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                  <label className="text-lg font-semibold text-gray-800">Credits</label>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</div>
                  <input
                    type="number"
                    step="0.01"
                    value={data.credits}
                    onChange={(e) => updateField('credits', e.target.value)}
                    className="w-full pl-10 pr-6 py-4 bg-white/90 backdrop-blur-sm border-2 border-red-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-500/30 focus:border-red-500 transition-all duration-300 text-xl font-semibold hover:border-red-300"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3 ml-1">Sales made on credit</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderFinancialDetails = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-400/20 via-red-400/20 to-pink-500/20 backdrop-blur-xl border border-white/30 shadow-2xl p-10"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-red-400/20 to-pink-400/20 rounded-full blur-3xl -ml-32 -mb-32"></div>
        
        <div className="relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl blur-xl opacity-75"
              ></motion.div>
              <div className="relative bg-gradient-to-br from-orange-500 to-red-500 p-5 rounded-2xl shadow-2xl">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                Financial Details
                <Wallet className="w-6 h-6 text-orange-500" />
              </h3>
              <p className="text-gray-600 mt-1">Record expenses, discounts, and cash collected</p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: 'Expenses', field: 'expenses' as keyof ShiftData, icon: TrendingDown, gradient: 'from-red-500 to-pink-500', border: 'border-red-200', focus: 'focus:ring-red-500/30 focus:border-red-500', hover: 'hover:border-red-300' },
              { label: 'Discounts', field: 'discounts' as keyof ShiftData, icon: Sparkles, gradient: 'from-purple-500 to-pink-500', border: 'border-purple-200', focus: 'focus:ring-purple-500/30 focus:border-purple-500', hover: 'hover:border-purple-300' },
              { label: 'Bank Cash', field: 'bankCash' as keyof ShiftData, icon: DollarSign, gradient: 'from-green-500 to-emerald-500', border: 'border-green-200', focus: 'focus:ring-green-500/30 focus:border-green-500', hover: 'hover:border-green-300' },
              { label: 'Digital Cash', field: 'digitalCash' as keyof ShiftData, icon: Zap, gradient: 'from-blue-500 to-cyan-500', border: 'border-blue-200', focus: 'focus:ring-blue-500/30 focus:border-blue-500', hover: 'hover:border-blue-300' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.field}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  whileHover={{ scale: 1.03, y: -8 }}
                  className="relative group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300`}></div>
                  <div className="relative bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`bg-gradient-to-br ${item.gradient} p-3 rounded-xl`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <label className="text-lg font-semibold text-gray-800">{item.label}</label>
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</div>
                      <input
                        type="number"
                        step="0.01"
                        value={data[item.field]}
                        onChange={(e) => updateField(item.field, e.target.value)}
                        className={`w-full pl-10 pr-6 py-3 bg-white/90 backdrop-blur-sm border-2 ${item.border} rounded-xl focus:outline-none focus:ring-4 ${item.focus} transition-all duration-300 text-lg font-semibold ${item.hover}`}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderSummary = () => {
    const petrolSales = getTotalPetrolSales();
    const dieselSales = getTotalDieselSales();
    const totalRevenue = getTotalRevenue();
    const netAmount = getNetAmount();
    const totalCash = getTotalCashCollected();
    const variance = getCashVariance();

    const kpiCards = [
      { title: 'Petrol Sales', value: `${petrolSales.toFixed(2)} L`, subValue: `₹${(petrolSales * PETROL_PRICE).toFixed(2)}`, icon: Fuel, gradient: 'from-blue-500 to-cyan-500', bg: 'from-blue-400/20 to-cyan-400/20' },
      { title: 'Diesel Sales', value: `${dieselSales.toFixed(2)} L`, subValue: `₹${(dieselSales * DIESEL_PRICE).toFixed(2)}`, icon: Fuel, gradient: 'from-amber-500 to-orange-500', bg: 'from-amber-400/20 to-orange-400/20' },
      { title: 'Gross Revenue', value: `₹${totalRevenue.toFixed(2)}`, subValue: 'Total fuel sales', icon: TrendingUp, gradient: 'from-green-500 to-emerald-500', bg: 'from-green-400/20 to-emerald-400/20' },
      { title: 'Net Amount', value: `₹${netAmount.toFixed(2)}`, subValue: 'After adjustments', icon: DollarSign, gradient: 'from-purple-500 to-pink-500', bg: 'from-purple-400/20 to-pink-400/20' },
    ];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        {/* Shift Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-10 shadow-2xl"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-5">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <div className="bg-white/20 backdrop-blur-md p-5 rounded-2xl">
                    <TrendingUp className="w-10 h-10 text-white" />
                  </div>
                </motion.div>
                <div>
                  <h2 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                    Shift Summary
                    <Sparkles className="w-8 h-8" />
                  </h2>
                  <p className="text-indigo-100 text-lg">Complete overview of your shift performance</p>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-white" />
                <div>
                  <div className="text-indigo-200 text-sm">Salesman</div>
                  <div className="text-white font-semibold">{data.salesman || 'Not specified'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-white" />
                <div>
                  <div className="text-indigo-200 text-sm">Shift Type</div>
                  <div className="text-white font-semibold capitalize flex items-center gap-2">
                    {data.shiftType === 'morning' && <Sun className="w-4 h-4" />}
                    {data.shiftType === 'night' && <Moon className="w-4 h-4" />}
                    {data.shiftType || 'Not specified'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-white" />
                <div>
                  <div className="text-indigo-200 text-sm">Date</div>
                  <div className="text-white font-semibold">{new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1 + idx * 0.1, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>
                <div className={`relative bg-gradient-to-br ${card.bg} backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-sm font-medium text-gray-700">{card.title}</div>
                    <div className={`bg-gradient-to-br ${card.gradient} p-2 rounded-lg shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{card.value}</div>
                  <div className="text-xs text-gray-600">{card.subValue}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Detailed Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Fuel Sales */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl p-8 shadow-xl border border-white/50"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
            <h3 className="font-bold text-gray-900 text-xl mb-6 flex items-center gap-2">
              <Fuel className="w-6 h-6 text-blue-500" />
              Fuel Sales Breakdown
            </h3>
            <div className="relative space-y-4">
              {[
                { label: 'Petrol Sales (L)', value: petrolSales.toFixed(2), color: 'text-blue-600' },
                { label: 'Petrol Revenue', value: `₹${(petrolSales * PETROL_PRICE).toFixed(2)}`, color: 'text-blue-600' },
                { label: 'Diesel Sales (L)', value: dieselSales.toFixed(2), color: 'text-amber-600' },
                { label: 'Diesel Revenue', value: `₹${(dieselSales * DIESEL_PRICE).toFixed(2)}`, color: 'text-amber-600' },
              ].map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.05 }}
                  className="flex justify-between items-center pb-3 border-b border-gray-200 hover:bg-gray-50/50 px-3 py-2 rounded-lg transition-all"
                >
                  <span className="text-gray-600 font-medium">{item.label}</span>
                  <span className={`font-bold ${item.color}`}>{item.value}</span>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="flex justify-between items-center pt-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-4 py-3 rounded-xl mt-2"
              >
                <span className="text-gray-900 font-bold text-lg">Total Revenue</span>
                <span className="font-bold text-green-600 text-xl">₹{totalRevenue.toFixed(2)}</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Financial Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl p-8 shadow-xl border border-white/50"
          >
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
            <h3 className="font-bold text-gray-900 text-xl mb-6 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-purple-500" />
              Financial Summary
            </h3>
            <div className="relative space-y-4">
              {[
                { label: 'Gross Revenue', value: `+₹${totalRevenue.toFixed(2)}`, color: 'text-green-600' },
                { label: 'Recoveries', value: `+₹${(parseFloat(data.recoveries) || 0).toFixed(2)}`, color: 'text-green-600' },
                { label: 'Credits', value: `-₹${(parseFloat(data.credits) || 0).toFixed(2)}`, color: 'text-red-600' },
                { label: 'Expenses', value: `-₹${(parseFloat(data.expenses) || 0).toFixed(2)}`, color: 'text-red-600' },
                { label: 'Discounts', value: `-₹${(parseFloat(data.discounts) || 0).toFixed(2)}`, color: 'text-red-600' },
              ].map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.05 }}
                  className="flex justify-between items-center pb-3 border-b border-gray-200 hover:bg-gray-50/50 px-3 py-2 rounded-lg transition-all"
                >
                  <span className="text-gray-600 font-medium">{item.label}</span>
                  <span className={`font-bold ${item.color}`}>{item.value}</span>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="flex justify-between items-center pt-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-4 py-3 rounded-xl mt-2"
              >
                <span className="text-gray-900 font-bold text-lg">Net Amount</span>
                <span className="font-bold text-purple-600 text-xl">₹{netAmount.toFixed(2)}</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Cash Collection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl p-8 shadow-xl border border-white/50"
          >
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
            <h3 className="font-bold text-gray-900 text-xl mb-6 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-blue-500" />
              Cash Collection
            </h3>
            <div className="relative space-y-4">
              {[
                { label: 'Bank Cash', value: `₹${(parseFloat(data.bankCash) || 0).toFixed(2)}`, icon: DollarSign },
                { label: 'Digital Cash', value: `₹${(parseFloat(data.digitalCash) || 0).toFixed(2)}`, icon: Zap },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + idx * 0.05 }}
                    className="flex justify-between items-center pb-3 border-b border-gray-200 hover:bg-gray-50/50 px-3 py-2 rounded-lg transition-all"
                  >
                    <span className="text-gray-600 font-medium flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </span>
                    <span className="font-bold text-gray-900">{item.value}</span>
                  </motion.div>
                );
              })}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="flex justify-between items-center pt-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 px-4 py-3 rounded-xl mt-2"
              >
                <span className="text-gray-900 font-bold text-lg">Total Collected</span>
                <span className="font-bold text-blue-600 text-xl">₹{totalCash.toFixed(2)}</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Cash Variance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            className={`relative overflow-hidden rounded-2xl backdrop-blur-xl p-8 shadow-xl border border-white/50 ${
              variance >= 0 ? 'bg-gradient-to-br from-green-400/20 to-emerald-400/20' : 'bg-gradient-to-br from-red-400/20 to-pink-400/20'
            }`}
          >
            <div className={`absolute top-0 left-0 w-64 h-64 ${
              variance >= 0 ? 'bg-gradient-to-br from-green-400/20 to-emerald-400/20' : 'bg-gradient-to-br from-red-400/20 to-pink-400/20'
            } rounded-full blur-3xl -ml-32 -mt-32`}></div>
            <h3 className="relative font-bold text-gray-900 text-xl mb-6 flex items-center gap-2">
              <TrendingUp className={`w-6 h-6 ${variance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              Cash Variance
            </h3>
            <div className="relative space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-300 px-3 py-2">
                <span className="text-gray-600 font-medium">Expected Amount</span>
                <span className="font-bold text-gray-900">₹{netAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-300 px-3 py-2">
                <span className="text-gray-600 font-medium">Collected Amount</span>
                <span className="font-bold text-gray-900">₹{totalCash.toFixed(2)}</span>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.05 }}
                className={`flex justify-between items-center pt-4 px-4 py-4 rounded-xl mt-2 ${
                  variance >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}
              >
                <span className="text-gray-900 font-bold text-lg">Variance</span>
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`font-bold text-2xl ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {variance >= 0 ? '+' : ''}₹{variance.toFixed(2)}
                </motion.span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className={`text-center text-sm font-medium mt-3 px-4 py-2 rounded-lg ${
                  variance >= 0 ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'
                }`}
              >
                {variance >= 0 ? '✓ Cash surplus detected' : '⚠ Cash shortage detected'}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const canProceed = currentStep === 0 ? (data.salesman && data.shiftType) : true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"
        ></motion.div>
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-3xl"
        ></motion.div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="relative overflow-hidden bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 border border-white/50"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative">
            <motion.h1
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 flex items-center gap-3"
            >
              <Sparkles className="w-10 h-10 text-purple-500" />
              Fuel Station Shift Wizard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 text-lg"
            >
              Complete your shift documentation with style ✨
            </motion.p>
          </div>
        </motion.div>

        {/* Progress Steps */}
        {currentStep > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 border border-white/50"
          >
            <div className="flex items-center justify-between">
              {steps.filter(s => s.number > 0).map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                
                return (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                        transition={isActive ? { duration: 1.5, repeat: Infinity } : {}}
                        className="relative"
                      >
                        {isActive && (
                          <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-full blur-xl`}
                          ></motion.div>
                        )}
                        <div
                          className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                            isActive
                              ? `bg-gradient-to-br ${step.gradient} text-white shadow-2xl`
                              : isCompleted
                              ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-xl'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          <AnimatePresence mode="wait">
                            {isCompleted ? (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0 }}
                              >
                                <Check className="w-8 h-8" />
                              </motion.div>
                            ) : (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              >
                                <Icon className="w-8 h-8" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="text-center mt-3"
                      >
                        <div
                          className={`text-sm font-semibold transition-colors duration-300 ${
                            isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                          }`}
                        >
                          {step.title}
                        </div>
                      </motion.div>
                    </div>
                    {index < steps.filter(s => s.number > 0).length - 1 && (
                      <div className="relative flex-1 mx-4 mb-12">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: isCompleted ? '100%' : '0%' }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className={`h-full bg-gradient-to-r ${step.gradient} rounded-full`}
                          ></motion.div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Content */}
        <div className="mb-8">
          <AnimatePresence mode="wait">
            {currentStep === 0 && <div key="step0">{renderWelcome()}</div>}
            {currentStep === 1 && <div key="step1">{renderNozzleReadings()}</div>}
            {currentStep === 2 && <div key="step2">{renderTestLiters()}</div>}
            {currentStep === 3 && <div key="step3">{renderRecoveriesCredits()}</div>}
            {currentStep === 4 && <div key="step4">{renderFinancialDetails()}</div>}
            {currentStep === 5 && <div key="step5">{renderSummary()}</div>}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
              currentStep === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white/80 backdrop-blur-md text-gray-700 hover:bg-white shadow-xl hover:shadow-2xl border border-white/50'
            }`}
          >
            <ChevronLeft className={`w-6 h-6 transition-transform ${currentStep !== 0 && 'group-hover:-translate-x-1'}`} />
            Previous
          </motion.button>

          {currentStep < 5 ? (
            <motion.button
              whileHover={canProceed ? { scale: 1.05, x: 5 } : {}}
              whileTap={canProceed ? { scale: 0.95 } : {}}
              onClick={nextStep}
              disabled={!canProceed}
              className={`relative group flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold overflow-hidden shadow-2xl ${
                !canProceed ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600"
                initial={{ x: '100%' }}
                whileHover={canProceed ? { x: 0 } : {}}
                transition={{ duration: 0.3 }}
              ></motion.div>
              <span className="relative z-10 text-white">Next</span>
              <ChevronRight className="relative z-10 w-6 h-6 text-white transition-transform group-hover:translate-x-1" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                alert('🎉 Shift data has been recorded successfully!');
              }}
              className="relative group flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600"></div>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600"
                initial={{ x: '100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              ></motion.div>
              <Check className="relative z-10 w-6 h-6" />
              <span className="relative z-10">Complete Shift</span>
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
