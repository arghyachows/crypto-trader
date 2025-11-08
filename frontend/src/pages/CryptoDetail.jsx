import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CryptoDetail = ({ user, onLogout, onUpdateUser }) => {
  const { cryptoId } = useParams();
  const navigate = useNavigate();
  const [crypto, setCrypto] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyQuantity, setBuyQuantity] = useState("");
  const [sellQuantity, setSellQuantity] = useState("");
  const [portfolio, setPortfolio] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCryptoDetails();
    fetchPortfolio();
  }, [cryptoId]);

  const fetchCryptoDetails = async () => {
    try {
      const response = await axios.get(`/cryptos/${cryptoId}`);
      setCrypto(response.data.crypto);
      
      // Format chart data
      const formattedData = response.data.chart.map(([timestamp, price]) => ({
        time: new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: price
      }));
      setChartData(formattedData);
    } catch (error) {
      console.error("Failed to fetch crypto details", error);
      toast.error("Failed to load cryptocurrency details");
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get("/portfolio");
      const holding = response.data.find((p) => p.crypto_id === cryptoId);
      setPortfolio(holding || null);
    } catch (error) {
      console.error("Failed to fetch portfolio", error);
    }
  };

  const handleBuy = async () => {
    const quantity = parseFloat(buyQuantity);
    if (!quantity || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const totalCost = quantity * crypto.current_price;
    if (totalCost > user.balance) {
      toast.error("Insufficient balance");
      return;
    }

    setProcessing(true);
    try {
      const response = await axios.post("/portfolio/buy", {
        crypto_id: crypto.id,
        crypto_symbol: crypto.symbol.toUpperCase(),
        crypto_name: crypto.name,
        quantity: quantity,
        price_per_unit: crypto.current_price
      });

      toast.success("Purchase successful!");
      onUpdateUser({ ...user, balance: response.data.new_balance });
      setBuyQuantity("");
      fetchPortfolio();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Purchase failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleSell = async () => {
    const quantity = parseFloat(sellQuantity);
    if (!quantity || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (!portfolio || quantity > portfolio.quantity) {
      toast.error("Insufficient crypto balance");
      return;
    }

    setProcessing(true);
    try {
      const response = await axios.post("/portfolio/sell", {
        crypto_id: crypto.id,
        crypto_symbol: crypto.symbol.toUpperCase(),
        crypto_name: crypto.name,
        quantity: quantity,
        price_per_unit: crypto.current_price
      });

      toast.success("Sale successful!");
      onUpdateUser({ ...user, balance: response.data.new_balance });
      setSellQuantity("");
      fetchPortfolio();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Sale failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="text-center py-12 text-slate-600">Loading...</div>
      </Layout>
    );
  }

  if (!crypto) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="text-center py-12 text-slate-600">Cryptocurrency not found</div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-8" data-testid="crypto-detail">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate("/market")} data-testid="back-button">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Market
        </Button>

        {/* Crypto Header */}
        <div className="flex items-center gap-4">
          <img src={crypto.image} alt={crypto.name} className="w-16 h-16 rounded-full" />
          <div>
            <h1 className="text-4xl font-bold text-slate-800">{crypto.name}</h1>
            <p className="text-slate-600">{crypto.symbol.toUpperCase()}</p>
          </div>
        </div>

        {/* Price Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-slate-600 mb-1">Current Price</div>
                <div className="text-3xl font-bold text-slate-800" data-testid="current-price">
                  ${crypto.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">24h Change</div>
                <div
                  className={`text-2xl font-bold flex items-center gap-2 ${
                    crypto.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {crypto.price_change_percentage_24h >= 0 ? <TrendingUp /> : <TrendingDown />}
                  {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Market Cap</div>
                <div className="text-2xl font-bold text-slate-800">
                  ${(crypto.market_cap / 1e9).toFixed(2)}B
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>7 Day Price Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trading Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Buy */}
          <Card data-testid="buy-card">
            <CardHeader>
              <CardTitle>Buy {crypto.symbol.toUpperCase()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(e.target.value)}
                  data-testid="buy-quantity-input"
                />
              </div>
              <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Price per unit:</span>
                  <span className="font-medium">${crypto.current_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total cost:</span>
                  <span className="font-medium" data-testid="buy-total-cost">
                    ${buyQuantity ? (parseFloat(buyQuantity) * crypto.current_price).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Your balance:</span>
                  <span className="font-medium">${user.balance.toFixed(2)}</span>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleBuy}
                disabled={processing || !buyQuantity}
                data-testid="buy-button"
              >
                {processing ? "Processing..." : "Buy"}
              </Button>
            </CardContent>
          </Card>

          {/* Sell */}
          <Card data-testid="sell-card">
            <CardHeader>
              <CardTitle>Sell {crypto.symbol.toUpperCase()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={sellQuantity}
                  onChange={(e) => setSellQuantity(e.target.value)}
                  data-testid="sell-quantity-input"
                />
              </div>
              <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Price per unit:</span>
                  <span className="font-medium">${crypto.current_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total value:</span>
                  <span className="font-medium" data-testid="sell-total-value">
                    ${sellQuantity ? (parseFloat(sellQuantity) * crypto.current_price).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Your holdings:</span>
                  <span className="font-medium">
                    {portfolio ? portfolio.quantity.toFixed(4) : '0.0000'}
                  </span>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleSell}
                disabled={processing || !sellQuantity || !portfolio}
                data-testid="sell-button"
              >
                {processing ? "Processing..." : "Sell"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CryptoDetail;