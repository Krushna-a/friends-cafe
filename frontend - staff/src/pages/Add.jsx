import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Add = () => {
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update file handler to store the actual file
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

      if (!formData.image.file) {
        toast.error("Please upload an image");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("image1", formData.image.file);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/products`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.ok) {
        toast.success("Product added successfully!");
        navigate("/list");
      }
    } catch (error) {
      console.error("Error submitting product:", error.response?.data || error);
      toast.error(error.response?.data?.error || "Failed to add product");
    }
  };

  return (
    <div className="h-screen bg-white p-4 mt-2">
      <div className="h-full max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-2">Add New Product</h2>

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
              ADD PRODUCT
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

export default Add;
