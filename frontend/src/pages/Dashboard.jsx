import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { Wallet, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = ({ user, onLogout, onUpdateUser }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [topPerformers, setTopPerformers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [stats, setStats] = useState({
    totalValue: 0,
    totalProfit: 0,
    profitPercentage: 0,
    totalInvested: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPortfolio();
    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPortfolio, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPortfolio = async () => {
    try {
      const portfolioResponse = await axios.get("/portfolio");
      const portfolioData = portfolioResponse.data;
      setPortfolio(portfolioData);

      if (portfolioData.length > 0) {
        // Fetch current prices for all cryptos
        const pricesResponse = await axios.get(`/cryptos`);
        
        const pricesMap = {};
        pricesResponse.data.forEach(crypto => {
          pricesMap[crypto.id] = crypto.current_price;
        });
        setCryptoPrices(pricesMap);

        // Calculate stats
        let totalValue = 0;
        let totalInvested = 0;
        const holdingsWithPerformance = [];

        portfolioData.forEach(item => {
          const currentPrice = pricesMap[item.crypto_id] || 0;
          const itemValue = item.quantity * currentPrice;
          totalValue += itemValue;
          totalInvested += item.total_invested;
          
          const profit = itemValue - item.total_invested;
          const profitPercentage = item.total_invested > 0 ? (profit / item.total_invested) * 100 : 0;
          
          holdingsWithPerformance.push({
            ...item,
            current_price: currentPrice,
            current_value: itemValue,
            profit,
            profitPercentage
          });
        });

        const totalProfit = totalValue - totalInvested;
        const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

        setStats({
          totalValue,
          totalProfit,
          profitPercentage,
          totalInvested
        });

        // Get top performers and losers
        const sorted = [...holdingsWithPerformance].sort((a, b) => b.profitPercentage - a.profitPercentage);
        setTopPerformers(sorted.slice(0, 3));
        setTopLosers(sorted.slice(-3).reverse());
      } else {
        setStats({
          totalValue: 0,
          totalProfit: 0,
          profitPercentage: 0,
          totalInvested: 0
        });
        setTopPerformers([]);
        setTopLosers([]);
      }
    } catch (error) {
      console.error("Failed to fetch portfolio", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-8" data-testid="dashboard">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-slate-600">Welcome back, {user.name}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500" data-testid="balance-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Available Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800" data-testid="balance-amount">
                ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800" data-testid="portfolio-value">
                ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className={`border-l-4 ${stats.totalProfit >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                {stats.totalProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                Total Profit/Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="total-profit">
                {stats.totalProfit >= 0 ? '+' : ''}
                ${stats.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className={`border-l-4 ${stats.profitPercentage >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Return Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.profitPercentage >= 0 ? '+' : ''}
                {stats.profitPercentage.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Holdings */}
        <Card>
          <CardHeader>
            <CardTitle>Your Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-600">Loading portfolio...</div>
            ) : portfolio.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="text-slate-600">You don't have any crypto holdings yet.</div>
                <button
                  onClick={() => navigate("/market")}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  data-testid="go-to-market-button"
                >
                  Explore Market →
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="portfolio-table">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-semibold text-slate-700 text-sm">Asset</th>
                      <th className="pb-3 font-semibold text-slate-700 text-right text-sm hidden sm:table-cell">Quantity</th>
                      <th className="pb-3 font-semibold text-slate-700 text-right text-sm hidden md:table-cell">Avg Buy Price</th>
                      <th className="pb-3 font-semibold text-slate-700 text-right text-sm">Current Price</th>
                      <th className="pb-3 font-semibold text-slate-700 text-right text-sm hidden lg:table-cell">Total Invested</th>
                      <th className="pb-3 font-semibold text-slate-700 text-right text-sm hidden md:table-cell">Current Value</th>
                      <th className="pb-3 font-semibold text-slate-700 text-right text-sm">Profit/Loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((item) => {
                      const currentPrice = cryptoPrices[item.crypto_id] || 0;
                      const totalValue = item.quantity * currentPrice;
                      const profit = totalValue - item.total_invested;
                      const profitPercentage = item.total_invested > 0 ? (profit / item.total_invested) * 100 : 0;

                      return (
                        <tr
                          key={item.crypto_id}
                          className="border-b hover:bg-slate-50 cursor-pointer"
                          onClick={() => navigate(`/crypto/${item.crypto_id}`)}
                        >
                          <td className="py-3 sm:py-4">
                            <div className="font-medium text-slate-800 text-sm sm:text-base">{item.crypto_name}</div>
                            <div className="text-xs sm:text-sm text-slate-600">{item.crypto_symbol}</div>
                          </td>
                          <td className="py-3 sm:py-4 text-right text-sm hidden sm:table-cell">{item.quantity.toFixed(4)}</td>
                          <td className="py-3 sm:py-4 text-right text-sm hidden md:table-cell">${item.average_buy_price.toFixed(2)}</td>
                          <td className="py-3 sm:py-4 text-right text-sm sm:text-base">${currentPrice.toFixed(2)}</td>
                          <td className="py-3 sm:py-4 text-right text-sm hidden lg:table-cell">${item.total_invested.toFixed(2)}</td>
                          <td className="py-3 sm:py-4 text-right font-medium text-sm hidden md:table-cell">${totalValue.toFixed(2)}</td>
                          <td className={`py-3 sm:py-4 text-right font-medium text-sm ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                            <div className="text-xs">
                              ({profit >= 0 ? '+' : ''}{profitPercentage.toFixed(2)}%)
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performers and Losers */}
        {portfolio.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="w-5 h-5" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topPerformers.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {topPerformers.map((item) => (
                      <div
                        key={item.crypto_id}
                        className="flex items-center justify-between p-2.5 sm:p-3 bg-green-50 rounded-lg hover:bg-green-100 cursor-pointer transition-colors"
                        onClick={() => navigate(`/crypto/${item.crypto_id}`)}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-800 text-sm sm:text-base truncate">{item.crypto_name}</div>
                          <div className="text-xs sm:text-sm text-slate-600">{item.crypto_symbol}</div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="font-bold text-green-600 text-sm sm:text-base">
                            +{item.profitPercentage.toFixed(2)}%
                          </div>
                          <div className="text-xs sm:text-sm text-slate-600">
                            +${item.profit.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-600">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Losers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <TrendingDown className="w-5 h-5" />
                  Biggest Declines
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topLosers.length > 0 && topLosers[0].profitPercentage < 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {topLosers.filter(item => item.profitPercentage < 0).map((item) => (
                      <div
                        key={item.crypto_id}
                        className="flex items-center justify-between p-2.5 sm:p-3 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer transition-colors"
                        onClick={() => navigate(`/crypto/${item.crypto_id}`)}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-800 text-sm sm:text-base truncate">{item.crypto_name}</div>
                          <div className="text-xs sm:text-sm text-slate-600">{item.crypto_symbol}</div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="font-bold text-red-600 text-sm sm:text-base">
                            {item.profitPercentage.toFixed(2)}%
                          </div>
                          <div className="text-xs sm:text-sm text-slate-600">
                            ${item.profit.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-600">
                    All holdings are profitable!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;