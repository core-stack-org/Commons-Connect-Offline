import { create } from "zustand";

const useMainStore = create((set) => ({
    //? Default Store
    isInfoOpen : false,
    menuOption : null,

    setIsInfoOpen : (stat) => set({isInfoOpen : stat}),
    setMenuOption : (stat) => set({menuOption : stat}),

    //? Location Store
    districtName : null,
    blockName : null,
    block_id : null,
    isGPSClick : false,
    gpsLocation : null,
    layerClicked : null,
    containerName : null,
    zoomLat : null,
    zoomLong : null,

    setContainerName : (name) => set({containerName : name}),
    setDistrictName : (name) => set({districtName : name}),
    setBlockName : (name) => set({blockName : name}),
    setBlockId : (id) => set({block_id : id}),
    setIsGPSClick : (stat) => set({isGPSClick : stat}),
    setGpsLocation : (stat) => set({gpsLocation : stat}),
    setLayerClicked : (stat) => set({layerClicked : stat}),
    setZoomLat : (stat) => set({zoomLat : stat}),
    setZoomLong : (stat) => set({zoomLong : stat}),

    // MARK:- Offline Plans Store
    currentPlan : null,
    plans : null,
    formData : null,
    isEditForm : false,
    formEditData : null,
    formEditType : null,
    fetchPlans : async(plansData) => {
        console.log("In offline mode - loading plans from localStorage");
        try {
            const parsedData = JSON.parse(decodeURIComponent(plansData));
            if (parsedData && parsedData.plans) {
                set({ plans: parsedData.plans });
                console.log('Successfully loaded plans from localStorage');
            }
        }catch(err){
            console.error('Error loading plans from localStorage:', err);
        }
    },
    // fetchPlans : async(url) => {
    //     try{
    //         let response = await fetch(url, {
    //                 method: "GET",
    //                 headers: {
    //                     "ngrok-skip-browser-warning": "1",
    //                     "Content-Type": "application/json",
    //                 }
    //             }
    //         )
    //         response = await response.json()

    //         //console.log(response)
    //         set({plans : response.plans})
    //     }
    //     catch(e){
    //         console.log("Not able to Fetch Plans !")
    //     }
    // },
    setCurrentPlan : (id) => set((state) => ({currentPlan : id})),
    setFormData : (data) => set((state) => ({formData : data})),
    setIsEditForm : (data) => set((state) => ({isEditForm : data})),
    setFormEditData : (data) => set((state) => ({formEditData : data})),
    setFormEditType : (data) => set((state) => ({formEditType : data})),

    //? Layers Hooks
    currentScreen : "HomeScreen",
    currentStep : 0,
    settlementName : "",
    isFeatureClicked : false,
    isMarkerPlaced : false,
    markerCoords : null,
    selectedResource : null,
    fortnightData : null,
    lulcYearIdx : 0,
    isWaterbody : false,
    isGroundWater : false,
    isAgriculture : false,
    selectedMWSDrought : null,
    selectWellDepthYear : '2017_22',

    setSettlementName : (stat) => set({settlementName : stat}),
    setMarkerPlaced : (stat) => set({isMarkerPlaced : stat}),
    setFeatureStat : (stat) => set({isFeatureClicked : stat}),
    setCurrentScreen : (screen) => set({currentScreen : screen}),
    setCurrentStep : (step) => set({currentStep : step}),
    setFortnightData : (stat) => set({fortnightData : stat}),
    setSelectedResource : (stat) => set({selectedResource : stat}),
    setMarkerCoords : (stat) => set({markerCoords : stat}),
    setLulcYearIdx : (stat) => set({lulcYearIdx : stat}),
    setIsWaterBody : (stat) => set({isWaterbody : stat}),
    setIsGroundWater : (stat) => set({isGroundWater : stat}),
    setSelectedMwsDrought : (stat) => set({selectedMWSDrought : stat}),
    setIsAgriculture : (stat) => set({isAgriculture : stat}),
    setSelectedWellDepthYear : (stat) => set({selectWellDepthYear : stat}),

    //? NREGA Hooks
    isNregaSheet : false,
    allNregaYears : [],
    selectNregaYears : [2018],
    nregaWorks : [],
    nregaStyle : {
        filter: ['in', ['get', 'workYear'], [2018]],
        'shape-points': 12,
        'shape-radius': 8,
        'shape-fill-color':'#00000000',
    },

    setNregaSheet : (stat) => set({isNregaSheet : stat}),
    setAllNregaYears : (years) => set({allNregaYears : years}),
    setNregaYears : (years) => set({selectNregaYears : years}),
    setNregaWorks : (works) => set({nregaWorks : works}),
    setNregaStyle : (style) => set({nregaStyle : style}),

    
    //? Bottomsheet Hooks
    isOpen : false,
    isResourceOpen : false,
    isForm : false,
    isMetadata : false,
    metadata : null,
    formUrl : "",
    isLoading : false,
    isSubmissionSuccess : false,
    isResource : false,
    resourceType : null,
    isAnalyze : false,
    isLayerStore : false,

    setIsOpen : (stat) => set({isOpen : stat}),
    setIsForm : (stat) => set({isForm : stat}),
    setIsMetadata: (stat) => set({isMetadata : stat}),
    setIsResource: (stat) => set({isResource : stat}),
    setResourceType: (stat) => set({resourceType : stat}),
    setMetadata: (stat) => set({metadata : stat}),
    setFormUrl : (stat) => set({formUrl : stat}),
    setIsLoading : (stat) => set({isLoading : stat}),
    setIsSubmissionSuccess : (stat) => set({isSubmissionSuccess : stat}),
    setIsAnalyze : (stat) => set({isAnalyze : stat}),
    setIsLayerStore : (stat) => set({isLayerStore : stat}),
    setIsResourceOpen : (stat) => set({isResourceOpen : stat}),
}))

export default useMainStore;