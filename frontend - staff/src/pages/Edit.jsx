// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate, useParams } from "react-router-dom";

// const Edit = () => {
//   const { id } = useParams(); // Get product ID from URL
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     price: "",
//     image: {
//       filename: "",
//       url: "",
//       file: null,
//     },
//     size: [],
//     color: [],
//     category: "",
//     type: "",
//     tags: [],
//     inStock: true,
//   });

//   // Fetch existing product
//   const fetchProduct = async () => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`);
//       const product = response.data.product;

//       setFormData({
//         title: product.title || "",
//         description: product.description || "",
//         price: product.price || "",
//         image: {
//           filename: product.image?.filename || "",
//           url: product.image?.url || "",
//           file: null,
//         },
//         size: product.size || [],
//         color: product.color || [],
//         category: product.category || "",
//         type: product.type || "",
//         tags: product.tags || [],
//         inStock: product.inStock || false,
//       });
//     } catch (error) {
//       console.error("Error fetching product:", error.response?.data || error);
//     }
//   };

//   useEffect(() => {
//     fetchProduct();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleArrayInput = (e, field) => {
//     const value = e.target.value.split(",").map((item) => item.trim());
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData((prev) => ({
//         ...prev,
//         image: {
//           filename: file.name,
//           url: URL.createObjectURL(file),
//           file: file,
//         },
//       }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("adminToken");
//       const formDataToSend = new FormData();

//       formDataToSend.append("title", formData.title);
//       formDataToSend.append("description", formData.description);
//       formDataToSend.append("price", formData.price);
//       formDataToSend.append("category", formData.category);
//       formDataToSend.append("type", formData.type);
//       formDataToSend.append("inStock", formData.inStock);
//       formDataToSend.append("size", JSON.stringify(formData.size));
//       formDataToSend.append("color", JSON.stringify(formData.color));
//       formDataToSend.append("tags", JSON.stringify(formData.tags));

//       if (formData.image.file) {
//         formDataToSend.append("image1", formData.image.file);
//       }

//       const response = await axios.put(
//         `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`,
//         formDataToSend,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       if (response.data) {
//         navigate("/list"); // Redirect to product list after successful edit
//       }
//     } catch (error) {
//       console.error("Error updating product:", error.response?.data || error);
//     }
//   };

//   return (
//     <div className="h-screen bg-white p-4 mt-2">
//       <div className="h-full max-w-6xl mx-auto">
//         <h2 className="text-xl font-semibold mb-2">Edit Product</h2>

//         <form
//           onSubmit={handleSubmit}
//           className="grid grid-cols-12 gap-4 h-[calc(100%-80px)]"
//         >
//           {/* Left Column */}
//           <div className="col-span-8 space-y-3">
//             <div className="space-y-1">
//               <label className="block text-sm font-semibold text-gray-700">
//                 Product Title
//               </label>
//               <input
//                 type="text"
//                 name="title"
//                 value={formData.title}
//                 onChange={handleChange}
//                 placeholder="e.g., Men's Classic White Shirt"
//                 className="w-full p-2 border rounded"
//                 required
//               />
//             </div>

//             <div className="space-y-1">
//               <label className="block text-sm font-semibold text-gray-700">
//                 Description
//               </label>
//               <textarea
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 placeholder="Enter product description"
//                 rows="3"
//                 className="w-full p-2 border rounded"
//                 required
//               />
//             </div>

//             <div className="grid grid-cols-3 gap-3">
//               <div className="space-y-1">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Category
//                 </label>
//                 <select
//                   name="category"
//                   value={formData.category}
//                   onChange={handleChange}
//                   className="w-full p-2 border rounded"
//                   required
//                 >
//                   <option value="">Select</option>
//                   <option value="Men">Men</option>
//                   <option value="Women">Women</option>
//                   <option value="Kids">Kids</option>
//                 </select>
//               </div>

//               <div className="space-y-1">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Product Type
//                 </label>
//                 <select
//                   name="type"
//                   value={formData.type}
//                   onChange={handleChange}
//                   className="w-full p-2 border rounded"
//                   required
//                 >
//                   <option value="">Select</option>
//                   <option value="Topwear">Topwear</option>
//                   <option value="Bottomwear">Bottomwear</option>
//                   <option value="Winterwear">Winterwear</option>
//                 </select>
//               </div>

//               <div className="space-y-1">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Price ($)
//                 </label>
//                 <input
//                   type="number"
//                   name="price"
//                   value={formData.price}
//                   onChange={handleChange}
//                   placeholder="39.99"
//                   step="0.01"
//                   className="w-full p-2 border rounded"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//               <div className="space-y-1">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Available Sizes
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.size.join(", ")}
//                   placeholder="S, M, L, XL"
//                   onChange={(e) => handleArrayInput(e, "size")}
//                   className="w-full p-2 border rounded"
//                 />
//               </div>
//               <div className="space-y-1">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Available Colors
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.color.join(", ")}
//                   placeholder="White, Blue, Black"
//                   onChange={(e) => handleArrayInput(e, "color")}
//                   className="w-full p-2 border rounded"
//                 />
//               </div>
//             </div>

//             <div className="space-y-1">
//               <label className="block text-sm font-semibold text-gray-700">
//                 Product Tags
//               </label>
//               <input
//                 type="text"
//                 value={formData.tags.join(", ")}
//                 placeholder="Formal, Casual, Cotton"
//                 onChange={(e) => handleArrayInput(e, "tags")}
//                 className="w-full p-2 border rounded"
//               />
//             </div>

//             <div className="flex items-center gap-2 pt-2">
//               <input
//                 type="checkbox"
//                 name="inStock"
//                 checked={formData.inStock}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     inStock: e.target.checked,
//                   }))
//                 }
//                 className="w-4 h-4"
//                 id="inStock"
//               />
//               <label
//                 htmlFor="inStock"
//                 className="text-sm font-semibold text-gray-700"
//               >
//                 Product is in stock
//               </label>
//             </div>

//             <button
//               type="submit"
//               className="w-32 bg-black text-white py-2 px-4 rounded"
//             >
//               UPDATE
//             </button>
//           </div>

//           {/* Right Column - Image Upload */}
//           <div className="col-span-4 space-y-2">
//             <label className="block text-sm font-semibold text-gray-700">
//               Product Image
//             </label>
//             <div className="aspect-square border-2 border-dashed rounded flex items-center justify-center relative">
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleFileUpload}
//                 className="hidden"
//                 id="product-image"
//               />
//               <label
//                 htmlFor="product-image"
//                 className="cursor-pointer text-gray-400 absolute inset-0 flex items-center justify-center"
//               >
//                 {formData.image.url ? (
//                   <img
//                     src={formData.image.url}
//                     alt="Preview"
//                     className="w-full h-full object-cover rounded"
//                   />
//                 ) : (
//                   "Upload"
//                 )}
//               </label>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Edit;

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Edit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    image: {
      filename: "",
      url: "",
      file: null,
    },
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`
        );
        if (response.data.ok && response.data.product) {
          const product = response.data.product;
          setFormData({
            title: product.name || product.title || "",
            description: product.description || "",
            price: product.price || "",
            category: product.category || "",
            image: {
              filename: product.image ? "existing" : "",
              url: product.image || "",
              file: null,
            },
          });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: {
          filename: file.name,
          url: URL.createObjectURL(file),
          file: file,
        },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast.error("Please login first");
        navigate("/");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);

      if (formData.image.file) {
        formDataToSend.append("image1", formData.image.file);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/products/${id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.ok) {
        toast.success("Product updated successfully!");
        navigate("/list");
      }
    } catch (error) {
      console.error("Error updating product:", error.response?.data || error);
      toast.error(error.response?.data?.error || "Failed to update product");
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-white p-4 mt-2 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white p-4 mt-2">
      <div className="h-full max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-2">Edit Product</h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-12 gap-4 h-[calc(100%-80px)]"
        >
          {/* Left Column */}
          <div className="col-span-8 space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Black Coffee"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description (optional)"
                rows="4"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Hot">Hot</option>
                  <option value="Cold">Cold</option>
                  <option value="Sides">Sides</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Beverage">Beverage</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="99"
                  step="0.01"
                  min="0"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-32 bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              UPDATE
            </button>
          </div>

          {/* Right Column - Image Upload */}
          <div className="col-span-4 space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Product Image
            </label>
            <div className="aspect-square border-2 border-dashed rounded flex items-center justify-center relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="product-image"
              />
              <label
                htmlFor="product-image"
                className="cursor-pointer text-gray-400 absolute inset-0 flex items-center justify-center"
              >
                {formData.image.url ? (
                  <img
                    src={formData.image.url}
                    alt="Preview"
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  "Upload"
                )}
              </label>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Edit;
