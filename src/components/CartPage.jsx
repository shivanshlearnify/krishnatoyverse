import { useDispatch, useSelector } from "react-redux";
import { updateQuantity, removeFromCart } from "@/redux/cartSlice";

export default function CartPage() {
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  return (
    <div className="p-6">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between mb-4">
          <span>{item.name}</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={item.quantity}
              onChange={(e) =>
                dispatch(updateQuantity({ id: item.id, quantity: +e.target.value }))
              }
              className="w-16 border rounded text-center"
            />
            <button
              onClick={() => dispatch(removeFromCart(item.id))}
              className="text-red-500"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
