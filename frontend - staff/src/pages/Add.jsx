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
    <div className="h-screen bg-soft-cream p-4 mt-2">
      <div className="h-full max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-dark-cocoa">Add New Product</h2>
          <p className="text-sm text-muted-brown mt-1">Create a new menu item for your café</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-12 gap-6 h-[calc(100%-100px)]"
        >
          {/* Left Column */}
          <div className="col-span-8 bg-clean-white rounded-2xl p-6 shadow-lg border border-beige">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-dark-cocoa mb-2">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Black Coffee"
                  className="w-full p-4 border border-coffee-brown/20 rounded-xl focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown transition-all bg-soft-cream/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-dark-cocoa mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter product description (optional)"
                  rows="4"
                  className="w-full p-4 border border-coffee-brown/20 rounded-xl focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown transition-all bg-soft-cream/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-dark-cocoa mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full p-4 border border-coffee-brown/20 rounded-xl focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown transition-all bg-soft-cream/50"
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

                <div>
                  <label className="block text-sm font-bold text-dark-cocoa mb-2">
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
                    className="w-full p-4 border border-coffee-brown/20 rounded-xl focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown transition-all bg-soft-cream/50"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-caramel-orange text-white py-4 px-8 rounded-xl hover:bg-dark-cocoa transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                ADD PRODUCT
              </button>
            </div>
          </div>

          {/* Right Column - Image Upload */}
          <div className="col-span-4 bg-clean-white rounded-2xl p-6 shadow-lg border border-beige">
            <label className="block text-sm font-bold text-dark-cocoa mb-4">
              Product Image
            </label>
            <div className="aspect-square border-2 border-dashed border-coffee-brown/30 rounded-2xl flex items-center justify-center relative bg-soft-cream/30 hover:bg-soft-cream/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="product-image"
              />
              <label
                htmlFor="product-image"
                className="cursor-pointer absolute inset-0 flex items-center justify-center"
              >
                {formData.image.url ? (
                  <img
                    src={formData.image.url}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="text-center">
                    <svg className="w-12 h-12 text-muted-brown mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-muted-brown font-medium">Upload Image</span>
                    <p className="text-xs text-muted-brown/70 mt-1">PNG, JPG up to 2MB</p>
                  </div>
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
