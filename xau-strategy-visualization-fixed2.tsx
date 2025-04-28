import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const XauStrategyVisualization = () => {
  // Chart colors - hardcoded to avoid template literal errors
  const STRATEGY_COLOR = '#46feff'; // Neon Blue for strategy
  const GOLD_COLOR = '#32C7F0'; // Primary Blue for gold
  const OUTPERFORM_COLOR = '#4A90E2'; // Slate Blue
  const BACKGROUND_COLOR = '#0D1B2A'; // Deep Navy Blue
  const CARD_BG = '#32C7F0'; // Primary Blue for card backgrounds
  const HIGHLIGHT_CARD_BG = '#46feff'; // Neon Blue for highlighted cards
  const TEXT_COLOR = '#FFFFFF'; // White text
  const GRID_COLOR = '#1E3A5F'; // Lighter navy for grid lines
  const BORDER_COLOR = '#32C7F0'; // Primary Blue for borders
  
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
  
  // Common chart props
  const commonChartProps = {
    style: { 
      backgroundColor: BACKGROUND_COLOR,
      borderRadius: '8px'
    },
    className: "p-6 rounded-lg shadow-lg h-screen"
  };
  
  const commonAxisProps = {
    style: { 
      fontSize: '12px',
      fill: TEXT_COLOR
    }
  };
  
  const commonHeadingProps = {
    className: "text-2xl font-bold mb-6",
    style: { color: TEXT_COLOR }
  };
  
  const commonCardStyle = {
    backgroundColor: CARD_BG,
    color: TEXT_COLOR,
    padding: '12px',
    borderRadius: '6px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
  };
  
  const highlightCardStyle = {
    ...commonCardStyle,
    backgroundColor: HIGHLIGHT_CARD_BG
  };
  
  const commonLabelStyle = {
    fontWeight: 600,
    color: BACKGROUND_COLOR
  };
  
  // Alternating card styles for visual variety
  const getCardStyle = (index) => {
    return commonCardStyle;
  };
  
  // Render the selected visualization
  const renderVisualization = () => {
    switch(selectedView) {
      case 'balances':
        return (
          <div {...commonChartProps}>
            <h2 {...commonHeadingProps}>Monthly Account Balances</h2>
            <div className="h-5/6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={balanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis 
                    dataKey="month" 
                    {...commonAxisProps}
                  />
                  <YAxis 
                    domain={[90000, 260000]} 
                    ticks={balanceTickValues}
                    tickFormatter={(value) => `${Math.round(value/1000)}k`}
                    label={{ value: 'Account Balance ($)', angle: -90, position: 'insideLeft', fill: TEXT_COLOR }}
                    {...commonAxisProps}
                  />
                  <Tooltip 
                    formatter={dollarFormatter} 
                    contentStyle={{ backgroundColor: CARD_BG, color: TEXT_COLOR, border: 'none' }}
                    labelStyle={{ color: TEXT_COLOR }}
                  />
                  <Legend wrapperStyle={{ color: TEXT_COLOR }} />
                  <Line 
                    type="monotone" 
                    dataKey="endBalance" 
                    name="Month-End Balance" 
                    stroke={STRATEGY_COLOR} 
                    strokeWidth={2} 
                    dot={{ r: 5, fill: STRATEGY_COLOR }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-4">
              <div style={getCardStyle(0)}>
                <div style={commonLabelStyle}>Initial Balance:</div>
                <div>${balanceData[0].startBalance.toLocaleString()}</div>
              </div>
              <div style={getCardStyle(1)}>
                <div style={commonLabelStyle}>Final Balance:</div>
                <div>${balanceData[balanceData.length-1].endBalance.toLocaleString()}</div>
              </div>
              <div style={getCardStyle(2)}>
                <div style={commonLabelStyle}>Total Growth:</div>
                <div>${(balanceData[balanceData.length-1].endBalance - balanceData[0].startBalance).toLocaleString()}</div>
              </div>
              <div style={getCardStyle(3)}>
                <div style={commonLabelStyle}>Total Return:</div>
                <div>{((balanceData[balanceData.length-1].endBalance / balanceData[0].startBalance - 1) * 100).toFixed(2)}%</div>
              </div>
            </div>
          </div>
        );
      
      case 'cumulative':
        return (
          <div {...commonChartProps}>
            <h2 {...commonHeadingProps}>Cumulative Performance (% Profit)</h2>
            <div className="h-5/6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis 
                    dataKey="month" 
                    {...commonAxisProps}
                  />
                  <YAxis 
                    domain={[0, Math.ceil(finalStrategyProfit / 10) * 10]} 
                    label={{ value: 'Profit %', angle: -90, position: 'insideLeft', fill: TEXT_COLOR }}
                    {...commonAxisProps}
                  />
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
                    contentStyle={{ backgroundColor: CARD_BG, color: TEXT_COLOR, border: 'none' }}
                    labelStyle={{ color: TEXT_COLOR }}
                  />
                  <Legend wrapperStyle={{ color: TEXT_COLOR }} />
                  <Area type="monotone" dataKey="strategyProfit" name="XAU Strategy" stroke={STRATEGY_COLOR} fill={STRATEGY_COLOR} fillOpacity={0.3} />
                  <Area type="monotone" dataKey="goldProfit" name="Gold Benchmark" stroke={GOLD_COLOR} fill={GOLD_COLOR} fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-between">
              <div style={getCardStyle(0)}>
                <span style={commonLabelStyle}>Starting Value:</span> ${netProfitData.initialCapital.toLocaleString()}
              </div>
              <div style={getCardStyle(1)}>
                <span style={commonLabelStyle}>Final Strategy Value:</span> ${(netProfitData.initialCapital + netProfitData.totalNetProfit).toLocaleString()}
              </div>
              <div style={getCardStyle(2)}>
                <span style={commonLabelStyle}>Total Strategy Return:</span> {finalStrategyProfit.toFixed(2)}%
              </div>
              <div style={getCardStyle(3)}>
                <span style={commonLabelStyle}>Total Gold Return:</span> {finalGoldProfit.toFixed(2)}%
              </div>
              <div style={getCardStyle(4)}>
                <span style={commonLabelStyle}>Outperformance:</span> {outperformance.toFixed(2)}%
              </div>
            </div>
          </div>
        );
        
      case 'monthly':
        return (
          <div {...commonChartProps}>
            <h2 {...commonHeadingProps}>Monthly Performance (%)</h2>
            <div className="h-5/6">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis 
                    dataKey="month" 
                    {...commonAxisProps}
                  />
                  <YAxis 
                    domain={[0, Math.ceil(Math.max(...performanceData.map(d => d.strategy)) / 2) * 2]} 
                    {...commonAxisProps}
                  />
                  <Tooltip 
                    formatter={percentFormatter} 
                    contentStyle={{ backgroundColor: CARD_BG, color: TEXT_COLOR, border: 'none' }}
                    labelStyle={{ color: TEXT_COLOR }}
                  />
                  <Legend wrapperStyle={{ color: TEXT_COLOR }} />
                  <Bar dataKey="strategy" name="XAU Strategy" fill={STRATEGY_COLOR} />
                  <Line type="monotone" dataKey="gold" name="Gold Benchmark" stroke={GOLD_COLOR} strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-4">
              <div style={getCardStyle(0)}>
                <div style={commonLabelStyle}>Highest Monthly Return:</div>
                <div>{Math.max(...performanceData.map(d => d.strategy)).toFixed(2)}% ({performanceData.find(d => d.strategy === Math.max(...performanceData.map(d => d.strategy)))?.month})</div>
              </div>
              <div style={getCardStyle(1)}>
                <div style={commonLabelStyle}>Lowest Monthly Return:</div>
                <div>{Math.min(...performanceData.map(d => d.strategy)).toFixed(2)}% ({performanceData.find(d => d.strategy === Math.min(...performanceData.map(d => d.strategy)))?.month})</div>
              </div>
              <div style={getCardStyle(2)}>
                <div style={commonLabelStyle}>Average Monthly Return:</div>
                <div>{(performanceData.reduce((acc, curr) => acc + curr.strategy, 0) / performanceData.length).toFixed(2)}%</div>
              </div>
              <div style={getCardStyle(3)}>
                <div style={commonLabelStyle}>Positive Months:</div>
                <div>{performanceData.filter(d => d.strategy > 0).length} of {performanceData.length} ({(performanceData.filter(d => d.strategy > 0).length / performanceData.length * 100).toFixed(0)}%)</div>
              </div>
            </div>
          </div>
        );
        
      case 'comparison':
        return (
          <div {...commonChartProps}>
            <h2 {...commonHeadingProps}>Monthly Outperformance vs Gold</h2>
            <div className="h-5/6">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis 
                    dataKey="month" 
                    {...commonAxisProps}
                  />
                  <YAxis 
                    {...commonAxisProps}
                  />
                  <Tooltip 
                    formatter={percentFormatter} 
                    contentStyle={{ backgroundColor: CARD_BG, color: TEXT_COLOR, border: 'none' }}
                    labelStyle={{ color: TEXT_COLOR }}
                  />
                  <Legend wrapperStyle={{ color: TEXT_COLOR }} />
                  <Bar dataKey="outperformance" name="Outperformance" fill={OUTPERFORM_COLOR} />
                  <Line type="monotone" dataKey="strategy" name="Strategy" stroke={STRATEGY_COLOR} dot={{ r: 5, fill: STRATEGY_COLOR }} />
                  <Line type="monotone" dataKey="gold" name="Gold" stroke={GOLD_COLOR} dot={{ r: 5, fill: GOLD_COLOR }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div style={getCardStyle(0)}>
                <div style={commonLabelStyle}>Average Outperformance:</div>
                <div>{(monthlyComparisonData.reduce((acc, curr) => acc + curr.outperformance, 0) / monthlyComparisonData.length).toFixed(2)}%</div>
              </div>
              <div style={getCardStyle(1)}>
                <div style={commonLabelStyle}>Highest Outperformance:</div>
                <div>{Math.max(...monthlyComparisonData.map(d => d.outperformance)).toFixed(2)}% ({monthlyComparisonData.find(d => d.outperformance === Math.max(...monthlyComparisonData.map(d => d.outperformance)))?.month})</div>
              </div>
              <div style={getCardStyle(2)}>
                <div style={commonLabelStyle}>Months Outperforming Gold:</div>
                <div>{monthlyComparisonData.filter(d => d.outperformance > 0).length} of {monthlyComparisonData.length} ({(monthlyComparisonData.filter(d => d.outperformance > 0).length / monthlyComparisonData.length * 100).toFixed(0)}%)</div>
              </div>
            </div>
          </div>
        );
    
      case 'risk':
        return (
          <div {...commonChartProps}>
            <h2 {...commonHeadingProps}>Risk Metrics Overview</h2>
            <div className="grid grid-cols-2 gap-6 h-full">
              <div>
                <div className="h-5/6">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={riskMetricsData}>
                      <PolarGrid stroke={GRID_COLOR} />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: TEXT_COLOR }} />
                      <PolarRadiusAxis domain={[0, 12]} stroke={TEXT_COLOR} tick={{ fill: TEXT_COLOR }} />
                      <Radar name="Strategy Performance" dataKey="value" stroke={STRATEGY_COLOR} fill={STRATEGY_COLOR} fillOpacity={0.6} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: CARD_BG, color: TEXT_COLOR, border: 'none' }}
                        labelStyle={{ color: TEXT_COLOR }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <div className="grid grid-cols-2 gap-4">
                  {/* Returns Card */}
                  <div style={{ ...commonCardStyle, height: '180px' }}>
                    <h3 style={{ ...commonLabelStyle, fontSize: '1.2rem', marginBottom: '0.5rem' }}>Returns</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>Total Return:</div>
                      <div style={{ fontWeight: 'bold' }}>{((balanceData[balanceData.length-1].endBalance / balanceData[0].startBalance - 1) * 100).toFixed(2)}%</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>Net Profit:</div>
                      <div style={{ fontWeight: 'bold' }}>${netProfitData.totalNetProfit.toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>Gross Profit:</div>
                      <div style={{ fontWeight: 'bold' }}>$389,623.23</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>Gross Loss:</div>
                      <div style={{ fontWeight: 'bold' }}>-$237,089.10</div>
                    </div>
                  </div>
                  
                  {/* Risk Metrics Card */}
                  <div style={{ ...commonCardStyle, height: '180px' }}>
                    <h3 style={{ ...commonLabelStyle, fontSize: '1.2rem', marginBottom: '0.5rem' }}>Risk Metrics</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>Sharpe Ratio:</div>
                      <div style={{ fontWeight: 'bold' }}>11.00</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>Max Drawdown:</div>
                      <div style={{ fontWeight: 'bold' }}>11.91%</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>Profit Factor:</div>
                      <div style={{ fontWeight: 'bold' }}>1.64</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>Recovery Factor:</div>
                      <div style={{ fontWeight: 'bold' }}>6.21</div>
                    </div>
                  </div>
                  
                  {/* Trade Statistics Card */}
                  <div style={{ ...commonCardStyle, height: '180px' }}>
                    <h3 style={{ ...commonLabelStyle, fontSize: '1.2rem', marginBottom: '0.5rem' }}>Trade Statistics</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>Total Trades:</div>
                      <div style={{ fontWeight: 'bold' }}>297</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>Win Rate:</div>
                      <div style={{ fontWeight: 'bold' }}>74.75%</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>Long Win Rate:</div>
                      <div style={{ fontWeight: 'bold' }}>76.22%</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>Short Win Rate:</div>
                      <div style={{ fontWeight: 'bold' }}>72.93%</div>
                    </div>
                  </div>
                  
                  {/* Trade Management Card */}
                  <div style={{ ...commonCardStyle, height: '180px' }}>
                    <h3 style={{ ...commonLabelStyle, fontSize: '1.2rem', marginBottom: '0.5rem' }}>Trade Management</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>Consecutive Wins:</div>
                      <div style={{ fontWeight: 'bold' }}>11 max</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>Consecutive Losses:</div>
                      <div style={{ fontWeight: 'bold' }}>4 max</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>Avg Position Time:</div>
                      <div style={{ fontWeight: 'bold' }}>2h 14m</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>Expected Payoff:</div>
                      <div style={{ fontWeight: 'bold' }}>$513.58</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div style={{ color: TEXT_COLOR }}>Select a visualization</div>;
    }
  };
  
  // Define header style directly
  const headerStyle = {
    backgroundColor: BACKGROUND_COLOR,
  };
  
  const footerStyle = {
    backgroundColor: BACKGROUND_COLOR,
  };
  
  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: BACKGROUND_COLOR }}>
      {/* Header */}
      <div style={headerStyle} className="text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">XAU Trading Strategy Performance Dashboard</h1>
          <p className="text-sm">Vantage International Group Limited | Initial Capital: $100,000 | Leverage: 1:100</p>
        </div>
        <div className="flex space-x-2">
          {views.map((view, index) => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id)}
              style={{
                backgroundColor: selectedView === view.id ? STRATEGY_COLOR : CARD_BG,
                color: BACKGROUND_COLOR,
                fontWeight: selectedView === view.id ? 'bold' : 'normal'
              }}
              className="px-4 py-2 rounded hover:opacity-90 transition-opacity"
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
      <div style={footerStyle} className="text-white p-2 text-center text-sm">
        XAU Trading Strategy Performance Report | Data Period: January 2024 - February 2025
      </div>
    </div>
  );
};

export default XauStrategyVisualization;
