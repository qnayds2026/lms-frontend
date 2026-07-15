import { X } from "lucide-react";

export default function PaymentModal({
  open,
  onClose,
  course,
  onManualPayment,
  onOnlinePayment,
}) {
  if (!open || !course) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Enroll Course</h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="mt-6">
          <h3 className="font-medium">{course.title}</h3>

          <p className="text-slate-500 mt-1">₹{course.price}</p>
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => onManualPayment(course)}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-medium"
          >
            Continue with Manual Payment
          </button>

          <button
            onClick={() => onOnlinePayment(course)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium"
          >
            Pay Online
          </button>
        </div>

        <p className="text-xs text-slate-400 text-center mt-4">
          After successful payment, your course access will be activated
          automatically.
        </p>
      </div>
    </div>
  );
}
