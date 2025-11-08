import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const Transactions = ({ user, onLogout, onUpdateUser }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("/transactions");
      setTransactions(response.data);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-8" data-testid="transactions-page">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Transaction History</h1>
          <p className="text-slate-600">View all your trading activity</p>
        </div>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-slate-600">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-slate-600">
                No transactions yet. Start trading to see your history here.
              </div>
            ) : (
              <div className="space-y-4" data-testid="transactions-list">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    data-testid={`transaction-${transaction.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.transaction_type === 'buy'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {transaction.transaction_type === 'buy' ? (
                          <ArrowDownRight className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">
                          {transaction.transaction_type === 'buy' ? 'Bought' : 'Sold'} {transaction.crypto_name}
                        </div>
                        <div className="text-sm text-slate-600">
                          {transaction.quantity.toFixed(4)} {transaction.crypto_symbol} @ ${transaction.price_per_unit.toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {formatDate(transaction.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-lg font-semibold ${
                          transaction.transaction_type === 'buy' ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {transaction.transaction_type === 'buy' ? '-' : '+'}$
                        {transaction.total_amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Transactions;