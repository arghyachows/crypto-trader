import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CryptoList = ({ user, onLogout, onUpdateUser }) => {
  const [cryptos, setCryptos] = useState([]);
  const [filteredCryptos, setFilteredCryptos] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCryptos();
  }, []);

  useEffect(() => {
    const filtered = cryptos.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(search.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCryptos(filtered);
  }, [search, cryptos]);

  const fetchCryptos = async () => {
    try {
      const response = await axios.get("/cryptos");
      setCryptos(response.data);
      setFilteredCryptos(response.data);
    } catch (error) {
      console.error("Failed to fetch cryptos", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-8" data-testid="crypto-list">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-2">Market</h1>
          <p className="text-sm sm:text-base text-slate-600">Explore and trade cryptocurrencies</p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search cryptocurrencies..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="crypto-search-input"
              />
            </div>
          </CardContent>
        </Card>

        {/* Crypto List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12 text-slate-600">Loading cryptocurrencies...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="crypto-table">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="py-4 px-6 text-left font-semibold text-slate-700">#</th>
                      <th className="py-4 px-6 text-left font-semibold text-slate-700">Name</th>
                      <th className="py-4 px-6 text-right font-semibold text-slate-700">Price</th>
                      <th className="py-4 px-6 text-right font-semibold text-slate-700">24h Change</th>
                      <th className="py-4 px-6 text-right font-semibold text-slate-700">Market Cap</th>
                      <th className="py-4 px-6 text-right font-semibold text-slate-700">Volume (24h)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCryptos.map((crypto) => (
                      <tr
                        key={crypto.id}
                        className="border-b hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/crypto/${crypto.id}`)}
                        data-testid={`crypto-row-${crypto.id}`}
                      >
                        <td className="py-4 px-6 text-slate-600">{crypto.market_cap_rank}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
                            <div>
                              <div className="font-medium text-slate-800">{crypto.name}</div>
                              <div className="text-sm text-slate-600">{crypto.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right font-medium text-slate-800">
                          ${crypto.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium ${
                              crypto.price_change_percentage_24h >= 0
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {crypto.price_change_percentage_24h >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right text-slate-600">
                          ${(crypto.market_cap / 1e9).toFixed(2)}B
                        </td>
                        <td className="py-4 px-6 text-right text-slate-600">
                          ${(crypto.total_volume / 1e9).toFixed(2)}B
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CryptoList;