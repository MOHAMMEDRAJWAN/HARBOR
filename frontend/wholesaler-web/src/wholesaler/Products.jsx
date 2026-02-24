import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    unit: "",
    moq: "",
    categoryId: "",
  });

  const [editProduct, setEditProduct] = useState({});
  const [newCategory, setNewCategory] = useState("");

  /* ==============================
     FETCH DATA
  ============================== */

  const fetchProducts = async () => {
    const res = await api.get("/products");
    setProducts(res.data.products || []);
  };

  const fetchCategories = async () => {
    const res = await api.get("/categories/my");
    setCategories(res.data.categories || []);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  /* ==============================
     ADD CATEGORY
  ============================== */

  const handleAddCategory = async () => {
    try {
      const storeRes = await api.get("/stores");
      const storeId = storeRes.data.stores[0].id;

      await api.post(`/categories/${storeId}`, {
        name: newCategory,
      });

      setNewCategory("");
      setShowAddCategory(false);
      fetchCategories();
    } catch {
      alert("Failed to add category");
    }
  };

  /* ==============================
     ADD PRODUCT
  ============================== */

  const handleAddProduct = async () => {
    try {
      await api.post(`/products/${newProduct.categoryId}`, {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        moq: Number(newProduct.moq),
        categoryId: Number(newProduct.categoryId),
      });

      setNewProduct({
        name: "",
        price: "",
        stock: "",
        unit: "",
        moq: "",
        categoryId: "",
      });

      setShowAddProduct(false);
      fetchProducts();
    } catch {
      alert("Failed to add product");
    }
  };

  /* ==============================
     EDIT PRODUCT
  ============================== */

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditProduct(product);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditProduct({});
  };

  const saveEdit = async () => {
    try {
      await api.put(`/products/${editingId}`, {
        name: editProduct.name,
        price: Number(editProduct.price),
        stock: Number(editProduct.stock),
        unit: editProduct.unit,
        moq: Number(editProduct.moq),
        categoryId: Number(editProduct.categoryId),
      });

      setEditingId(null);
      fetchProducts();
    } catch {
      alert("Failed to update product");
    }
  };

  /* ==============================
     UI
  ============================== */

  return (
  <div className="card">
    <h2 style={{ marginBottom: 20 }}>Products</h2>

    {/* ACTION BUTTONS */}
    <div style={{ marginBottom: 25 }}>
      <button
        className="primary-btn"
        onClick={() => setShowAddCategory(!showAddCategory)}
      >
        + Add Category
      </button>

      <button
        className="primary-btn"
        style={{ marginLeft: 10 }}
        onClick={() => setShowAddProduct(!showAddProduct)}
      >
        + Add Product
      </button>
    </div>

    {/* ADD CATEGORY FORM */}
    {showAddCategory && (
      <div className="form-card">
        <h4 style={{ marginBottom: 15 }}>Create Category</h4>

        <div className="form-grid">
          <input
            className="form-input"
            placeholder="Category Name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </div>

        <div style={{ marginTop: 15 }}>
          <button className="primary-btn" onClick={handleAddCategory}>
            Save Category
          </button>
        </div>
      </div>
    )}

    {/* ADD PRODUCT FORM */}
    {showAddProduct && (
      <div className="form-card">
        <h4 style={{ marginBottom: 15 }}>Create Product</h4>

        <div className="form-grid">
          <input
            className="form-input"
            placeholder="Name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
          />

          <input
            className="form-input"
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
          />

          <input
            className="form-input"
            type="number"
            placeholder="Stock"
            value={newProduct.stock}
            onChange={(e) =>
              setNewProduct({ ...newProduct, stock: e.target.value })
            }
          />

          <input
            className="form-input"
            placeholder="Unit"
            value={newProduct.unit}
            onChange={(e) =>
              setNewProduct({ ...newProduct, unit: e.target.value })
            }
          />

          <input
            className="form-input"
            type="number"
            placeholder="MOQ"
            value={newProduct.moq}
            onChange={(e) =>
              setNewProduct({ ...newProduct, moq: e.target.value })
            }
          />

          <select
            className="form-select"
            value={newProduct.categoryId}
            onChange={(e) =>
              setNewProduct({ ...newProduct, categoryId: e.target.value })
            }
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 20 }}>
          <button className="primary-btn" onClick={handleAddProduct}>
            Save Product
          </button>
        </div>
      </div>
    )}

    {/* PRODUCT LIST */}
    {products.map((product) => (
      <div key={product.id} className="product-card">
        {editingId === product.id ? (
          <>
            <div className="form-grid">
              <input
                className="form-input"
                value={editProduct.name}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, name: e.target.value })
                }
              />

              <input
                className="form-input"
                type="number"
                value={editProduct.price}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, price: e.target.value })
                }
              />

              <input
                className="form-input"
                type="number"
                value={editProduct.stock}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, stock: e.target.value })
                }
              />

              <select
                className="form-select"
                value={editProduct.categoryId}
                onChange={(e) =>
                  setEditProduct({
                    ...editProduct,
                    categoryId: e.target.value,
                  })
                }
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 15 }}>
              <button className="primary-btn" onClick={saveEdit}>
                Save
              </button>

              <button
                className="secondary-btn"
                onClick={cancelEdit}
                style={{ marginLeft: 10 }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h4>{product.name}</h4>
            <p>₹ {product.price}</p>
            <p>Stock: {product.stock}</p>

            <button
              className="secondary-btn"
              onClick={() => startEdit(product)}
            >
              Edit
            </button>
          </>
        )}
      </div>
    ))}
  </div>
);
}