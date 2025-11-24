import { ArrowRight, CheckCircle, HandHeart,  FileDown } from "lucide-react";
import { Link } from "react-router-dom";
import Confetti from "react-confetti";

const PurchaseSuccessPage = () => {
  //const paymentId = new URLSearchParams(window.location.search).get("payment_id");
   const params = new URLSearchParams(window.location.search);
  const paymentId = params.get("payment_id");
  const orderId = params.get("order_id");
  return (
    <div className="h-screen flex items-center justify-center px-4">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.1}
        style={{ zIndex: 99 }}
        numberOfPieces={700}
        recycle={false}
      />

      <div className="max-w-md w-full bg-mute-800 rounded-lg shadow-2xl overflow-hidden relative z-10">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center">
            <CheckCircle className="text-green-700 w-16 h-16 mb-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-green-700 mb-2">
            Purchase Successful!
          </h1>

          <p className="text-gray-700 text-center mb-2">
            Thank you for your order. We're processing it now.
          </p>
          <p className="text-green-700 text-center text-sm mb-6">
            Check your email for order details and updates.
          </p>

          <div className="bg-mute-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">Payment ID</span>
              <span className="text-sm font-semibold text-green-700">
                {paymentId || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Estimated delivery</span>
              <span className="text-sm font-semibold text-green-700">
                3-5 business days
              </span>
            </div>
          </div>
                 {paymentId&& (
            <div className="text-center mb-6">
              <Link
                to={`/api/orders/${orderId}/invoice`}
                target="_blank"
                className="inline-flex items-center justify-center gap-2 text-green-700 border border-green-700 hover:bg-green-700 hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
              >
                <FileDown size={18} />
                Download Invoice (PDF)
              </Link>
            </div>
          )}

          <div className="space-y-4">
            <button
              className="w-full bg-green-700 hover:bg-emerald-700 text-white font-bold py-2 px-4
              rounded-lg transition duration-300 flex items-center justify-center"
            >
              <HandHeart className="mr-2" size={18} />
              Thanks for trusting us!
            </button>
            <Link
              to={"/"}
              className="w-full bg-gray-700 hover:bg-gray-600 text-green-300 font-bold py-2 px-4  
              rounded-lg transition duration-300 flex items-center justify-center"
            >
              Continue Shopping
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;