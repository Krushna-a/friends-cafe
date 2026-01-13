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
    <div className="h-screen bg-white p-4 mt-2 w-full">
      <div className="h-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 border-b border-gray-400 bg-white pb-1">
          <h2 className="text-xl font-semibold">All Products List</h2>
          <Link to="/add">
            <button className="bg-blue-500 text-white py-2 px-4 rounded">
              Add Product
            </button>
          </Link>
        </div>

        {/* Product List Table */}
        <div className="bg-white rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No products available
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <img
                        src={
                          product.image ||
                          product.image?.url ||
                          "https://via.placeholder.com/100"
                        }
                        alt={product.name || product.title}
                        className="w-12 h-16 object-cover rounded"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/100";
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {product.name || product.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      ₹{product.price}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Link
                        to={`/edit/${product._id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                      <button
                        className="text-gray-600 hover:text-red-600"
                        onClick={() => handleDelete(product._id)}
                      >
                        X
                      </button>
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
