// File: src/components/admin/SubscriptionPlansManager.tsx

import React, { useState, useEffect } from "react";
import { subscriptionPlanService } from "@/services";
import type {
  SubscriptionPlan,
  SubscriptionPlanPayload,
  SubscriptionPlanFilter,
} from "@/models/subscriptionPlan";

/**
 * Component để quản lý các gói đăng ký (CRUD)
 */
export const SubscriptionPlansManager: React.FC = () => {
  // State
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">("view");
  const [formData, setFormData] = useState<SubscriptionPlanPayload>({
    name: "",
    description: "",
    price: 0,
    currency: "VND",
    durationDays: 30,
    creditTier: "free",
    isActive: true,
  });
  const [filter, setFilter] = useState<SubscriptionPlanFilter>({
    pageNumber: 1,
    pageSize: 10,
    isActive: undefined,
    searchTerm: "",
    sortBy: "createdAt",
    sortDirection: "desc",
  });
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Load subscription plans when component mounts or filter changes
  useEffect(() => {
    loadPlans();
  }, [filter.pageNumber, filter.pageSize, filter.isActive, filter.sortBy, filter.sortDirection]);

  // Load subscription plans from API
  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await subscriptionPlanService.getPlans(filter);
      setPlans(response.items);
      setTotalCount(response.totalCount || 0);
      setTotalPages(response.totalPages || 0);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load subscription plans";
      setError(errorMessage);
      console.error("Error loading plans:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Handle different input types
    let parsedValue: string | number | boolean = value;

    if (type === "number") {
      parsedValue = parseFloat(value) || 0;
    } else if (type === "checkbox") {
      parsedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData({ ...formData, [name]: parsedValue });
  };

  // Load plan details
  const handleViewPlan = async (planId: string) => {
    try {
      setLoading(true);
      const plan = await subscriptionPlanService.getPlanById(planId);
      setSelectedPlan(plan);
      setFormMode("view");
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load plan details";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Set up form for creating a new plan
  const handleAddNew = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      currency: "VND",
      durationDays: 30,
      creditTier: "free",
      isActive: true,
    });
    setSelectedPlan(null);
    setFormMode("create");
  };

  // Set up form for editing an existing plan
  const handleEditPlan = (plan: SubscriptionPlan) => {
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      durationDays: plan.durationDays,
      creditTier: plan.creditTier,
      isActive: plan.isActive,
    });
    setSelectedPlan(plan);
    setFormMode("edit");
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (formMode === "create") {
        await subscriptionPlanService.createPlan(formData);
      } else if (formMode === "edit" && selectedPlan) {
        await subscriptionPlanService.updatePlan(selectedPlan.id, formData);
      }

      // Reload plans after creating/updating
      await loadPlans();

      // Reset form
      setFormMode("view");
      setSelectedPlan(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        currency: "VND",
        durationDays: 30,
        creditTier: "free",
        isActive: true,
      });

      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save subscription plan";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle plan deletion
  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm("Are you sure you want to delete this subscription plan?")) {
      return;
    }

    try {
      setLoading(true);
      await subscriptionPlanService.deletePlan(planId);
      await loadPlans();

      if (selectedPlan?.id === planId) {
        setSelectedPlan(null);
        setFormMode("view");
      }

      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete subscription plan";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Toggle plan active status
  const handleTogglePlanStatus = async (planId: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      await subscriptionPlanService.togglePlanStatus(planId, !currentStatus);
      await loadPlans();

      // Update selected plan if it's the one being toggled
      if (selectedPlan?.id === planId) {
        const updatedPlan = await subscriptionPlanService.getPlanById(planId);
        setSelectedPlan(updatedPlan);
      }

      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update plan status";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Handle different input types
    let parsedValue: string | number | boolean | undefined = value;

    if (name === "isActive") {
      parsedValue = value === "" ? undefined : value === "true";
    } else if (type === "number") {
      parsedValue = value === "" ? undefined : parseInt(value) || undefined;
    }

    setFilter({
      ...filter,
      [name]: parsedValue,
      // Reset to page 1 if changing anything other than page
      ...(name !== "pageNumber" && name !== "pageSize" ? { pageNumber: 1 } : {}),
    });
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The filter state is already updated through handleFilterChange
    // This is just to trigger a new search when the search button is clicked
    loadPlans();
  };

  // Navigation buttons for pagination
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setFilter({ ...filter, pageNumber: page });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Subscription Plans Manager</h1>

      {/* Error display */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Filter section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filter Plans</h2>
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Term</label>
            <input
              type="text"
              name="searchTerm"
              value={filter.searchTerm || ""}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Search by name..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="isActive"
              value={filter.isActive === undefined ? "" : String(filter.isActive)}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              name="sortBy"
              value={filter.sortBy || "createdAt"}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="durationDays">Duration</option>
              <option value="createdAt">Created Date</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Direction</label>
            <select
              name="sortDirection"
              value={filter.sortDirection || "desc"}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <div className="md:col-span-2 lg:col-span-4 flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? "Loading..." : "Search"}
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Plans list */}
        <div className="md:w-2/3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Subscription Plans</h2>
            <button
              onClick={handleAddNew}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
              disabled={loading}
            >
              Add New Plan
            </button>
          </div>

          {loading && <p className="text-center py-4">Loading plans...</p>}

          {!loading && plans.length === 0 && (
            <p className="text-center py-4">No subscription plans found.</p>
          )}

          {!loading && plans.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 text-left">Name</th>
                      <th className="py-2 px-4 text-left">Price</th>
                      <th className="py-2 px-4 text-left">Duration</th>
                      <th className="py-2 px-4 text-left">Credit Tier</th>
                      <th className="py-2 px-4 text-left">Status</th>
                      <th className="py-2 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan) => (
                      <tr key={plan.id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="py-2 px-4">{plan.name}</td>
                        <td className="py-2 px-4">
                          {plan.price.toLocaleString()} {plan.currency}
                        </td>
                        <td className="py-2 px-4">{plan.durationDays} days</td>
                        <td className="py-2 px-4">
                          <span className="font-semibold text-purple-600 capitalize">{plan.creditTier} Tier</span>
                        </td>
                        <td className="py-2 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs ${plan.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {plan.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewPlan(plan.id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEditPlan(plan)}
                              className="text-yellow-600 hover:text-yellow-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleTogglePlanStatus(plan.id, plan.isActive)}
                              className={`${plan.isActive ? "text-orange-600 hover:text-orange-800" : "text-green-600 hover:text-green-800"}`}
                            >
                              {plan.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              onClick={() => handleDeletePlan(plan.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <div>
                  <span className="text-sm text-gray-700">
                    Showing{" "}
                    {Math.min(
                      (filter.pageNumber || 1) * (filter.pageSize || 10) -
                        (filter.pageSize || 10) +
                        1,
                      totalCount
                    )}{" "}
                    to {Math.min((filter.pageNumber || 1) * (filter.pageSize || 10), totalCount)} of{" "}
                    {totalCount} plans
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange((filter.pageNumber || 1) - 1)}
                    disabled={(filter.pageNumber || 1) <= 1}
                    className={`px-3 py-1 rounded ${(filter.pageNumber || 1) <= 1 ? "bg-gray-200 text-gray-500" : "bg-blue-500 text-white hover:bg-blue-600"}`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange((filter.pageNumber || 1) + 1)}
                    disabled={(filter.pageNumber || 1) >= totalPages}
                    className={`px-3 py-1 rounded ${(filter.pageNumber || 1) >= totalPages ? "bg-gray-200 text-gray-500" : "bg-blue-500 text-white hover:bg-blue-600"}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Form section */}
        <div className="md:w-1/3">
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">
              {formMode === "create" && "Create New Plan"}
              {formMode === "edit" && "Edit Plan"}
              {formMode === "view" && selectedPlan && "Plan Details"}
              {formMode === "view" && !selectedPlan && "Plan Information"}
            </h2>

            {formMode === "view" && selectedPlan ? (
              <div>
                <div className="mb-4">
                  <h3 className="font-semibold">Name</h3>
                  <p>{selectedPlan.name}</p>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold">Description</h3>
                  <p>{selectedPlan.description}</p>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold">Price</h3>
                  <p>
                    {selectedPlan.price.toLocaleString()} {selectedPlan.currency}
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold">Duration</h3>
                  <p>{selectedPlan.durationDays} days</p>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold">Credit Tier</h3>
                  <p className="font-bold text-purple-600 capitalize">{selectedPlan.creditTier} Tier</p>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold">Status</h3>
                  <p>{selectedPlan.isActive ? "Active" : "Inactive"}</p>
                </div>
                {selectedPlan.createdAt && (
                  <div className="mb-4">
                    <h3 className="font-semibold">Created At</h3>
                    <p>{new Date(selectedPlan.createdAt).toLocaleString()}</p>
                  </div>
                )}
                {selectedPlan.updatedAt && (
                  <div className="mb-4">
                    <h3 className="font-semibold">Updated At</h3>
                    <p>{new Date(selectedPlan.updatedAt).toLocaleString()}</p>
                  </div>
                )}
                <div className="flex space-x-2 mt-6">
                  <button
                    onClick={() => handleEditPlan(selectedPlan)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleTogglePlanStatus(selectedPlan.id, selectedPlan.isActive)}
                    className={`font-semibold py-2 px-4 rounded ${selectedPlan.isActive ? "bg-orange-500 hover:bg-orange-600" : "bg-green-500 hover:bg-green-600"} text-white`}
                  >
                    {selectedPlan.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDeletePlan(selectedPlan.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : formMode === "view" && !selectedPlan ? (
              <p className="text-gray-600">Select a plan from the list or create a new one.</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    rows={3}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    min="0"
                    step="1000"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  >
                    <option value="VND">VND</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    name="durationDays"
                    value={formData.durationDays}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    min="1"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credit Tier
                  </label>
                  <select
                    name="creditTier"
                    value={formData.creditTier}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  >
                    <option value="free">Free Tier</option>
                    <option value="basic">Basic Tier</option>
                    <option value="premium">Premium Tier</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select which credit tier from appsettings.json to assign to this plan
                  </p>
                </div>

                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2">Active</span>
                  </label>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : formMode === "create" ? "Create Plan" : "Update Plan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormMode("view");
                      setFormData({
                        name: "",
                        description: "",
                        price: 0,
                        currency: "VND",
                        durationDays: 30,
                        creditTier: "free",
                        isActive: true,
                      });
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlansManager;
