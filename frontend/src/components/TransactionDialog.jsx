import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

const TransactionDialog = ({
  open,
  onOpenChange,
  type, // 'buy' or 'sell'
  crypto,
  quantity,
  onQuantityChange,
  onConfirm,
  processing,
  user,
  portfolio
}) => {
  const isBuy = type === "buy";
  const price = crypto?.current_price || 0;
  const qty = parseFloat(quantity) || 0;
  const totalAmount = qty * price;
  
  // Calculate balance after transaction
  const currentBalance = user?.balance || 0;
  const balanceAfter = isBuy 
    ? currentBalance - totalAmount 
    : currentBalance + totalAmount;
  
  // Calculate portfolio impact
  const currentHoldings = portfolio?.quantity || 0;
  const holdingsAfter = isBuy 
    ? currentHoldings + qty 
    : currentHoldings - qty;
  
  // For sell, calculate profit/loss
  let profitLoss = 0;
  let profitLossPercentage = 0;
  if (!isBuy && portfolio) {
    const avgBuyPrice = portfolio.average_buy_price || 0;
    profitLoss = (price - avgBuyPrice) * qty;
    profitLossPercentage = avgBuyPrice > 0 ? ((price - avgBuyPrice) / avgBuyPrice * 100) : 0;
  }
  
  // Validation
  const hasInsufficientBalance = isBuy && totalAmount > currentBalance;
  const hasInsufficientHoldings = !isBuy && qty > currentHoldings;
  const isInvalid = !qty || qty <= 0 || hasInsufficientBalance || hasInsufficientHoldings;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" data-testid={`${type}-dialog`}>
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {isBuy ? 'Buy' : 'Sell'} {crypto?.name}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Review your transaction details before confirming
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm sm:text-base font-medium">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => onQuantityChange(e.target.value)}
              step="0.0001"
              min="0"
              className="text-base sm:text-lg"
              data-testid={`${type}-quantity-input`}
            />
            <p className="text-xs sm:text-sm text-slate-600">
              {!isBuy && `Available: ${currentHoldings.toFixed(4)} ${crypto?.symbol}`}
            </p>
          </div>

          {/* Transaction Details */}
          <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-semibold text-slate-900 text-sm sm:text-base">Transaction Details</h4>
            
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-slate-600">Price per unit</span>
                <span className="font-medium">${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-slate-600">Quantity</span>
                <span className="font-medium">{qty.toFixed(4)} {crypto?.symbol}</span>
              </div>
              
              <div className="flex justify-between text-sm sm:text-base font-semibold border-t border-slate-300 pt-2 mt-2">
                <span>{isBuy ? 'Total Cost' : 'Total Proceeds'}</span>
                <span className={isBuy ? 'text-red-600' : 'text-green-600'} data-testid={`${type}-total-amount`}>
                  {isBuy ? '-' : '+'}${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Balance Impact */}
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-slate-900">Balance Impact</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Current balance</span>
                <span className="font-medium">${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              <div className="flex justify-between text-base font-semibold">
                <span>Balance after</span>
                <span className={balanceAfter < 0 ? 'text-red-600' : 'text-slate-900'}>
                  ${balanceAfter.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Portfolio Impact */}
          <div className="space-y-3 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <h4 className="font-semibold text-slate-900">Portfolio Impact</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Current holdings</span>
                <span className="font-medium">{currentHoldings.toFixed(4)} {crypto?.symbol}</span>
              </div>
              
              <div className="flex justify-between text-base font-semibold">
                <span>Holdings after</span>
                <span>{holdingsAfter.toFixed(4)} {crypto?.symbol}</span>
              </div>
              
              {!isBuy && qty > 0 && (
                <div className="border-t border-indigo-300 pt-2 mt-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Profit/Loss on sale</span>
                    <div className="text-right">
                      <div className={`font-semibold flex items-center gap-1 justify-end ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profitLoss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)}
                      </div>
                      <div className={`text-xs ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ({profitLoss >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Messages */}
          {hasInsufficientBalance && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Insufficient balance for this transaction</span>
            </div>
          )}
          
          {hasInsufficientHoldings && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Insufficient holdings for this transaction</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={processing || isInvalid}
            className={isBuy ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}
            data-testid={`${type}-confirm-button`}
          >
            {processing ? "Processing..." : `Confirm ${isBuy ? 'Purchase' : 'Sale'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDialog;
