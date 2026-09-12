'use client';

import React, { useEffect, useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles,
  Flame,
  Clock,
  Leaf,
  Drumstick,
  X,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Category, MenuItem } from '../../../types';

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    isVeg: true,
    isAvailable: true,
    isChefSpecial: false,
    spicyLevel: 0,
    preparationTimeMin: 15,
    calories: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    try {
      const [catRes, itemRes] = await Promise.all([
        api.getCategories(true),
        api.getMenuItems({ categoryId: selectedCategory === 'all' ? undefined : selectedCategory }),
      ]);
      if (catRes.categories) setCategories(catRes.categories);
      if (itemRes.items) setItems(itemRes.items);
    } catch (e) {
      console.error('Error loading menu catalog:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      categoryId: categories.length > 0 ? categories[0].id : '',
      name: '',
      description: '',
      price: '',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      isVeg: true,
      isAvailable: true,
      isChefSpecial: false,
      spicyLevel: 0,
      preparationTimeMin: 15,
      calories: '350',
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      imageUrl: item.imageUrl || '',
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      isChefSpecial: item.isChefSpecial,
      spicyLevel: item.spicyLevel,
      preparationTimeMin: item.preparationTimeMin,
      calories: item.calories ? item.calories.toString() : '',
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (editingItem) {
        await api.updateMenuItem(editingItem.id, {
          ...formData,
          price: parseFloat(formData.price),
          calories: formData.calories ? parseInt(formData.calories) : undefined,
        });
      } else {
        await api.createMenuItem({
          ...formData,
          price: parseFloat(formData.price),
          calories: formData.calories ? parseInt(formData.calories) : undefined,
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save menu item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStock = async (item: MenuItem) => {
    try {
      await api.toggleItemStock(item.id);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i))
      );
    } catch (e) {
      console.error('Failed to toggle stock', e);
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Delete "${item.name}" from the menu?`)) return;
    try {
      await api.deleteMenuItem(item.id);
      loadData();
    } catch (e) {
      console.error('Failed to delete item', e);
    }
  };

  const filteredItems = items.filter((item) => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <UtensilsCrossed className="w-7 h-7 text-amber-400" />
            <span>Menu Catalog & Live Stock Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage culinary items, prices, dietary badges, and toggle sold-out status instantly.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gold-gradient-bg text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'gold-gradient-bg text-slate-950 shadow'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'gold-gradient-bg text-slate-950 shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dish by name..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-3xl glass-card border transition-all flex flex-col justify-between gap-3 ${
              !item.isAvailable ? 'opacity-60 border-slate-800 bg-slate-900/60' : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex gap-3.5">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 shrink-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : null}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full border ${
                      item.isVeg ? 'border-emerald-400 bg-emerald-400' : 'border-rose-400 bg-rose-400'
                    }`}
                  />
                  <h3 className="font-bold text-sm text-white truncate">{item.name}</h3>
                </div>

                <div className="text-[11px] text-amber-400 font-bold mt-0.5">
                  ₹{item.price.toFixed(2)}
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 font-light">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Badges and Stock Switch */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              {/* 1-Click Stock Toggle */}
              <button
                onClick={() => handleToggleStock(item)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  item.isAvailable
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25'
                }`}
              >
                {item.isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{item.isAvailable ? 'In Stock' : 'Sold Out'}</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition-colors"
                  title="Edit Dish"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Delete Dish"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Dish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-7 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">
                {editingItem ? `Edit: ${editingItem.name}` : 'Add New Culinary Dish'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Dish Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Paneer Butter Masala"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Price (₹ INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="250"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Prep Time (Mins)</label>
                  <input
                    type="number"
                    value={formData.preparationTimeMin}
                    onChange={(e) => setFormData({ ...formData, preparationTimeMin: parseInt(e.target.value) || 15 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Photo URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ingredients, taste profile, and preparation style..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formData.isVeg}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span>Veg Dish</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formData.isChefSpecial}
                    onChange={(e) => setFormData({ ...formData, isChefSpecial: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>Chef's Choice</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="rounded text-blue-500 focus:ring-0"
                  />
                  <span>In Stock</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl gold-gradient-bg text-slate-950 text-xs font-black shadow-lg"
                >
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update Dish' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
