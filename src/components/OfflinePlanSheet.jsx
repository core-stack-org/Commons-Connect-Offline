import { useState, useEffect, useRef } from "react";
import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import { useTranslation } from "react-i18next";
import useMainStore from "../store/MainStore.jsx";

const OfflinePlanSheet = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const MainStore = useMainStore((state) => state);

    const plans = MainStore.plans || [];

    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [showPlanDetails, setShowPlanDetails] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showProjectSelector, setShowProjectSelector] = useState(false);

    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [showVillageFilter, setShowVillageFilter] = useState(false);
    const [showFacilitatorFilter, setShowFacilitatorFilter] = useState(false);
    const [selectedVillageFilter, setSelectedVillageFilter] = useState(null);
    const [selectedFacilitatorFilter, setSelectedFacilitatorFilter] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const filterMenuRef = useRef(null);

    // ─── Derive unique projects from plans ───────────────────────────────────────
    const availableProjects = plans.reduce((acc, plan) => {
        if (plan.project !== null && plan.project !== undefined && plan.project_name) {
            const existing = acc.find((p) => p.id === plan.project);
            if (!existing) {
                acc.push({
                    id: plan.project,
                    name: plan.project_name,
                    organization_name: plan.organization_name,
                    count: 1,
                });
            } else {
                existing.count++;
            }
        }
        return acc;
    }, []);

    // ─── On open: auto-select if single project, else show selector ──────────────
    useEffect(() => {
        if (isOpen) {
            if (availableProjects.length === 1) {
                setSelectedProject(availableProjects[0]);
                setShowProjectSelector(false);
            } else if (availableProjects.length > 1 && !selectedProject) {
                setShowProjectSelector(true);
            }
        }
    }, [isOpen]);

    // ─── Sync selected plan from store ───────────────────────────────────────────
    useEffect(() => {
        if (MainStore.currentPlan?.id) {
            setSelectedPlanId(MainStore.currentPlan.id);
        }
    }, [MainStore.currentPlan]);

    // ─── Close filter menu on outside click ──────────────────────────────────────
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                filterMenuRef.current &&
                !filterMenuRef.current.contains(event.target) &&
                !event.target.closest("button[data-filter-button]")
            ) {
                setShowFilterMenu(false);
                setShowVillageFilter(false);
                setShowFacilitatorFilter(false);
            }
        };

        if (showFilterMenu || showVillageFilter || showFacilitatorFilter) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [showFilterMenu, showVillageFilter, showFacilitatorFilter]);

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    const getPlansForProject = () => {
        if (!selectedProject) return [];
        return plans.filter((p) => p.project === selectedProject.id);
    };

    const isTestPlan = (plan) => {
        const name = plan.plan?.toLowerCase() || "";
        return name.includes("test") || name.includes("demo");
    };

    const getUniqueVillages = () => {
        return [...new Set(getPlansForProject().map((p) => p.village_name).filter(Boolean))].sort();
    };

    const getUniqueFacilitators = () => {
        return [...new Set(getPlansForProject().map((p) => p.facilitator_name).filter(Boolean))].sort();
    };

    const applyFilters = (planList) => {
        const regular = planList.filter((p) => !isTestPlan(p));
        const test = planList.filter((p) => isTestPlan(p));

        const filter = (list) => {
            let result = [...list];
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                result = result.filter((p) => p.plan?.toLowerCase().includes(q));
            }
            if (selectedVillageFilter) {
                result = result.filter((p) => p.village_name === selectedVillageFilter);
            }
            if (selectedFacilitatorFilter) {
                result = result.filter((p) => p.facilitator_name === selectedFacilitatorFilter);
            }
            return result;
        };

        return {
            regularPlans: filter(regular),
            testPlans: filter(test),
            hasTestPlans: filter(test).length > 0,
        };
    };

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // ─── Actions ─────────────────────────────────────────────────────────────────

    const handlePlanSelect = (plan) => {
        if (selectedPlanId === plan.id) {
            setSelectedPlanId(null);
            MainStore.setCurrentPlan(null);
            return;
        }
        setSelectedPlanId(plan.id);
        MainStore.setCurrentPlan(plan);
        onClose();
    };

    const handleProjectSelection = (project) => {
        setSelectedProject(project);
        setShowProjectSelector(false);
        setSelectedVillageFilter(null);
        setSelectedFacilitatorFilter(null);
        setSearchQuery("");
    };

    const clearFilters = () => {
        setSelectedVillageFilter(null);
        setSelectedFacilitatorFilter(null);
        setSearchQuery("");
        setShowFilterMenu(false);
        setShowVillageFilter(false);
        setShowFacilitatorFilter(false);
    };

    const toggleFilterMenu = () => {
        if (showFilterMenu || showVillageFilter || showFacilitatorFilter) {
            setShowFilterMenu(false);
            setShowVillageFilter(false);
            setShowFacilitatorFilter(false);
        } else {
            setShowFilterMenu(true);
        }
    };

    // ─── Sub-components ──────────────────────────────────────────────────────────

    const FilterMenu = () => {
        if (!showFilterMenu) return null;
        const hasActiveFilters = selectedVillageFilter || selectedFacilitatorFilter;

        return (
            <div
                ref={filterMenuRef}
                className="absolute top-10 right-0 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 min-w-56 max-h-96 overflow-y-auto"
            >
                {!showVillageFilter && !showFacilitatorFilter && (
                    <div className="py-3">
                        <button
                            onClick={() => setShowVillageFilter(true)}
                            className="w-full px-5 py-3 text-left hover:bg-gray-50 flex items-center justify-between rounded-xl mx-2"
                        >
                            <span>{t("Filter by village")}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setShowFacilitatorFilter(true)}
                            className="w-full px-5 py-3 text-left hover:bg-gray-50 flex items-center justify-between rounded-xl mx-2"
                        >
                            <span>{t("Filter by facilitator")}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        {hasActiveFilters && (
                            <>
                                <hr className="my-3" />
                                <button
                                    onClick={clearFilters}
                                    className="w-full px-5 py-3 text-left hover:bg-gray-50 text-red-600 rounded-xl mx-2"
                                >
                                    {t("Clear all filters")}
                                </button>
                            </>
                        )}
                    </div>
                )}

                {showVillageFilter && (
                    <div className="py-3">
                        <div className="px-5 py-3 bg-gray-50 flex items-center justify-between rounded-t-2xl">
                            <span className="font-medium text-base">{t("Select Village")}</span>
                            <button onClick={() => setShowVillageFilter(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        </div>
                        <div className="max-h-56 overflow-y-auto">
                            {getUniqueVillages().map((village) => (
                                <button
                                    key={village}
                                    onClick={() => {
                                        setSelectedVillageFilter(village);
                                        setShowFilterMenu(false);
                                        setShowVillageFilter(false);
                                    }}
                                    className={`w-full px-5 py-3 text-left hover:bg-gray-50 text-base rounded-xl mx-2 my-1 ${
                                        selectedVillageFilter === village ? "bg-blue-50 text-blue-600" : ""
                                    }`}
                                >
                                    {village}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {showFacilitatorFilter && (
                    <div className="py-3">
                        <div className="px-5 py-3 bg-gray-50 flex items-center justify-between rounded-t-2xl">
                            <span className="font-medium text-base">{t("Select Facilitator")}</span>
                            <button onClick={() => setShowFacilitatorFilter(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        </div>
                        <div className="max-h-56 overflow-y-auto">
                            {getUniqueFacilitators().map((facilitator) => (
                                <button
                                    key={facilitator}
                                    onClick={() => {
                                        setSelectedFacilitatorFilter(facilitator);
                                        setShowFilterMenu(false);
                                        setShowFacilitatorFilter(false);
                                    }}
                                    className={`w-full px-5 py-3 text-left hover:bg-gray-50 text-base rounded-xl mx-2 my-1 ${
                                        selectedFacilitatorFilter === facilitator ? "bg-blue-50 text-blue-600" : ""
                                    }`}
                                >
                                    {facilitator}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const PlanCard = ({ plan, isTest = false }) => (
        <div
            className={`border rounded-2xl p-4 transition-all ${
                isTest
                    ? selectedPlanId === plan.id
                        ? "border-red-600 bg-red-50"
                        : "border-red-500 hover:border-red-600"
                    : selectedPlanId === plan.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
            }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => handlePlanSelect(plan)}>
                    <div className="flex items-center">
                        <div className="flex-1">
                            <div className="flex items-center">
                                <h3 className="font-medium text-gray-900 mr-2">{plan.plan}</h3>
                                {selectedPlanId === plan.id && (
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                                {plan.village_name} • {plan.facilitator_name}
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowPlanDetails(plan);
                    }}
                    className="ml-3 p-1 hover:bg-gray-100 rounded-full"
                    title="View Details"
                >
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    );

    const StatusDot = ({ active }) => (
        <div className={`w-3 h-3 rounded-full mr-2 ${active ? "bg-green-500" : "bg-gray-300"}`} />
    );

    // ─── Project Selector View ────────────────────────────────────────────────────

    if (showProjectSelector && availableProjects.length > 1) {
        return (
            <BottomSheet
                open={isOpen}
                onDismiss={onClose}
                defaultSnap={({ maxHeight }) => maxHeight * 1.0}
                snapPoints={({ maxHeight }) => [maxHeight * 1.0]}
            >
                <div className="p-6 pb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">{t("Select Project")}</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-3">
                        {availableProjects.map((project) => (
                            <div
                                key={project.id}
                                onClick={() => handleProjectSelection(project)}
                                className="border border-gray-200 rounded-2xl p-4 cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{project.name}</h3>
                                        <p className="text-sm text-gray-600">{project.organization_name}</p>
                                    </div>
                                    <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                        {project.count} {t("plans")}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </BottomSheet>
        );
    }

    // ─── Plan Details View ────────────────────────────────────────────────────────

    if (showPlanDetails) {
        const p = showPlanDetails;
        return (
            <BottomSheet
                open={isOpen}
                onDismiss={() => setShowPlanDetails(null)}
                defaultSnap={({ maxHeight }) => maxHeight * 1.0}
                snapPoints={({ maxHeight }) => [maxHeight * 1.0]}
            >
                <div className="p-6 pb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">{t("Plan Details")}</h2>
                        <button onClick={() => setShowPlanDetails(null)} className="p-2 hover:bg-gray-100 rounded-full">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-blue-100 via-blue-50 to-purple-100 rounded-2xl p-6">
                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">{t("Organization")}</div>
                                    <div className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {p.organization_name || "—"}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">{t("Project")}</div>
                                    <div className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {p.project_name || t("No Project Assigned")}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">{p.plan}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="font-medium text-gray-600">{t("Plan ID")}:</span>
                                    <span className="ml-2 text-gray-900">{p.id}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600">{t("Village")}:</span>
                                    <span className="ml-2 text-gray-900">{p.village_name}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600">{t("Gram Panchayat")}:</span>
                                    <span className="ml-2 text-gray-900">{p.gram_panchayat}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600">{t("Facilitator")}:</span>
                                    <span className="ml-2 text-gray-900">{p.facilitator_name}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600">{t("Created By")}:</span>
                                    <span className="ml-2 text-gray-900">{p.created_by_name || "—"}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600">{t("Created At")}:</span>
                                    <span className="ml-2 text-gray-900">{formatDate(p.created_at)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-4">
                            <h4 className="font-medium text-gray-900 mb-3">{t("Status")}</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center">
                                    <StatusDot active={!!p.is_completed} />
                                    <span>{t("Plan Completed")}</span>
                                </div>
                                <div className="flex items-center">
                                    <StatusDot active={!!p.is_dpr_generated} />
                                    <span>{t("DPR Generated")}</span>
                                </div>
                                <div className="flex items-center">
                                    <StatusDot active={!!p.is_dpr_reviewed} />
                                    <span>{t("DPR Reviewed")}</span>
                                </div>
                                <div className="flex items-center">
                                    <StatusDot active={!!p.is_dpr_approved} />
                                    <span>{t("DPR Approved")}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4">
                            <h4 className="font-medium text-gray-900 mb-3">{t("Location Details")}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="font-medium text-gray-600">{t("State ID")}:</span>
                                    <span className="ml-2 text-gray-900">{p.state}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600">{t("District ID")}:</span>
                                    <span className="ml-2 text-gray-900">{p.district}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600">{t("Block ID")}:</span>
                                    <span className="ml-2 text-gray-900">{p.block}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600">{t("Tehsil ID")}:</span>
                                    <span className="ml-2 text-gray-900">{p.tehsil}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </BottomSheet>
        );
    }

    // ─── Main Plan List View ──────────────────────────────────────────────────────

    const { regularPlans, testPlans, hasTestPlans } = applyFilters(getPlansForProject());
    const hasActiveFilters = selectedVillageFilter || selectedFacilitatorFilter;

    return (
        <BottomSheet
            open={isOpen}
            onDismiss={onClose}
            defaultSnap={({ maxHeight }) => maxHeight * 1.0}
            snapPoints={({ maxHeight }) => [maxHeight * 1.0]}
        >
            <div className="p-6 pb-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        {/* Back to project selector — only if multiple projects */}
                        {availableProjects.length > 1 && (
                            <button
                                onClick={() => setShowProjectSelector(true)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                        <h2 className="text-xl font-semibold text-gray-900">{t("Select Plan")}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Selected project info card */}
                {selectedProject && (
                    <div className="bg-gradient-to-br from-blue-100 via-blue-50 to-purple-100 rounded-2xl p-6 mb-4">
                        <div className="space-y-3">
                            <div>
                                <div className="text-sm text-gray-600 mb-1">{t("Organization")}</div>
                                <div className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {selectedProject.organization_name}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 mb-1">{t("Project")}</div>
                                <div className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {selectedProject.name}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search + Filter row */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder={t("Search plans by name...")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoComplete="off"
                            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            data-filter-button
                            onClick={toggleFilterMenu}
                            className={`p-2 rounded-lg border transition-colors ${
                                hasActiveFilters
                                    ? "bg-blue-50 border-blue-200 text-blue-600"
                                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                            </svg>
                        </button>
                        <FilterMenu />
                    </div>
                </div>

                {/* Active filter chips */}
                {hasActiveFilters && (
                    <div className="mb-3 flex flex-wrap gap-2">
                        {selectedVillageFilter && (
                            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                <span>{t("Village")}: {selectedVillageFilter}</span>
                                <button onClick={() => setSelectedVillageFilter(null)} className="ml-2 hover:text-blue-900">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        {selectedFacilitatorFilter && (
                            <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                <span>{t("Facilitator")}: {selectedFacilitatorFilter}</span>
                                <button onClick={() => setSelectedFacilitatorFilter(null)} className="ml-2 hover:text-green-900">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Plan list */}
                {getPlansForProject().length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {t("No plans available.")}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {regularPlans.map((plan) => (
                            <PlanCard key={plan.id} plan={plan} />
                        ))}

                        {hasTestPlans && (
                            <>
                                <hr className="my-4 border-gray-300" />
                                <div className="mb-3">
                                    <h4 className="text-md font-semibold text-gray-900 mb-1">
                                        {t("Test Plans: For training and practice purposes")}
                                    </h4>
                                </div>
                                {testPlans.map((plan) => (
                                    <PlanCard key={plan.id} plan={plan} isTest />
                                ))}
                            </>
                        )}

                        {regularPlans.length === 0 && !hasTestPlans && (
                            <div className="text-center py-8 text-gray-500">
                                {t("No plans match the current filters.")}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </BottomSheet>
    );
};

export default OfflinePlanSheet;