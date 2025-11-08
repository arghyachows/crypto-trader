import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TransactionDialog from "@/components/TransactionDialog";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Wallet, TrendingUp, TrendingDown, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

const Portfolio = ({ user, onLogout, onUpdateUser }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [sellQuantity, setSellQuantity] = useState("");
  const [processing, setProcessing] = useState(false);
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
        // Fetch current prices
        const pricesResponse = await axios.get(`/cryptos`);
        
        const pricesMap = {};
        pricesResponse.data.forEach(crypto => {
          pricesMap[crypto.id] = crypto.current_price;
        });
        setCryptoPrices(pricesMap);
      }
    } catch (error) {
      console.error("Failed to fetch portfolio", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSellClick = (item) => {
    const currentPrice = cryptoPrices[item.crypto_id] || 0;
    setSelectedCrypto({
      ...item,
      current_price: currentPrice,
      id: item.crypto_id,
      name: item.crypto_name,
      symbol: item.crypto_symbol
    });
    setSellQuantity("");
    setSellDialogOpen(true);
  };

  const handleSell = async () => {
    const quantity = parseFloat(sellQuantity);
    if (!quantity || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (quantity > selectedCrypto.quantity) {
      toast.error("Insufficient crypto balance");
      return;
    }

    setProcessing(true);
    try {
      const response = await axios.post("/portfolio/sell", {
        crypto_id: selectedCrypto.crypto_id,
        crypto_symbol: selectedCrypto.crypto_symbol,
        crypto_name: selectedCrypto.crypto_name,
        quantity: quantity,
        price_per_unit: selectedCrypto.current_price
      });

      toast.success("Sale successful!");
      onUpdateUser({ ...user, balance: response.data.new_balance });
      setSellDialogOpen(false);
      setSellQuantity("");
      fetchPortfolio();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Sale failed");
    } finally {
      setProcessing(false);
    }
  };

  const totalInvested = portfolio.reduce((sum, item) => sum + item.total_invested, 0);
  const totalValue = portfolio.reduce((sum, item) => {
    const currentPrice = cryptoPrices[item.crypto_id] || 0;
    return sum + (item.quantity * currentPrice);
  }, 0);
  const totalProfit = totalValue - totalInvested;
  const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-8" data-testid="portfolio-page">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Portfolio</h1>
          <p className="text-slate-600">Track your crypto investments</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Invested</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                ${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Current Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800" data-testid="portfolio-current-value">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className={`border-l-4 ${totalProfit >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Profit/Loss</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
              </div>
              <div className="text-sm text-slate-600 mt-1">
                {totalProfit >= 0 ? '+' : ''}{profitPercentage.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Holdings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-slate-600">Loading portfolio...</div>
            ) : portfolio.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <Wallet className="w-16 h-16 text-slate-300 mx-auto" />
                <div className="text-slate-600">You don't have any crypto holdings yet.</div>
                <button
                  onClick={() => navigate("/market")}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  data-testid="go-to-market-link"
                >
                  Explore Market →
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="portfolio-holdings-table">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-semibold text-slate-700">Asset</th>
                      <th className="pb-3 font-semibold text-slate-700 text-right">Quantity</th>
                      <th className="pb-3 font-semibold text-slate-700 text-right">Avg Buy Price</th>
                      <th className="pb-3 font-semibold text-slate-700 text-right">Current Price</th>
                      <th className="pb-3 font-semibold text-slate-700 text-right">Total Invested</th>
                      <th className="pb-3 font-semibold text-slate-700 text-right">Current Value</th>
                      <th className="pb-3 font-semibold text-slate-700 text-right">Profit/Loss</th>
                      <th className="pb-3 font-semibold text-slate-700 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((item) => {
                      const currentPrice = cryptoPrices[item.crypto_id] || 0;
                      const currentValue = item.quantity * currentPrice;
                      const profit = currentValue - item.total_invested;
                      const profitPercentage = (profit / item.total_invested) * 100;

                      return (
                        <tr
                          key={item.crypto_id}
                          className="border-b hover:bg-slate-50"
                          data-testid={`portfolio-row-${item.crypto_id}`}
                        >
                          <td className="py-4 cursor-pointer" onClick={() => navigate(`/crypto/${item.crypto_id}`)}>
                            <div className="font-medium text-slate-800">{item.crypto_name}</div>
                            <div className="text-sm text-slate-600">{item.crypto_symbol}</div>
                          </td>
                          <td className="py-4 text-right">{item.quantity.toFixed(4)}</td>
                          <td className="py-4 text-right">${item.average_buy_price.toFixed(2)}</td>
                          <td className="py-4 text-right">${currentPrice.toFixed(2)}</td>
                          <td className="py-4 text-right">${item.total_invested.toFixed(2)}</td>
                          <td className="py-4 text-right font-medium">${currentValue.toFixed(2)}</td>
                          <td className={`py-4 text-right font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <div className="flex items-center justify-end gap-1">
                              {profit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                            </div>
                            <div className="text-xs">
                              ({profit >= 0 ? '+' : ''}{profitPercentage.toFixed(2)}%)
                            </div>
                          </td>
                          <td className="py-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSellClick(item)}
                              data-testid={`sell-button-${item.crypto_id}`}
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              Sell
                            </Button>
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
      </div>

      {/* Sell Dialog */}
      <TransactionDialog
        open={sellDialogOpen}
        onOpenChange={setSellDialogOpen}
        type="sell"
        crypto={selectedCrypto}
        quantity={sellQuantity}
        onQuantityChange={setSellQuantity}
        onConfirm={handleSell}
        processing={processing}
        user={user}
        portfolio={selectedCrypto}
      />
    </Layout>
  );
};

export default Portfolio;