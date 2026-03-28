import React, { useState, useEffect } from "react";
import {
  getFeesByMonth,
  createMonthlyFeesForAllStudents,
  markFeeAsPaid,
} from "../services/api";
import { IndianRupee, Settings, CheckCircle } from "lucide-react";

const Fees = () => {
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formattedMonth, setFormattedMonth] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (currentMonth) {
      fetchFees();
    }
    const formatted = new Date(currentMonth + "-01").toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
    setFormattedMonth(formatted);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth]);

  // console.log({ currentMonth });
  console.log({ formattedMonth });

  const fetchFees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFeesByMonth(currentMonth);
      setFees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFees = async () => {
    if (
      !window.confirm(
        `Generate unpaid fee records for all students for ${currentMonth}?`,
      )
    )
      return;
    try {
      setGenerating(true);
      setError(null);
      setSuccess(null);

      const count = await createMonthlyFeesForAllStudents(currentMonth);
      setSuccess(`Generated fees for ${count} student(s).`);
      await fetchFees();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkPaid = async (feeId, amount) => {
    try {
      setLoading(true);
      setError(null);
      await markFeeAsPaid(feeId, amount);
      setSuccess("Fee marked as paid successfully.");
      await fetchFees();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
            <p className="text-sm text-gray-500">
              Track and generate monthly fee collections
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
          <label className="text-sm font-medium text-gray-700 pl-2">
            Select Month:{" "}
          </label>
          <input
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="px-3 py-1.5 border-none bg-gray-50 rounded-md focus:ring-2 focus:ring-amber-500 outline-none font-medium text-black"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-lg text-sm border border-emerald-100">
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Fees for {formattedMonth}
          </h2>
          <div className="py-1 px-8">
            <div className="w-40">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-center cursor-pointer appearance-none ${status === "paid" ? "bg-[#d1fae4] text-[#156e54] border-green-600" : status === "non-paid" ? "bg-[#fff1f2] text-[#c9003a] border-[#c9003a]" : "bg-gray-400 border-gray-500"}`}
              >
                <option value="">Select Status</option>
                <option value="paid">Paid</option>
                <option value="non-paid">Unpaid</option>
              </select>

              {/* <p className="mt-2 text-sm">
                Selected:{" "}
                <span className="font-medium">{status || "None"}</span>
              </p> */}
            </div>
          </div>
          <button
            onClick={handleGenerateFees}
            disabled={generating}
            className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors disabled:bg-amber-400 font-medium text-sm shadow-sm cursor-pointer"
          >
            <Settings
              className={`w-4 h-4 ${generating ? "animate-spin" : ""}`}
            />
            {generating ? "Generating..." : "Generate Monthly Fees"}
          </button>
        </div>

        {loading && !generating ? (
          <div className="p-12 text-center text-gray-500">Loading fees...</div>
        ) : fees.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <IndianRupee className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-gray-600 font-medium">
              No fees generated for this month.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Click the top-right button to generate them for all active
              students.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm">
                  <th className="px-6 py-3 font-medium">Student Info</th>
                  <th className="px-6 py-3 font-medium">Amount Due</th>
                  <th className="px-6 py-3 font-medium">Status / Date</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fees.map((fee) => (
                  <tr
                    key={fee.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {fee.students.name}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        Teacher:{" "}
                        {fee.students.teachers?.name || (
                          <span className="italic ml-1 text-gray-400">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">
                        ₹{Number(fee.students.monthly_fee).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {fee.status === "paid" ? (
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Paid
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(fee.payment_date).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {fee.status === "unpaid" ? (
                        <button
                          onClick={() =>
                            handleMarkPaid(fee.id, fee.students.monthly_fee)
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Mark Paid
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm italic">
                          Cleared
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Fees;
