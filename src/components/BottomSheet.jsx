import { BottomSheet } from 'react-spring-bottom-sheet'
import 'react-spring-bottom-sheet/dist/style.css'

import 'survey-core/survey-core.css';
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";

import useMainStore from "../store/MainStore.jsx";
import useLayersStore from '../store/LayerStore.jsx';

import nregaDetails from "../assets/nregaMapping.json"
import resourceDetails from "../assets/resource_mapping.json"
import SurfaceWaterBodies from './analyze/SurfaceWaterbodyAnalyze.jsx';
import GroundwaterAnalyze from './analyze/GroundwaterAnalyze.jsx';
import AgricultureAnalyze from './analyze/AgricultureAnalyze.jsx';
import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';


const Bottomsheet = () => {

    const { t } = useTranslation();
    const MainStore = useMainStore((state) => state);
    const LayerStore = useLayersStore((state) => state)
    const [sheetBody, setSheetBody] = useState(<>Nothing Here</>);
    const [editBody, setEditBody] = useState(<>Nothing Here</>);

    const FORM_NAME_MAPPING = {
        settlement: 'add_settlements',
        well: 'add_well',
        waterstructure: 'water_structure',
        cropping: 'cropping_pattern',
        recharge: 'recharge_structure',
        livelihood: 'livelihood',
        irrigation: 'irrigation_work',
        feedbackAgri: 'feedback_Agri',
        feedbackGW: 'feedback_Groundwater',
        feedbackSWB: 'feedback_surfacewaterbodies',
        maintainSWB: 'maintenance_rs_swb',
        maintainWB: 'maintenance_water_structures',
        maintainGW: 'maintenance_recharge_st',
        maintainAG: 'maintenance_irr'
    };

    const fetchFormSchema = async (formType) => {
        const formName = FORM_NAME_MAPPING[formType];
        
        if (!formName) {
            throw new Error(`Unknown form type: ${formType}`);
        }

        try {
            const response = await fetch(`http://localhost:3000/containers/${MainStore.containerName}/s3_data/${formName}.json`)
            if (!response.ok) {
                throw new Error(`Failed to fetch form: ${response.status} ${response.statusText}`);
            }

            const schema = await response.json();
            return schema;
        } catch (error) {
            console.error(`Error fetching form ${formName}:`, error);
            throw error;
        }
    };

    useEffect(() => {
        if (!(MainStore.isForm && MainStore.formUrl)) return;
    
        let cancelled = false;
        setSheetBody(<span>Loading form…</span>);

        // Fetch form schema from server
        const loadForm = async () => {
            try {
                const schema = await fetchFormSchema(MainStore.formUrl);
                
                if (cancelled) return; // Don't proceed if component unmounted

                const survey = new Model(schema);

                survey.data = {
                    Settlements_id: crypto.randomUUID().slice(0, 15),
                    well_id: crypto.randomUUID().slice(0, 15),
                    waterbodies_id: crypto.randomUUID().slice(0, 15),
                    corresponding_work_id: MainStore.selectedResource?.work_id || 
                                          MainStore.selectedResource?.wb_id || 
                                          MainStore.selectedResource?.UID || "",
                    work_id: crypto.randomUUID().slice(0, 15),
                    plan_id: MainStore.currentPlan.id,
                    plan_name: MainStore.currentPlan.plan,
                    GPS_point: {
                        latitude: MainStore.markerCoords[1],
                        longitude: MainStore.markerCoords[0],
                    },
                    block_name: MainStore.blockName,
                    beneficiary_settlement: MainStore.settlementName,
                    crop_Grid_id: MainStore.selectedResource?.id
                };

                survey.onComplete.add(surveyComplete);
                
                if (!cancelled) {
                    setSheetBody(<Survey model={survey} />);
                }
            } catch (err) {
                if (cancelled) return;
                console.error('Error loading form:', err);
                setSheetBody(
                    <span style={{ color: "#0047ab", fontWeight: "bold" }}>
                        Failed to load form: {err.message}
                    </span>
                );
            }
        };

        loadForm();

        return () => {
            cancelled = true; // guard against setState after unmount
        };
    }, [MainStore.isForm, MainStore.formUrl]);

    useEffect(() => {
        if (!(MainStore.isEditForm && MainStore.formEditData && MainStore.formEditType)) return;

        let cancelled = false;
        setEditBody(<span>Loading form…</span>);

        // Fetch form schema from server
        const loadEditForm = async () => {
            try {
                const schema = await fetchFormSchema(MainStore.formEditType);
                
                if (cancelled) return; // Don't proceed if component unmounted

                const survey = new Model(schema);

                survey.data = MainStore.formEditData;

                survey.onComplete.add(surveyComplete);
                
                if (!cancelled) {
                    setEditBody(<Survey model={survey} />);
                }
            } catch (err) {
                if (cancelled) return;
                console.error('Error loading edit form:', err);
                setEditBody(
                    <span style={{ color: "#0047ab", fontWeight: "bold" }}>
                        Failed to load form: {err.message}
                    </span>
                );
            }
        };

        loadEditForm();

        return () => {
            cancelled = true; // guard against setState after unmount
        };
    }, [MainStore.isEditForm, MainStore.formEditData, MainStore.formEditType]);

    const LayerStoreKeysGW = [
        "CLARTLayer"
    ]

    const LayerStoreKeysAgri = [
        "CLARTLayer", "LULCLayer"
    ]
    
    const ResourceMetaKeys = {
        "Bail" : "Livestock Census : Ox (बैल)",
        "Cattle" : "Livestock Census : Cattle",
        "Goats" : "Livestock Census : Goats",
        "Piggery" : "Livestock Census : Piggery",
        "Poultry" : "Livestock Census : Poultry",
        "Sheep" : "Livestock Census : Sheep",
        "big_farmers" : "Farmer Census : Big Farmers",
        "landless_farmers" : "Farmer Census : Landless Farmers",
        "marginal_farmers" : "Farmer Census : Marginal Farmers",
        "medium_farmers" : "Farmer Census : Medium Farmers",
        "small_farmers" : "Farmer Census : Small Farmers",
        "NREGA_applied" : "Households that have applied for NREGA Job cards",
        "NREGA_have_job_card" : "Households that have NREGA job cards",

        
        "select_one_Functional_Non_functional" : "Functional or not ?",
        "select_one_well_used" : "Used for Irrigation or Drinking ?",
        "select_one_well_used_other" : "Other usage",
        "select_one_change_water_quality" : "Water Quality",
        "select_one_water_structure_near_you" : "Any rainwater harvesting or groundwater recharge structures near your wells ?",
        "select_one_maintenance" : "Requires Maintainence", 
        "select_one_repairs_well" : "Type of Repair (if Maintainence required)",
        "select_one_repairs_well_other" : "Other type of Repair"
    }

    const layerStoreNameMapping = {
        "AdminBoundary" : "Admin Boundary",
        "NregaLayer" : "NREGA Layer",
        "WellDepth" : "Well Depth",
        "DrainageLayer" : "Drainage Layer",
        "SettlementLayer" : "Settlement Layer",
        "WellLayer" : "Well Layer",
        "WaterStructure" : "Water Structures",
        "WorkAgri" : "Irrigation Structures",
        "WorkGroundwater" : "Recharge Structures",
        "Livelihood" : "Livelihood",
        "CLARTLayer" : "CLART Layer",
        "LULCLayer" : "LULC Layer"
    }

    const layerStoreFuncMapping = {
        "AdminBoundary" : "setAdminBoundary",
        "NregaLayer" : "setNregaLayer",
        "WellDepth" : "setWellDepth",
        "DrainageLayer" : "setDrainageLayer",
        "SettlementLayer" : "setSettlementLayer",
        "WellLayer" : "setWellLayer",
        "WaterStructure" : "setWaterStructure",
        "WorkAgri" : "setWorkAgri",
        "WorkGroundwater" : "setWorkGroundwater",
        "Livelihood" : "setLivelihood",
        "CLARTLayer" : "setCLARTLayer",
        "LULCLayer" : "setLULCLayer"
    }

    const handleWorkdAdd = (work) => {
        let checked = MainStore.nregaWorks.includes(nregaDetails.workToNumMapping[work])
        let tempWorks
        
        if(!checked){
            tempWorks = [...MainStore.nregaWorks]
            tempWorks.push(nregaDetails.workToNumMapping[work])
        }
        else{
            tempWorks = MainStore.nregaWorks.filter((y) => y != nregaDetails.workToNumMapping[work]);
        }

        MainStore.setNregaWorks(tempWorks)

        let styleFillColor = ['match', ['get', 'itemColor']]
        
        tempWorks.map((item, idx) => {
            styleFillColor.push(item);
            styleFillColor.push(nregaDetails.NumToColorMapping[item])
        })

        styleFillColor.push('#00000000')

        if (tempWorks.length === 0) {
            styleFillColor = '#00000000'
        }

        let tempNregaStyle =  {
            filter: MainStore.nregaStyle.filter,
            'shape-points': MainStore.nregaStyle['shape-points'],
            'shape-radius': MainStore.nregaStyle['shape-radius'],
            'shape-fill-color': styleFillColor
        }

        MainStore.setNregaStyle(tempNregaStyle);
    }

    const nregaBody = (
        <>
            {/* Enhanced Title with cleaner styling */}
            <div className="text-center pt-8 pb-6 mb-8 bg-gradient-to-r border-b border-gray-200">
                <h1 className="text-2xl font-semibold text-gray-800 tracking-wide">
                    {t("NREGA Menu")}
                </h1>
            </div>
    
            <div className="px-6 pb-8">
                {/* Enhanced Work Categories Section */}
                <div className="mb-8">
                    <div className="flex items-center mb-6">
                        <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
                        <h2 className="text-lg font-medium text-gray-700">
                            {t("NREGA Work Categories")}
                        </h2>
                    </div>
    
                    {/* Improved button grid layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {nregaDetails.works.map((item, idx) => {
                            const color = [
                                nregaDetails.buttonColorMapping[item],
                                nregaDetails.buttonColorMapping.Default
                            ];
                            const isSelected = MainStore.nregaWorks.includes(nregaDetails.workToNumMapping[item]);
                            return (
                                <button
                                    key={idx}
                                    style={{
                                        backgroundColor: isSelected
                                            ? `rgba(${color[0].join(",")})`
                                            : ""
                                    }}
                                    className={`
                                        flex items-center justify-between p-4 rounded-lg border transition-all duration-200
                                        ${isSelected 
                                            ? 'border-gray-400 shadow-md transform scale-[1.02]' 
                                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                        }
                                        bg-white text-gray-700 font-medium text-sm text-left
                                        focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300
                                    `}
                                    onClick={() => handleWorkdAdd(item)}
                                >
                                    <div className="flex items-center">
                                        {/* Color indicator dot */}
                                        <div 
                                            className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                                            style={{ backgroundColor: `rgba(${color[0].join(",")})` }}
                                        ></div>
                                        <span className="leading-tight">
                                            {t(nregaDetails.properWorkNames[idx])}
                                        </span>
                                    </div>
                                    
                                    {/* Selection indicator */}
                                    {isSelected && (
                                        <svg className="w-4 h-4 text-gray-600 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
    
                {/* Enhanced NREGA Work Years Section */}
                {/* <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center mb-6">
                        <div className="w-1 h-6 bg-green-500 rounded-full mr-3"></div>
                        <h2 className="text-lg font-medium text-gray-700">
                            NREGA Work Years
                        </h2>
                    </div>
    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {MainStore.allNregaYears.map((year, idx) => {
                            const isChecked = MainStore.selectNregaYears.includes(year);
                            return (
                                <label 
                                    key={idx} 
                                    className={`
                                        flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200
                                        ${isChecked 
                                            ? 'bg-blue-50 border-blue-200 shadow-sm' 
                                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleYearAdd(year)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mr-3"
                                    />
                                    <span className={`text-sm font-medium ${isChecked ? 'text-blue-700' : 'text-gray-700'}`}>
                                        {year}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div> */}
            </div>
        </>
    )

    const metaDataBody = (
        <>
            <div className="sticky top-12 z-10 bg-white text-center pt-8 text-xl font-bold text-gray-800 border-b border-gray-300 shadow-md pb-2 mb-6">
            {t("Asset Info")}
            </div>

            <div className="pt-8 px-4 pb-6">
                <div className="w-full max-w-4xl mx-auto">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {MainStore.isMetadata && MainStore.metadata !== null && Object.keys(nregaDetails.NameDisplayMapping).map((key, index) => {
                            const rawValue = MainStore.metadata[key];
                            const formattedValue =
                            key === 'Material' || key === 'Total_Expe'
                                ? `₹${rawValue}`
                                : rawValue;

                            return (
                            <div
                                key={key}
                                className={`flex items-center min-h-[3rem] ${
                                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                } hover:bg-blue-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0`}
                            >
                                <div className="flex-1 px-4 py-3 bg-gray-100 border-r border-gray-200">
                                    <span className="text-sm font-semibold text-gray-700 tracking-wide">
                                        {nregaDetails.NameDisplayMapping[key]}
                                    </span>
                                </div>
                                <div className="flex-1 px-4 py-3">
                                    <span className="text-sm text-gray-800 font-medium">
                                        {formattedValue}
                                    </span>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    )

    const resourceBody = (
        <>
        <div className="sticky top-12 z-10 bg-white text-center pt-8 text-xl font-bold text-gray-800 border-b border-gray-300 shadow-md pb-2 mb-6">
            {t("Resource Info")}
        </div>

        <div className="pt-8 px-4 pb-6">
            <div className="w-full max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {MainStore.isResource && MainStore.selectedResource !== null &&
                        Object.keys(resourceDetails[MainStore.resourceType]).flatMap((key, index) => {
                        let rawValue = MainStore.selectedResource[key];
                        
                        if (rawValue && (key === "Livestock_" || key === "farmer_fam" || key === "Well_condi")) {
                            const jsonReady = rawValue.replace(/'/g, '"').replace(/\bNone\b/g, 'null');
                            const data = (new Function(`return (${jsonReady})`))();

                            return Object.keys(data).map((innerKey, innerIndex) => (
                            <div
                                key={innerKey}
                                className={`flex items-center min-h-[3rem] ${
                                    (index + innerIndex) % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                } hover:bg-blue-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0`}
                            >
                                <div className="flex-1 px-4 py-3 bg-gray-100 border-r border-gray-200">
                                    <span className="text-sm font-semibold text-gray-700 tracking-wide">
                                        {ResourceMetaKeys[innerKey]}
                                    </span>
                                </div>
                                <div className="flex-1 px-4 py-3">
                                    <span className="text-sm text-gray-800 font-medium">
                                        {data[innerKey] ?? "—"}
                                    </span>
                                </div>
                            </div>
                            ));
                        }
                        else if(rawValue && (key === "MNREGA_INF" || key === "Well_usage")){

                            const keys = ["NREGA_applied", "NREGA_have_job_card", "select_one_Functional_Non_functional", "select_one_well_used", 
                                "select_one_change_water_quality", "select_one_water_structure_near_you"];
                            const extracted = {};

                            for (const key of keys) {
                                //  String.raw lets us write \s, \n, etc. without escaping the \
                                const pattern = new RegExp(
                                    String.raw`['"]${key}['"]\s*:\s*([^,}\n\r]+)`,
                                    "i"
                                );

                                const match = rawValue.match(pattern);
                                if (!match) continue;

                                let value = match[1].trim();
                                if (value === "None") {
                                    value = null;
                                } else if (/^['"]/.test(value)) {
                                    value = value.replace(/^['"]|['"]$/g, "");
                                } else if (/^\d+(\.\d+)?$/.test(value)) {
                                    value = Number(value);
                                }
                                extracted[key] = value;
                            }

                            // --- 2.  display them --------------------------------------------------------
                            return Object.keys(extracted).map((item, idx) => {
                                <div
                                    key={item}
                                    className={`flex items-center min-h-[3rem] ${
                                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                                    } hover:bg-blue-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0`}
                                >
                                    <div className="flex-1 px-4 py-3 bg-gray-100 border-r border-gray-200">
                                        <span className="text-sm font-semibold text-gray-700 tracking-wide">
                                            {ResourceMetaKeys[item]}
                                        </span>
                                    </div>
                                    <div className="flex-1 px-4 py-3">
                                        <span className="text-sm text-gray-800 font-medium">
                                            {extracted[item] ?? "—"}
                                        </span>
                                    </div>
                                </div>
                            });
                        }
                        if(rawValue !== null){
                            return (
                                <div
                                    key={key}
                                    className={`flex items-center min-h-[3rem] ${
                                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                    } hover:bg-blue-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0`}
                                >
                                    <div className="flex-1 px-4 py-3 bg-gray-100 border-r border-gray-200">
                                        <span className="text-sm font-semibold text-gray-700 tracking-wide">
                                            {resourceDetails[MainStore.resourceType][key]}
                                        </span>
                                    </div>
                                    <div className="flex-1 px-4 py-3">
                                        <span className="text-sm text-gray-800 font-medium">
                                        {rawValue || "—"}
                                        </span>
                                    </div>
                                </div>
                                );
                            }
                        })}
                </div>
            </div>
        </div>
        </>

    )

    const LayerStoreBody = (
        <>
        <div className="sticky top-0 z-20 bg-white text-center text-xl font-bold text-gray-800 border-b border-gray-300 shadow-md pb-3 mb-5">
            <div className="text-xl font-bold text-gray-800">Layers Store</div>
            <div className="text-sm text-gray-600 font-normal mt-1">
                {MainStore.currentScreen === 'Groundwater' ? 'Groundwater Layers' : 'Agriculture Layers'}
            </div>
        </div>
        
        {MainStore.currentScreen === 'Groundwater' && <div className="grid grid-cols-2 gap-4 p-1">
            {LayerStoreKeysGW.map((key) => (
            <button
                key={key}
                onClick={() => {
                    LayerStore[layerStoreFuncMapping[key]](!LayerStore[key])
                    MainStore.setLayerClicked(key)
                }}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm hover:shadow-md
                ${LayerStore[key]
                    ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }
                `}
            >
                <div className="flex items-center justify-center space-x-2">
                    {LayerStore[key] && (
                        <span className="w-2 h-2 bg-white rounded-full flex-shrink-0"></span>
                    )}
                    <span className="text-center leading-tight">
                        {layerStoreNameMapping[key]}
                    </span>
                </div>
            </button>
            ))}
        </div>}
    
        {MainStore.currentScreen === 'Agriculture' && <div className="grid grid-cols-2 gap-4 p-1">
            {LayerStoreKeysAgri.map((key) => (
            <button
                key={key}
                onClick={() => {
                    LayerStore[layerStoreFuncMapping[key]](!LayerStore[key])
                    MainStore.setLayerClicked(key)
                }}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm hover:shadow-md
                ${LayerStore[key]
                    ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }
                `}
            >
                <div className="flex items-center justify-center space-x-2">
                    {LayerStore[key] && (
                        <span className="w-2 h-2 bg-white rounded-full flex-shrink-0"></span>
                    )}
                    <span className="text-center leading-tight">
                        {layerStoreNameMapping[key]}
                    </span>
                </div>
            </button>
            ))}
        </div>}
    
        </>
    )

    const surveyComplete = (sender) => {
        if(MainStore.isForm){
            const formData = sender.data;

            if(MainStore.formUrl === "settlement" && formData.Settlements_name !== null && formData.Settlements_name !== ""){
                MainStore.setSettlementName(formData.Settlements_name)
            }

            const submissions = JSON.parse(localStorage.getItem(MainStore.currentPlan.id) || '{}');

            if(submissions[MainStore.formUrl] === undefined){
                submissions[MainStore.formUrl] = []
            }

            submissions[MainStore.formUrl].push(formData)

            const arrayString = JSON.stringify(submissions);

            localStorage.setItem(MainStore.currentPlan.id, arrayString);

            MainStore.setFormData(submissions)

            MainStore.setIsSubmissionSuccess(true)
        }

        if(MainStore.isEditForm){
            const formData = sender.data

            const submissions = JSON.parse(localStorage.getItem(MainStore.currentPlan.id));

            let changeIdx = -1

            let compareKey = null

            if(MainStore.formEditType === "settlement"){compareKey = "Settlements_id"}
            else if(MainStore.formEditType === "well"){compareKey = "well_id"}
            else if(MainStore.formEditType === "waterstructure"){compareKey = "waterbodies_id"}
            else if(MainStore.formEditType === "recharge"){compareKey = "Corresponding_Work_ID"}

            submissions[MainStore.formEditType].map((item, idx) => {
                if(item[compareKey] === formData[compareKey]){
                    changeIdx = idx
                }
            })

            submissions[MainStore.formEditType][changeIdx] = formData

            const arrayString = JSON.stringify(submissions);

            localStorage.setItem(MainStore.currentPlan.id, arrayString);

            MainStore.setFormData(submissions)
        }

        onDismiss();

    };

    const onDismiss = () => {

        MainStore.setIsForm(false)

        MainStore.setNregaSheet(false)

        MainStore.setIsMetadata(false)

        MainStore.setIsResource(false)

        MainStore.setIsWaterBody(false)

        MainStore.setIsEditForm(false)

        MainStore.setIsGroundWater(false)


        MainStore.setIsAgriculture(false)

        MainStore.setIsLayerStore(false)

        MainStore.setIsResourceOpen(false)
        MainStore.setIsOpen(false)
    }


    const renderBody = () => {
        switch (true) {
          case MainStore.isForm && MainStore.formUrl !== "":
           return sheetBody
           
          case MainStore.isEditForm && MainStore.formEditType !== null:
           return editBody
    
          case MainStore.isNregaSheet:
            return nregaBody;
    
          case MainStore.isMetadata && MainStore.metadata !== null:
            return metaDataBody;
    
          case MainStore.isResource && MainStore.selectedResource !== null:
            return resourceBody;
    
          case MainStore.isWaterbody:
            return <SurfaceWaterBodies />;
    
          case MainStore.isGroundWater:
            return <GroundwaterAnalyze />;
    
          case MainStore.isAgriculture && MainStore.currentStep === 0:
            return <AgricultureAnalyze />;
            
          case MainStore.isLayerStore:
            return LayerStoreBody

          default:
            return null;
        }
    };
    

    return (
        <BottomSheet
        open={MainStore.isOpen || (MainStore.isResourceOpen && MainStore.currentScreen === "HomeScreen")}
        onDismiss={onDismiss}
        snapPoints={({ maxHeight }) =>
          MainStore.isLayerStore ? [maxHeight / 2] : [maxHeight]
            }
        >
            <button
            onClick={onDismiss}
            className="
                absolute right-3 top-3 z-10
                w-8 h-8 flex items-center justify-center
                rounded-full bg-gray-200 hover:bg-gray-300
                text-gray-600 hover:text-gray-800
                shadow-sm transition
            "
            aria-label="Close"
            >
            <svg 
              className="w-3.5 h-3.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
            </button>
            <div className="pt-6">
            {renderBody()}
            </div>
        </BottomSheet>
    )
}

export default Bottomsheet