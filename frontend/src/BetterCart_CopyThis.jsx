// Core React imports for state and lifecycle management
import React, { useState, useEffect } from 'react';

// Icon imports for UI clarity and visual feedback
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  Minus,
  Plus,
  Package,
  ShieldCheck,
  MapPin
} from 'lucide-react';

/**
 * Cart Component
 * ----------------
 * Handles cart state, item parsing from URL,
 * quantity updates, removal, and order summary display.
 */
const Cart = () => {
    // Holds all cart items parsed from query params
    const [cartItems, setCartItems] = useState([]);

    // Stores calculated cart total
    const [total, setTotal] = useState(0);

    // Controls loading screen during initial parsing
    const [loading, setLoading] = useState(true);

    /**
     * 1️⃣ Initial Load & URL Parsing
     * --------------------------------
     * - Reads cart items from URL query parameters
     * - Parses item format: "Name:Qty:Price"
     * - Simulates loading delay for better UX feedback
     */
    useEffect(() => {
        setTimeout(() => {
            const queryParams = new URLSearchParams(window.location.search);
            const itemsParam = queryParams.get('items');

            if (itemsParam) {
                const rawList = itemsParam.split(',');

                const parsedItems = rawList.map((itemStr, index) => {
                    // Expected format: Name:Quantity:Price
                    const parts = itemStr.split(':');

                    // Generate deterministic placeholder color based on item string
                    const colorHue = itemStr.length * 25 % 360;

                    if (parts.length === 3) {
                        return {
                            id: `item-${index}`,
                            name: decodeURIComponent(parts[0]),
                            qty: Math.max(1, parseInt(parts[1]) || 1),
                            price: parseInt(parts[2]) || 0,
                            color: `hsl(${colorHue}, 70%, 95%)`,
                            iconColor: `hsl(${colorHue}, 70%, 40%)`
                        };
                    }

                    // Fallback for malformed input
                    return {
                        id: `item-${index}`,
                        name: decodeURIComponent(itemStr),
                        qty: 1,
                        price: 0,
                        color: `hsl(${colorHue}, 70%, 95%)`,
                        iconColor: `hsl(${colorHue}, 70%, 40%)`
                    };
                });

                setCartItems(parsedItems);
            }

            setLoading(false);
        }, 800);
    }, []);

    /**
     * 2️⃣ Cart Total Calculation
     * ---------------------------
     * Recalculates total whenever cart items or quantities change
     */
    useEffect(() => {
        const newTotal = cartItems.reduce(
            (sum, item) => sum + (item.price * item.qty),
            0
        );
        setTotal(newTotal);
    }, [cartItems]);

    /**
     * Updates quantity of a specific cart item
     * Ensures quantity never goes below 1
     */
    const updateQty = (id, delta) => {
        setCartItems(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, qty: Math.max(1, item.qty + delta) }
                    : item
            )
        );
    };

    /**
     * Removes an item entirely from the cart
     */
    const removeItem = (id) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    /**
     * Loading State UI
     * ----------------
     * Shown while cart data is being parsed
     */
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium tracking-wide">
                        LOADING CART...
                    </p>
                </div>
            </div>
        );
    }

    /**
     * Main Cart UI
     * -------------
     * Displays:
     * - Cart items list
     * - Quantity controls
     * - Order summary
     * - Delivery preview
     */
    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-gray-800 pb-20">

            {/* Sticky Navbar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center font-bold text-lg text-yellow-900">
                        A
                    </div>
                    <span className="font-bold text-xl tracking-tight text-gray-900">
                        Annadata<span className="text-yellow-500">Mart</span>
                    </span>
                </div>

                {/* Cart Icon with Item Count */}
                <div className="bg-gray-100 p-2 rounded-full relative">
                    <ShoppingCart size={20} className="text-gray-600" />
                    {cartItems.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                            {cartItems.length}
                        </span>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    Your Shopping Cart
                    <span className="text-lg font-normal text-gray-500">
                        ({cartItems.length} items)
                    </span>
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* LEFT: Cart Items List */}
                    <div className="flex-1 space-y-4">
                        {cartItems.length === 0 ? (
                            /* Empty Cart State */
                            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
                                <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-bold text-gray-500">
                                    Your cart is empty
                                </h3>
                                <p className="text-gray-400 mb-6">
                                    Looks like you haven't added anything yet.
                                </p>
                                <button className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-xl transition-all">
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            /* Render Each Cart Item */
                            cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-6 hover:shadow-md transition-all"
                                >

                                    {/* Visual Placeholder */}
                                    <div
                                        className="w-20 h-20 md:w-24 md:h-24 rounded-xl flex items-center justify-center text-3xl font-bold shrink-0 shadow-inner"
                                        style={{
                                            backgroundColor: item.color,
                                            color: item.iconColor
                                        }}
                                    >
                                        {item.name.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Item Details */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                                                    {item.name}
                                                </h3>
                                                <p className="text-xs font-bold text-green-600 uppercase tracking-wider mt-1 flex items-center gap-1">
                                                    <ShieldCheck size={12} />
                                                    In Stock • Verified Seller
                                                </p>
                                            </div>
                                            <span className="md:hidden font-bold text-xl text-gray-900">
                                                ₹{item.price}
                                            </span>
                                        </div>

                                        {/* Quantity & Actions */}
                                        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200">
                                                <button onClick={() => updateQty(item.id, -1)}>
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-8 text-center font-bold text-sm">
                                                    {item.qty}
                                                </span>
                                                <button onClick={() => updateQty(item.id, 1)}>
                                                    <Plus size={14} />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-red-500 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    {/* Desktop Price */}
                                    <div className="hidden md:block text-right min-w-[100px]">
                                        <div className="text-2xl font-bold text-gray-900">
                                            ₹{(item.price * item.qty).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="w-full lg:w-96">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-xl font-bold mb-6">
                                Order Summary
                            </h2>

                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>₹{total.toLocaleString()}</span>
                            </div>

                            <button className="w-full mt-6 py-4 bg-yellow-400 hover:bg-yellow-500 font-bold rounded-xl flex items-center justify-center gap-2">
                                Proceed to Checkout <ArrowRight size={20} />
                            </button>

                            {/* Delivery Preview */}
                            <div className="mt-6 pt-6 border-t">
                                <MapPin size={20} />
                                <p className="text-sm font-bold">
                                    Farm #12, Nashik District
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Cart;
