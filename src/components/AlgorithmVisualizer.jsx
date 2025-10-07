import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Search, Palette } from 'lucide-react';

export default function AlgorithmVisualizer() {
  const algorithms = {
    'Minimum Size Subarray Sum': {
      code: `function minSubArrayLen(target, nums) {
  let minLen = Infinity;
  let sum = 0;
  let left = 0;
  
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];
    while (sum >= target) {
      minLen = Math.min(minLen, right - left + 1);
      sum -= nums[left];
      left++;
    }
  }
  return minLen === Infinity ? 0 : minLen;
}`,
      inputs: { target: '7', nums: '[2,3,1,2,4,3]' },
      category: 'Sliding Window'
    },
    'Longest Substring Without Repeating': {
      code: `function lengthOfLongestSubstring(s) {
  const seen = new Set();
  let left = 0, maxLen = 0;
  
  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) {
      seen.delete(s[left]);
      left++;
    }
    seen.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
      inputs: { s: '"abcabcbb"' },
      category: 'Sliding Window'
    },
    'Longest Repeating Character Replacement': {
      code: `function characterReplacement(s, k) {
  const freqMap = new Array(26).fill(0);
  let left = 0;
  let maxLen = 0;
  let maxCount = 0;
  
  for (let right = 0; right < s.length; right++) {
    const idx = s.charCodeAt(right) - 65;
    freqMap[idx]++;
    maxCount = Math.max(maxCount, freqMap[idx]);
    
    while (right - left - maxCount + 1 > k) {
      freqMap[s.charCodeAt(left) - 65]--;
      left++;
    }
    
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
      inputs: { s: '"AABABBA"', k: '1' },
      category: 'Sliding Window'
    },
    'Two Sum': {
      code: `function twoSum(nums, target) {
  const map = {};
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map[complement] !== undefined) {
      return [map[complement], i];
    }
    map[nums[i]] = i;
  }
  return [];
}`,
      inputs: { nums: '[2,7,11,15]', target: '9' },
      category: 'Hash Table'
    },
    'Binary Search': {
      code: `function search(nums, target) {
  let left = 0, right = nums.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    else if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
      inputs: { nums: '[1,3,5,7,9,11,13,15]', target: '9' },
      category: 'Binary Search'
    },
    'Bubble Sort': {
      code: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`,
      inputs: { arr: '[64,34,25,12,22,11,90]' },
      category: 'Sorting'
    },
    'Two Sum II': {
      code: `function twoSum(numbers, target) {
  let left = 0, right = numbers.length - 1;
  
  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) return [left + 1, right + 1];
    else if (sum < target) left++;
    else right--;
  }
  return [];
}`,
      inputs: { numbers: '[2,7,11,15]', target: '9' },
      category: 'Two Pointers'
    },
    'Maximum Subarray': {
      code: `function maxSubArray(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}`,
      inputs: { nums: '[-2,1,-3,4,-1,2,1,-5,4]' },
      category: 'Dynamic Programming'
    }
  };

  const [selectedAlgo, setSelectedAlgo] = useState('Minimum Size Subarray Sum');
  const [code, setCode] = useState(algorithms['Minimum Size Subarray Sum'].code);
  const [inputs, setInputs] = useState(algorithms['Minimum Size Subarray Sum'].inputs);
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [execution, setExecution] = useState(null);
  const [colorScheme, setColorScheme] = useState('pastel');
  const [searchTerm, setSearchTerm] = useState('');

  const colors = {
    pastel: {
      bg: 'from-purple-100 to-pink-100',
      window: 'bg-indigo-300',
      current: 'bg-pink-300',
      found: 'bg-green-300',
      comparing: 'bg-yellow-200',
      disabled: 'bg-gray-200',
      button: 'bg-purple-400 hover:bg-purple-500',
      accent: 'bg-purple-50'
    },
    ocean: {
      bg: 'from-cyan-100 to-blue-100',
      window: 'bg-blue-300',
      current: 'bg-teal-300',
      found: 'bg-emerald-300',
      comparing: 'bg-sky-200',
      disabled: 'bg-slate-200',
      button: 'bg-cyan-400 hover:bg-cyan-500',
      accent: 'bg-cyan-50'
    },
    sunset: {
      bg: 'from-orange-100 to-rose-100',
      window: 'bg-rose-300',
      current: 'bg-amber-300',
      found: 'bg-lime-300',
      comparing: 'bg-yellow-200',
      disabled: 'bg-gray-200',
      button: 'bg-orange-400 hover:bg-orange-500',
      accent: 'bg-orange-50'
    }
  }[colorScheme];

  const parseInput = (value) => {
    try {
      return JSON.parse(value);
    } catch {
      return value.replace(/"/g, '');
    }
  };

  const loadAlgorithm = (name) => {
    setSelectedAlgo(name);
    setCode(algorithms[name].code);
    setInputs(algorithms[name].inputs);
    setStep(0);
    setIsPlaying(false);
  };

  const runExecution = () => {
    const parsedInputs = {};
    Object.keys(inputs).forEach(key => {
      parsedInputs[key] = parseInput(inputs[key]);
    });

    const funcMatch = code.match(/function\s+(\w+)/);
    if (!funcMatch) return;
    
    const funcName = funcMatch[1];
    let result = null;

    if (funcName === 'minSubArrayLen') {
      result = simulateMinSubarray(parsedInputs.nums, parsedInputs.target);
    } else if (funcName === 'lengthOfLongestSubstring') {
      result = simulateLongestSubstring(parsedInputs.s);
    } else if (funcName === 'characterReplacement') {
      result = simulateCharacterReplacement(parsedInputs.s, parsedInputs.k);
    } else if (funcName === 'twoSum') {
      if (parsedInputs.numbers) {
        result = simulateTwoSumII(parsedInputs.numbers, parsedInputs.target);
      } else {
        result = simulateTwoSum(parsedInputs.nums, parsedInputs.target);
      }
    } else if (funcName === 'search') {
      result = simulateBinarySearch(parsedInputs.nums, parsedInputs.target);
    } else if (funcName === 'bubbleSort') {
      result = simulateBubbleSort(parsedInputs.arr);
    } else if (funcName === 'maxSubArray') {
      result = simulateMaxSubarray(parsedInputs.nums);
    }

    if (result) {
      setExecution(result);
      setStep(0);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    runExecution();
  }, [selectedAlgo]);

  useEffect(() => {
    if (isPlaying && execution && step < execution.length - 1) {
      const timer = setTimeout(() => setStep(step + 1), speed);
      return () => clearTimeout(timer);
    } else if (execution && step >= execution.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, step, execution, speed]);

  // Simulation functions
  const simulateMinSubarray = (nums, target) => {
    const steps = [];
    let minLen = Infinity;
    let sum = 0;
    let left = 0;

    steps.push({
      left: 0, right: -1, sum: 0, minLen: 'Inf',
      arrays: { nums: nums.map((v, i) => ({ value: v, index: i })) },
      message: `Find min subarray with sum >= ${target}`
    });

    for (let right = 0; right < nums.length; right++) {
      sum += nums[right];

      while (sum >= target) {
        minLen = Math.min(minLen, right - left + 1);
        steps.push({
          left, right, sum, minLen, target,
          arrays: { nums: nums.map((v, i) => ({ value: v, index: i, inWindow: i >= left && i <= right })) },
          message: `Valid window [${left},${right}], length=${minLen}`
        });
        sum -= nums[left];
        left++;
      }
    }

    steps.push({
      left, right: nums.length - 1, minLen,
      arrays: { nums: nums.map((v, i) => ({ value: v, index: i, done: true })) },
      message: `Result: ${minLen === Infinity ? 0 : minLen}`,
      found: true
    });
    return steps;
  };

  const simulateLongestSubstring = (s) => {
    const steps = [];
    const seen = new Set();
    let left = 0;
    let maxLen = 0;

    for (let right = 0; right < s.length; right++) {
      while (seen.has(s[right])) {
        seen.delete(s[left]);
        left++;
      }
      seen.add(s[right]);
      maxLen = Math.max(maxLen, right - left + 1);
      
      steps.push({
        left, right, maxLen,
        arrays: { s: s.split('').map((c, i) => ({ value: c, index: i, inWindow: i >= left && i <= right, current: i === right })) },
        message: `Window: "${s.slice(left, right + 1)}", max=${maxLen}`
      });
    }

    steps.push({
      left, right: s.length - 1, maxLen,
      arrays: { s: s.split('').map((c, i) => ({ value: c, index: i, done: true })) },
      message: `Result: ${maxLen}`,
      found: true
    });
    return steps;
  };

  const simulateCharacterReplacement = (s, k) => {
    const steps = [];
    const freqMap = new Array(26).fill(0);
    let left = 0;
    let maxLen = 0;
    let maxCount = 0;

    steps.push({
      left: 0, right: -1, maxLen: 0, maxCount: 0, k,
      arrays: { s: s.split('').map((c, i) => ({ value: c, index: i })) },
      message: `Find longest substring with at most ${k} replacements`
    });

    for (let right = 0; right < s.length; right++) {
      const idx = s.charCodeAt(right) - 65;
      freqMap[idx]++;
      maxCount = Math.max(maxCount, freqMap[idx]);

      while (right - left - maxCount + 1 > k) {
        freqMap[s.charCodeAt(left) - 65]--;
        left++;
      }

      const currentLen = right - left + 1;
      maxLen = Math.max(maxLen, currentLen);

      steps.push({
        left, right, maxLen, maxCount, k,
        replacements: currentLen - maxCount,
        arrays: { s: s.split('').map((c, i) => ({ 
          value: c, 
          index: i, 
          inWindow: i >= left && i <= right, 
          current: i === right
        })) },
        message: `Window="${s.slice(left, right + 1)}", freq=${maxCount}, replace=${currentLen - maxCount}, max=${maxLen}`
      });
    }

    steps.push({
      left, right: s.length - 1, maxLen,
      arrays: { s: s.split('').map((c, i) => ({ value: c, index: i, done: true })) },
      message: `Result: ${maxLen}`,
      found: true
    });
    return steps;
  };

  const simulateTwoSum = (nums, target) => {
    const steps = [];
    const map = {};

    for (let i = 0; i < nums.length; i++) {
      const complement = target - nums[i];

      if (map[complement] !== undefined) {
        steps.push({
          i, target,
          arrays: { nums: nums.map((v, idx) => ({ value: v, index: idx, found: idx === i || idx === map[complement] })) },
          message: `Found! [${map[complement]}, ${i}]`,
          found: true
        });
        return steps;
      }

      map[nums[i]] = i;
      steps.push({
        i, target,
        arrays: { nums: nums.map((v, idx) => ({ value: v, index: idx, current: idx === i })) },
        message: `Check nums[${i}]=${nums[i]}, need ${complement}`
      });
    }

    return steps;
  };

  const simulateTwoSumII = (numbers, target) => {
    const steps = [];
    let left = 0;
    let right = numbers.length - 1;

    while (left < right) {
      const sum = numbers[left] + numbers[right];

      steps.push({
        left, right, sum, target,
        arrays: { numbers: numbers.map((v, i) => ({ value: v, index: i, comparing: i === left || i === right, found: sum === target && (i === left || i === right) })) },
        message: sum === target ? `Found! [${left + 1}, ${right + 1}]` : `Sum=${sum}`
      });

      if (sum === target) {
        steps[steps.length - 1].found = true;
        return steps;
      } else if (sum < target) {
        left++;
      } else {
        right--;
      }
    }

    return steps;
  };

  const simulateBinarySearch = (nums, target) => {
    const steps = [];
    let left = 0;
    let right = nums.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      steps.push({
        left, right, mid, target,
        arrays: { nums: nums.map((v, i) => ({ value: v, index: i, inRange: i >= left && i <= right, mid: i === mid, disabled: i < left || i > right })) },
        message: `Check mid[${mid}]=${nums[mid]}`
      });

      if (nums[mid] === target) {
        steps.push({
          left, right, mid, target,
          arrays: { nums: nums.map((v, i) => ({ value: v, index: i, found: i === mid })) },
          message: `Found at index ${mid}!`,
          found: true
        });
        return steps;
      } else if (nums[mid] < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    steps.push({
      left, right, target,
      arrays: { nums: nums.map((v, i) => ({ value: v, index: i, done: true })) },
      message: 'Not found'
    });
    return steps;
  };

  const simulateBubbleSort = (arr) => {
    const steps = [];
    arr = [...arr];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        steps.push({
          i, j,
          arrays: { arr: arr.map((v, idx) => ({ value: v, index: idx, comparing: idx === j || idx === j + 1, sorted: idx >= n - i })) },
          message: `Compare ${arr[j]} and ${arr[j + 1]}`
        });

        if (arr[j] > arr[j + 1]) {
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;

          steps.push({
            i, j,
            arrays: { arr: arr.map((v, idx) => ({ value: v, index: idx, swapped: idx === j || idx === j + 1, sorted: idx >= n - i })) },
            message: 'Swapped!'
          });
        }
      }
    }

    steps.push({
      arrays: { arr: arr.map((v, i) => ({ value: v, index: i, sorted: true })) },
      message: 'Sorted!',
      found: true
    });
    return steps;
  };

  const simulateMaxSubarray = (nums) => {
    const steps = [];
    let maxSum = nums[0];
    let currentSum = nums[0];

    steps.push({
      i: 0, maxSum, currentSum,
      arrays: { nums: nums.map((v, i) => ({ value: v, index: i, current: i === 0 })) },
      message: `Start: maxSum=${maxSum}`
    });

    for (let i = 1; i < nums.length; i++) {
      currentSum = Math.max(nums[i], currentSum + nums[i]);
      maxSum = Math.max(maxSum, currentSum);

      steps.push({
        i, maxSum, currentSum,
        arrays: { nums: nums.map((v, idx) => ({ value: v, index: idx, current: idx === i })) },
        message: `i=${i}, currentSum=${currentSum}, maxSum=${maxSum}`
      });
    }

    steps.push({
      maxSum,
      arrays: { nums: nums.map((v, i) => ({ value: v, index: i, done: true })) },
      message: `Result: ${maxSum}`,
      found: true
    });
    return steps;
  };

  const currentState = execution?.[step] || { arrays: {}, message: '' };

  const getColor = (item) => {
    if (item.found) return colors.found;
    if (item.newMax) return colors.found;
    if (item.mostFrequent) return 'bg-purple-300';
    if (item.current) return colors.current;
    if (item.inWindow || item.inRange) return colors.window;
    if (item.comparing || item.swapped) return colors.comparing;
    if (item.sorted || item.done) return colors.found;
    if (item.mid) return colors.current;
    if (item.disabled) return colors.disabled;
    return 'bg-gray-100';
  };

  const filteredAlgos = Object.entries(algorithms).filter(([name]) => 
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.bg} p-6`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">✨ Algorithm Visualizer</h1>
        </div>

        {/* Theme & Search */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Palette size={20} />
              <span className="font-semibold">Theme:</span>
              {['pastel', 'ocean', 'sunset'].map(scheme => (
                <button
                  key={scheme}
                  onClick={() => setColorScheme(scheme)}
                  className={`px-3 py-1 rounded-lg capitalize text-sm ${colorScheme === scheme ? colors.button + ' text-white' : 'bg-gray-200'}`}
                >
                  {scheme}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filteredAlgos.map(([name]) => (
              <button
                key={name}
                onClick={() => loadAlgorithm(name)}
                className={`px-3 py-2 rounded-lg text-sm ${selectedAlgo === name ? colors.button + ' text-white' : 'bg-gray-100'}`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Inputs</h3>
              {Object.keys(inputs).map(key => (
                <div key={key} className="mb-3">
                  <label className="block text-sm mb-1">{key}:</label>
                  <input
                    type="text"
                    value={inputs[key]}
                    onChange={(e) => setInputs({ ...inputs, [key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                  />
                </div>
              ))}
              <button
                onClick={runExecution}
                className={`w-full ${colors.button} text-white py-2 rounded-lg font-medium mt-2`}
              >
                Run Algorithm
              </button>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Controls</h3>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex-1 ${colors.button} text-white py-2 rounded-lg flex items-center justify-center gap-2`}
                  disabled={!execution || step >= execution.length - 1}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  onClick={() => setStep(Math.min(step + 1, execution?.length - 1 || 0))}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                  disabled={!execution || step >= execution.length - 1}
                >
                  <SkipForward size={18} />
                  Step
                </button>
                <button
                  onClick={() => { setStep(0); setIsPlaying(false); }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                  disabled={!execution}
                >
                  <RotateCcw size={18} />
                  Reset
                </button>
              </div>

              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg mb-3"
              >
                <option value={2000}>Slow (2s)</option>
                <option value={1000}>Normal (1s)</option>
                <option value={500}>Fast (0.5s)</option>
                <option value={250}>Very Fast (0.25s)</option>
              </select>

              {execution && (
                <div className={`p-3 ${colors.accent} rounded-lg`}>
                  <div className="text-sm mb-2">Progress</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colors.button}`}
                        style={{ width: `${((step + 1) / execution.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono">{step + 1}/{execution.length}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visualization */}
        {execution && (
          <>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className={`text-center py-4 ${colors.accent} rounded-lg font-medium text-lg mb-4`}>
                {currentState.message}
              </div>

              {Object.entries(currentState.arrays).map(([name, arr]) => (
                <div key={name} className="mb-6">
                  <div className="text-sm font-semibold mb-3">{name}</div>
                  <div className="flex gap-2 flex-wrap">
                    {arr.map((item, idx) => (
                      <div key={idx} className="text-center">
                        <div className={`w-14 h-14 flex items-center justify-center font-mono font-bold text-lg rounded-lg shadow-md ${getColor(item)}`}>
                          {item.value}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">[{item.index}]</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="mt-6">
                <div className="text-sm font-semibold mb-3">Variables</div>
                <div className="grid grid-cols-4 gap-3">
                  {Object.entries(currentState)
                    .filter(([key]) => !['arrays', 'message', 'found'].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="bg-purple-50 p-3 rounded-lg border-2 border-purple-200">
                        <div className="text-xs text-gray-600 mb-1">{key}</div>
                        <div className="font-mono font-bold text-purple-600">{String(value)}</div>
                      </div>
                    ))}
                </div>
              </div>

              {currentState.found && (
                <div className="mt-6 p-4 bg-green-300 rounded-lg text-center font-bold text-lg">
                  ✓ Complete!
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold mb-3">Code</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                {code}
              </pre>
            </div>
          </>
        )}

        {/* Legend */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h3 className="font-semibold mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 ${colors.current} rounded shadow`}></div>
              <span className="text-sm">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 ${colors.window} rounded shadow`}></div>
              <span className="text-sm">Window/Range</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 ${colors.found} rounded shadow`}></div>
              <span className="text-sm">Found/Sorted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 ${colors.comparing} rounded shadow`}></div>
              <span className="text-sm">Comparing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 ${colors.disabled} rounded shadow`}></div>
              <span className="text-sm">Disabled</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>Currently visualizing: <strong>{selectedAlgo}</strong></p>
          <p className="mt-1">Category: <strong>{algorithms[selectedAlgo]?.category}</strong></p>
        </div>
      </div>
    </div>
  );
}
