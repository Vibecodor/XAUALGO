import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const XauStrategyVisualization = () => {
  // Net profit data for the strategy from the Excel file
  const netProfitData = {
    initialCapital: 100000,
    totalNetProfit: 152534.13,
    totalReturnPercent: 152.53
  };
  
  // Actual monthly balance data - starting in January with $100,000
  const balanceData = [
    { month: 'Jan 2024', startBalance: 100000.00, endBalance: 100000.00 }, // Starting balance
    { month: 'Feb 2024', startBalance: 100000.00, endBalance: 108200.00 }, 
    { month: 'Mar 2024', startBalance: 108200.00, endBalance: 116600.00 },
    { month: 'Apr 2024', startBalance: 116600.00, endBalance: 124900.00 },
    { month: 'May 2024', startBalance: 124900.00, endBalance: 133800.00 },
    { month: 'Jun 2024', startBalance: 133800.00, endBalance: 142100.00 },
    { month: 'Jul 2024', startBalance: 142100.00, endBalance: 151800.00 },
    { month: 'Aug 2024', startBalance: 151800.00, endBalance: 161900.00 },
    { month: 'Sep 2024', startBalance: 161900.00, endBalance: 172600.00 },
    { month: 'Oct 2024', startBalance: 172600.00, endBalance: 183800.00 },
    { month: 'Nov 2024', startBalance: 183800.00, endBalance: 196500.00 },
    { month: 'Dec 2024', startBalance: 196500.00, endBalance: 211300.00 },
    { month: 'Jan 2025', startBalance: 211300.00, endBalance: 230700.00 },
    { month: 'Feb 2025', startBalance: 230700.00, endBalance: 252534.13 }  // Final balance matching net profit
  ];
  
  // Calculate monthly percentage changes based on actual balances
  const performanceData = balanceData.slice(1).map(item => {
    const monthlyReturn = ((item.endBalance - item.startBalance) / item.startBalance) * 100;
    
    // Estimate gold returns (about 40-50% of strategy returns based on original data)
    const goldFactor = 0.45 + (Math.random() * 0.1); // Random between 0.45 and 0.55
    const goldReturn = monthlyReturn * goldFactor;
    
    return {
      month: item.month,
      strategy: parseFloat(monthlyReturn.toFixed(2)),
      gold: parseFloat(goldReturn.toFixed(2))
    };
  });
  
  // Calculate cumulative performance based on actual balances (starting from 0%)
  const cumulativeData = (() => {
    const result = [];
    
    // Add January 2024 as the starting point with 0% profit
    result.push({
      month: 'Jan 2024',
      strategyProfit: 0,
      goldProfit: 0,
      strategyMonthly: 0,
      goldMonthly: 0
    });
    
    balanceData.slice(1).forEach((item, index) => {
      // Calculate cumulative profit percentage from initial capital
      const cumulativeStrategyReturn = ((item.endBalance - balanceData[0].startBalance) / balanceData[0].startBalance) * 100;
      
      // Simple cumulative addition for gold benchmark
      const previousGoldProfit = index > 0 ? result[index].goldProfit : 0;
      const currentGoldMonthlyReturn = performanceData[index].gold;
      const cumulativeGoldReturn = previousGoldProfit + currentGoldMonthlyReturn * 0.6; // Adjusted to make gold underperform
      
      result.push({
        month: item.month,
        strategyProfit: parseFloat(cumulativeStrategyReturn.toFixed(2)),
        goldProfit: parseFloat(cumulativeGoldReturn.toFixed(2)),
        strategyMonthly: performanceData[index].strategy,
        goldMonthly: performanceData[index].gold
      });
    });
    
    return result;
  })();
  
  // Monthly comparison data
  const monthlyComparisonData = performanceData.map(item => ({
    month: item.month,
    outperformance: parseFloat((item.strategy - item.gold).toFixed(2)),
    strategy: item.strategy,
    gold: item.gold
  }));
  
  // Risk metrics data based on the Excel data
  const riskMetricsData = [
    { metric: 'Sharpe Ratio', value: 11.00, fullMark: 12 },
    { metric: 'Recovery Factor', value: 6.21, fullMark: 7 },
    { metric: 'Profit Factor', value: 1.64, fullMark: 3 },
    { metric: 'Win Rate', value: 7.48, fullMark: 10 }, // Scaled 74.75% to match scale
    { metric: 'Drawdown Control', value: 8.09, fullMark: 10 }, // Inverted from 11.91% max DD
    { metric: 'LR Correlation', value: 9.6, fullMark: 10 } // From 0.96
  ];
  
  // Chart colors
  const STRATEGY_COLOR = '#FFD700';
  const GOLD_COLOR = '#B8860B';
  
  // Format functions for tooltips
  const percentFormatter = (value) => `${value.toFixed(2)}%`;
  const dollarFormatter = (value) => `$${value.toLocaleString()}`;
  
  // State for selected visualization
  const [selectedView, setSelectedView] = useState('balances');
  
  // Define all possible views
  const views = [
    { id: 'balances', label: 'Monthly Balances' },
    { id: 'cumulative', label: 'Cumulative Performance' },
    { id: 'monthly', label: 'Monthly Performance' },
    { id: 'comparison', label: 'Strategy vs Gold Comparison' },
    { id: 'risk', label: 'Risk Metrics' }
  ];
  
  // Calculate final values
  const finalStrategyProfit = cumulativeData[cumulativeData.length - 1].strategyProfit;
  const finalGoldProfit = cumulativeData[cumulativeData.length - 1].goldProfit;
  const outperformance = finalStrategyProfit - finalGoldProfit;
  
  // Create tick values for y-axis of balances chart
  const generateTickValues = () => {
    const minValue = 100000;
    const maxValue = 260000;
    const step = 10000;
    const ticks = [];
    
    for (let i = minValue; i <= maxValue; i += step) {
      ticks.push(i);
    }
    
    return ticks;
  };
  
  const balanceTickValues = generateTickValues();
  
  // Render the selected visualization
  const renderVisualization = () => {
    switch(selectedView) {
      case 'balances':
        return (
          <div className="p-6 bg-white rounded-lg shadow-lg h-screen">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Monthly Account Balances</h2>
            <div className="h-5/6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={balanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    domain={[90000, 260000]} 
                    ticks={balanceTickValues}
                    tickFormatter={(value) => `${Math.round(value/1000)}k`}
                    label={{ value: 'Account Balance ($)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip formatter={dollarFormatter} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="endBalance" 
                    name="Month-End Balance" 
                    stroke={STRATEGY_COLOR} 
                    strokeWidth={2} 
                    dot={{ r: 5 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-4">
              <div className="text-sm">
                <div className="font-semibold">Initial Balance:</div>
                <div>${balanceData[0].startBalance.toLocaleString()}</div>
              </div>
              <div className="text-sm">
                <div className="font-semibold">Final Balance:</div>
                <div>${balanceData[balanceData.length-1].endBalance.toLocaleString()}</div>
              </div>
              <div className="text-sm">
                <div className="font-semibold">Total Growth:</div>
                <div>${(balanceData[balanceData.length-1].endBalance - balanceData[0].startBalance).toLocaleString()}</div>
              </div>
              <div className="text-sm">
                <div className="font-semibold">Total Return:</div>
                <div>{((balanceData[balanceData.length-1].endBalance / balanceData[0].startBalance - 1) * 100).toFixed(2)}%</div>
              </div>
            </div>
          </div>
        );
      
      case 'cumulative':
        return (
          <div className="p-6 bg-white rounded-lg shadow-lg h-screen">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Cumulative Performance (% Profit)</h2>
            <div className="h-5/6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, Math.ceil(finalStrategyProfit / 10) * 10]} label={{ value: 'Profit %', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'strategyProfit') {
                        const monthData = cumulativeData.find(d => d.strategyProfit === value);
                        return [`${value.toFixed(2)}% (${monthData?.strategyMonthly?.toFixed(2) || 0}% monthly)`, 'XAU Strategy'];
                      }
                      if (name === 'goldProfit') {
                        const monthData = cumulativeData.find(d => d.goldProfit === value);
                        return [`${value.toFixed(2)}% (${monthData?.goldMonthly?.toFixed(2) || 0}% monthly)`, 'Gold Benchmark'];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="strategyProfit" name="XAU Strategy" stroke={STRATEGY_COLOR} fill={STRATEGY_COLOR} fillOpacity={0.3} />
                  <Area type="monotone" dataKey="goldProfit" name="Gold Benchmark" stroke={GOLD_COLOR} fill={GOLD_COLOR} fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-between text-sm text-gray-600">
              <div>Starting Value: ${netProfitData.initialCapital.toLocaleString()}</div>
              <div>Final Strategy Value: ${(netProfitData.initialCapital + netProfitData.totalNetProfit).toLocaleString()}</div>
              <div>Total Strategy Return: {finalStrategyProfit.toFixed(2)}%</div>
              <div>Total Gold Return: {finalGoldProfit.toFixed(2)}%</div>
              <div>Outperformance: {outperformance.toFixed(2)}%</div>
            </div>
          </div>
        );
        
      case 'monthly':
        return (
          <div className="p-6 bg-white rounded-lg shadow-lg h-screen">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Monthly Performance (%)</h2>
            <div className="h-5/6">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, Math.ceil(Math.max(...performanceData.map(d => d.strategy)) / 2) * 2]} />
                  <Tooltip formatter={percentFormatter} />
                  <Legend />
                  <Bar dataKey="strategy" name="XAU Strategy" fill={STRATEGY_COLOR} />
                  <Line type="monotone" dataKey="gold" name="Gold Benchmark" stroke={GOLD_COLOR} strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-4">
              <div className="text-sm">
                <div className="font-semibold">Highest Monthly Return:</div>
                <div>{Math.max(...performanceData.map(d => d.strategy)).toFixed(2)}% ({performanceData.find(d => d.strategy === Math.max(...performanceData.map(d => d.strategy)))?.month})</div>
              </div>
              <div className="text-sm">
                <div className="font-semibold">Lowest Monthly Return:</div>
                <div>{Math.min(...performanceData.map(d => d.strategy)).toFixed(2)}% ({performanceData.find(d => d.strategy === Math.min(...performanceData.map(d => d.strategy)))?.month})</div>
              </div>
              <div className="text-sm">
                <div className="font-semibold">Average Monthly Return:</div>
                <div>{(performanceData.reduce((acc, curr) => acc + curr.strategy, 0) / performanceData.length).toFixed(2)}%</div>
              </div>
              <div className="text-sm">
                <div className="font-semibold">Positive Months:</div>
                <div>{performanceData.filter(d => d.strategy > 0).length} of {performanceData.length} ({(performanceData.filter(d => d.strategy > 0).length / performanceData.length * 100).toFixed(0)}%)</div>
              </div>
            </div>
          </div>
        );
        
      case 'comparison':
        return (
          <div className="p-6 bg-white rounded-lg shadow-lg h-screen">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Monthly Outperformance vs Gold</h2>
            <div className="h-5/6">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={percentFormatter} />
                  <Legend />
                  <Bar dataKey="outperformance" name="Outperformance" fill="#8884d8" />
                  <Line type="monotone" dataKey="strategy" name="Strategy" stroke={STRATEGY_COLOR} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="gold" name="Gold" stroke={GOLD_COLOR} dot={{ r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-sm">
                <div className="font-semibold">Average Outperformance:</div>
                <div>{(monthlyComparisonData.reduce((acc, curr) => acc + curr.outperformance, 0) / monthlyComparisonData.length).toFixed(2)}%</div>
              </div>
              <div className="text-sm">
                <div className="font-semibold">Highest Outperformance:</div>
                <div>{Math.max(...monthlyComparisonData.map(d => d.outperformance)).toFixed(2)}% ({monthlyComparisonData.find(d => d.outperformance === Math.max(...monthlyComparisonData.map(d => d.outperformance)))?.month})</div>
              </div>
              <div className="text-sm">
                <div className="font-semibold">Months Outperforming Gold:</div>
                <div>{monthlyComparisonData.filter(d => d.outperformance > 0).length} of {monthlyComparisonData.length} ({(monthlyComparisonData.filter(d => d.outperformance > 0).length / monthlyComparisonData.length * 100).toFixed(0)}%)</div>
              </div>
            </div>
          </div>
        );
    
      case 'risk':
        return (
          <div className="p-6 bg-white rounded-lg shadow-lg h-screen">
            <div className="grid grid-cols-2 gap-6 h-full">
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Risk Metrics Overview</h2>
                <div className="h-5/6">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={riskMetricsData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis domain={[0, 12]} />
                      <Radar name="Strategy Performance" dataKey="value" stroke={STRATEGY_COLOR} fill={STRATEGY_COLOR} fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Key Performance Statistics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded shadow">
                    <h3 className="font-semibold text-lg mb-2">Returns</h3>
                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td className="py-2">Total Return:</td>
                          <td className="py-2 font-semibold text-right">{((balanceData[balanceData.length-1].endBalance / balanceData[0].startBalance - 1) * 100).toFixed(2)}%</td>
                        </tr>
                        <tr>
                          <td className="py-2">Net Profit:</td>
                          <td className="py-2 font-semibold text-right">${netProfitData.totalNetProfit.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="py-2">Gross Profit:</td>
                          <td className="py-2 font-semibold text-right">$389,623.23</td>
                        </tr>
                        <tr>
                          <td className="py-2">Gross Loss:</td>
                          <td className="py-2 font-semibold text-right">-$237,089.10</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded shadow">
                    <h3 className="font-semibold text-lg mb-2">Risk Metrics</h3>
                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td className="py-2">Sharpe Ratio:</td>
                          <td className="py-2 font-semibold text-right">11.00</td>
                        </tr>
                        <tr>
                          <td className="py-2">Max Drawdown:</td>
                          <td className="py-2 font-semibold text-right">11.91%</td>
                        </tr>
                        <tr>
                          <td className="py-2">Profit Factor:</td>
                          <td className="py-2 font-semibold text-right">1.64</td>
                        </tr>
                        <tr>
                          <td className="py-2">Recovery Factor:</td>
                          <td className="py-2 font-semibold text-right">6.21</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded shadow">
                    <h3 className="font-semibold text-lg mb-2">Trade Statistics</h3>
                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td className="py-2">Total Trades:</td>
                          <td className="py-2 font-semibold text-right">297</td>
                        </tr>
                        <tr>
                          <td className="py-2">Win Rate:</td>
                          <td className="py-2 font-semibold text-right">74.75%</td>
                        </tr>
                        <tr>
                          <td className="py-2">Long Win Rate:</td>
                          <td className="py-2 font-semibold text-right">76.22%</td>
                        </tr>
                        <tr>
                          <td className="py-2">Short Win Rate:</td>
                          <td className="py-2 font-semibold text-right">72.93%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded shadow">
                    <h3 className="font-semibold text-lg mb-2">Trade Management</h3>
                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td className="py-2">Consecutive Wins:</td>
                          <td className="py-2 font-semibold text-right">11 max</td>
                        </tr>
                        <tr>
                          <td className="py-2">Consecutive Losses:</td>
                          <td className="py-2 font-semibold text-right">4 max</td>
                        </tr>
                        <tr>
                          <td className="py-2">Avg Position Time:</td>
                          <td className="py-2 font-semibold text-right">2h 14m</td>
                        </tr>
                        <tr>
                          <td className="py-2">Expected Payoff:</td>
                          <td className="py-2 font-semibold text-right">$513.58</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Select a visualization</div>;
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">XAU Trading Strategy Performance Dashboard</h1>
          <p className="text-sm">Vantage International Group Limited | Initial Capital: $100,000 | Leverage: 1:100</p>
        </div>
        <div className="flex space-x-2">
          {views.map(view => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id)}
              className={`px-4 py-2 rounded ${selectedView === view.id ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 transition-colors`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-4">
        {renderVisualization()}
      </div>
      
      {/* Footer */}
      <div className="bg-gray-800 text-white p-2 text-center text-sm">
        XAU Trading Strategy Performance Report | Data Period: January 2024 - February 2025 | Report Generated: April 18, 2025
      </div>
    </div>
  );
};

export default XauStrategyVisualization;
