// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";

// const List = () => {
//   const [products, setProducts] = useState([]);

//   const fetchData = async () => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products`);
//       setProducts(response.data.products);
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       const token = localStorage.getItem("adminToken");
//       await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       fetchData();
//     } catch (error) {
//       console.error("Error deleting product:", error.response?.data || error);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleProductAdded = () => {
//     fetchData();
//   };

//   return (
//     <div className="h-screen bg-white p-4 mt-2 w-full">
//       <div className="h-full max-w-6xl mx-auto">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-xl font-semibold">All Products List</h2>
//           <div className="bg-green-50 text-green-600 px-4 py-2 rounded-md hidden">
//             Product Added
//           </div>
//           <Link to="/add">
//             <button className="bg-blue-500 text-white py-2 px-4 rounded">
//               Add Product
//             </button>
//           </Link>
//         </div>

//         {/* Product List Table */}
//         <div className="bg-white rounded-lg overflow-hidden">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
//                   Image
//                 </th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
//                   Name
//                 </th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
//                   Category
//                 </th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
//                   Price
//                 </th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
//                   Action
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {products.map((product, index) => (
//                 <tr key={index} className="hover:bg-gray-50">
//                   <td className="px-6 py-4">
//                     <img
//                       src={product.image.url}
//                       alt={product.title}
//                       className="w-12 h-16 object-cover rounded"
//                     />
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-700">
//                     {product.title}
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-700">
//                     {product.category}
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-700">
//                     ${product.price}
//                   </td>
//                   <td className="px-6 py-4 flex gap-2">
//                     {/* Edit Button */}
//                     <Link
//                       to={`/edit/${product._id}`}
//                       className="text-blue-600 hover:text-blue-800"
//                     >
//                       Edit
//                     </Link>

//                     {/* Delete Button */}
//                     <button
//                       className="text-gray-600 hover:text-red-600"
//                       onClick={() => handleDelete(product._id)}
//                     >
//                       X
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default List;

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const List = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products`
      );
      if (response.data.ok) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast.error("Please login first");
        navigate("/");
        return;
      }

      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error.response?.data || error);
      toast.error(error.response?.data?.error || "Failed to delete product");
    }
  };

  return (
    <div className="h-screen bg-soft-cream p-4 mt-2 w-full">
      <div className="h-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 border-b border-coffee-brown/10 bg-soft-cream pb-4">
          <div>
            <h2 className="text-2xl font-bold text-dark-cocoa">All Products</h2>
            <p className="text-sm text-muted-brown mt-1">Manage your café menu items</p>
          </div>
          <Link to="/add">
            <button className="bg-caramel-orange text-white py-3 px-6 rounded-xl hover:bg-dark-cocoa transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          </Link>
        </div>

        {/* Product List Table */}
        <div className="bg-clean-white rounded-2xl overflow-hidden shadow-lg border border-beige">
          <table className="w-full">
            <thead className="bg-beige">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-dark-cocoa">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-dark-cocoa">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-dark-cocoa">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-dark-cocoa">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-dark-cocoa">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-coffee-brown/30 border-t-coffee-brown mb-4"></div>
                      <span className="text-muted-brown">Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-beige rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-muted-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <span className="text-muted-brown font-medium">No products available</span>
                      <p className="text-sm text-muted-brown/70 mt-1">Add your first product to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr key={index} className="hover:bg-soft-cream/50 transition-colors">
                    <td className="px-6 py-4">
                      <img
                        src={
                          product.image ||
                          product.image?.url ||
                          "https://via.placeholder.com/100"
                        }
                        alt={product.name || product.title}
                        className="w-14 h-14 object-cover rounded-xl shadow-sm border border-beige"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/100";
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-dark-espresso">
                        {product.name || product.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-coffee-brown/10 text-coffee-brown rounded-full text-sm font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-coffee-brown">
                        ₹{product.price}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <Link
                          to={`/edit/${product._id}`}
                          className="text-caramel-orange hover:text-dark-cocoa font-medium transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          className="text-red-500 hover:text-red-700 font-medium transition-colors"
                          onClick={() => handleDelete(product._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default List;
