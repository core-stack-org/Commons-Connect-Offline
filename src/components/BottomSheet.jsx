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

//? Forms Imports
import settlementForm from "../templates/add_settlements.json"
import wellForm from "../templates/add_well.json"
import WaterStructureForm from "../templates/water_structure.json"
import croppingForm from "../templates/cropping_pattern.json"
import rechargeStructure from "../templates/recharge_structure.json"

const Bottomsheet = () => {

    const { t } = useTranslation();
    const MainStore = useMainStore((state) => state);
    const LayerStore = useLayersStore((state) => state)
    const [sheetBody, setSheetBody] = useState(<>Nothing Here</>);
    let flg = false

    useEffect(() => {
        if (!(MainStore.isForm && MainStore.formUrl)) return;
    
        let cancelled = false;
        setSheetBody(<span>Loading form…</span>);

        let schema = null
        
        if(MainStore.formUrl === "settlement"){ schema = settlementForm}
        else if(MainStore.formUrl === "well"){ schema = wellForm }
        else if(MainStore.formUrl === "waterstructure"){ schema = WaterStructureForm}
        else if(MainStore.formUrl === "cropping"){ schema = croppingForm }
        else if(MainStore.formUrl === "recharge"){ schema = rechargeStructure }

        try{
            const survey = new Model(schema);

            survey.data = {
              Settlements_id:  crypto.randomUUID().slice(0, 15),
              well_id:         crypto.randomUUID().slice(0, 15),
              waterbodies_id:  crypto.randomUUID().slice(0, 15),
              plan_id:         MainStore.currentPlan.plan_id,
              plan_name:       MainStore.currentPlan.plan,
              GPS_point: {
                latitude:  MainStore.markerCoords[1],
                longitude: MainStore.markerCoords[0],
              },
              block_name:             MainStore.blockName,
              beneficiary_settlement: MainStore.settlementName,
              Corresponding_Work_ID:  "random",
              crop_Grid_id : MainStore.selectedResource?.id
            };

            survey.onComplete.add(surveyComplete);
            setSheetBody(<Survey model={survey} />);

        }catch(err){
            if (cancelled) return;
            console.error(err);
            setSheetBody(
              <span style={{ color: "#0047ab", fontWeight: "bold" }}>
                Failed to load form: {err.message}
              </span>
            );
        }
        return () => {
          cancelled = true; // guard against setState after unmount
        };
    }, [MainStore.isForm, MainStore.formUrl]);
    
    const LayerNameMapping = {
        0 : "settlement_layer",
        1 : "well_layer",
        2 : "waterbody_layer",
        3 : "cropgrid_layer"
    }
    
    const ResourceMapping = {
        0 : "settlement",
        1 : "well",
        2 : "waterbody",
        3 : "cropgrid"
    }

    const PlanningResource = {
        "Agriculture" : "plan_agri",
        "Groundwater" : "plan_gw",
        "Livelihood" : "livelihood"
    }

    const LayerStoreKeysGW = [
        "AdminBoundary", "NregaLayer", "WellDepth", "DrainageLayer",
        "SettlementLayer", 
        "WellLayer", "WaterStructure",
        "WorkGroundwater", "CLARTLayer"
    ]

    const LayerStoreKeysAgri = [
        "AdminBoundary", "NregaLayer", "DrainageLayer",
        "SettlementLayer", 
        "WellLayer", "WaterStructure",
        "WorkAgri", "CLARTLayer", "LULCLayer"
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
        "select_one_Functional_Non_functional" : "Functional or not ?",
        "select_one_well_used" : "Used for Irrigation or Drinking ?",
        "select_one_well_used_other" : "Other usage",
        "select_one_change_water_quality" : "Water Quality",
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

    // const handleOnLoadEvent = async() => {
    //     if(flg){
    //         if (MainStore.currentScreen === "Resource_mapping"){
    //             try{
    //                 MainStore.setIsLoading(true)
    //                 const payload = {
    //                     layer_name: LayerNameMapping[MainStore.currentStep],
    //                     resource_type: ResourceMapping[MainStore.currentStep],
    //                     plan_id: MainStore.currentPlan.plan_id,
    //                     plan_name: MainStore.currentPlan.plan,
    //                     district_name: MainStore.districtName,
    //                     block_name: MainStore.blockName,
    //                 }

    //                 const response = await fetch(`${import.meta.env.VITE_API_URL}add_resources/`, {
    //                     method: 'POST',
    //                     headers: {
    //                         'Content-Type': 'application/json'
    //                     },
    //                     body: JSON.stringify(payload)
    //                 })

    //                 const res = await response.json()

    //                 MainStore.setIsLoading(false)

    //                 if (res.message === "Success") {
    //                     MainStore.setIsSubmissionSuccess(true)
    //                 }
    //                 onDismiss()

    //             }catch(err){
    //                 console.log(err)
    //             }
    //         }
    //         else{
    //             try{
    //                 MainStore.setIsLoading(true)
    //                 const payload = {
    //                     layer_name: "planning_layer",
    //                     work_type: PlanningResource[MainStore.currentScreen],
    //                     plan_id: MainStore.currentPlan.plan_id,
    //                     plan_name: MainStore.currentPlan.plan,
    //                     district_name: MainStore.districtName,
    //                     block_name: MainStore.blockName,
    //                 }
    //                 console.log(payload)
    //                 const response = await fetch(`${import.meta.env.VITE_API_URL}add_works/`, {
    //                     method: 'POST',
    //                     headers: {
    //                         'Content-Type': 'application/json'
    //                     },
    //                     body: JSON.stringify(payload)
    //                 })

    //                 const res = await response.json()

    //                 MainStore.setIsLoading(false)

    //                 console.log(res)

    //                 if (res.message === "Success") {
    //                     MainStore.setIsSubmissionSuccess(true)
    //                 }
    //                 onDismiss()
    //             }
    //             catch(err){
    //                 console.log(err)
    //             }
    //         }
    //         flg = false;
    //     }
    //     else{
    //         flg = true
    //     }
    // }

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
            <div className="sticky top-0 z-20 bg-white text-center pt-8 text-xl font-bold text-gray-800 border-b border-gray-300 shadow-md pb-2 mb-6">
            {t("Asset Info")}
            </div>

            <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg ring-1 ring-gray-200">
                <table className="w-full table-auto border-separate border-spacing-y-3">
                    <tbody>
                    {MainStore.isMetadata && MainStore.metadata !== null && Object.keys(nregaDetails.NameDisplayMapping).map((key) => {
                        const rawValue = MainStore.metadata[key];
                        const formattedValue =
                        key === 'Material' || key === 'Total_Expe'
                            ? `₹${rawValue}`
                            : rawValue;

                        return (
                        <tr
                            key={key}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            <td className="px-6 py-4 font-bold text-gray-900 break-words text-md">
                            {nregaDetails.NameDisplayMapping[key]}
                            </td>
                            <td className="px-6 py-4 text-gray-600 break-words text-md">
                            {formattedValue}
                            </td>
                        </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </>
    )

    const resourceBody = (
        <>
        <div className="sticky top-0 z-20 bg-white text-center pt-8 text-xl font-bold text-gray-800 border-b border-gray-300 shadow-md pb-2 mb-6">
            {t("Resource Info")}
        </div>

        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg ring-1 ring-gray-200">
        <tbody>
            {MainStore.isResource && MainStore.selectedResource !== null &&
                Object.keys(resourceDetails[MainStore.resourceType]).flatMap(key => {
                let rawValue = MainStore.selectedResource[key];

                if (rawValue && (key === "Livestock_" || key === "farmer_fam" || key === "Well_condi")) {
                    const jsonReady = rawValue.replace(/'/g, '"').replace(/\bNone\b/g, 'null');
                    const data = (new Function(`return (${jsonReady})`))();

                    return Object.keys(data).map(innerKey => (
                    <tr
                        key={innerKey}
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                        {/* ⬇️ add grey background to the leftmost cell */}
                        <td className="px-6 py-4 font-bold text-gray-900 break-words text-md bg-gray-50 rounded-l-lg">
                        {ResourceMetaKeys[innerKey]}
                        </td>
                        <td className="px-6 py-4 text-gray-600 break-words text-md">
                        {data[innerKey] ?? "—"}
                        </td>
                    </tr>
                    ));
                }

                return (
                    <tr
                    key={key}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                    {/* ⬇️ same tweak here */}
                    <td className="px-6 py-4 font-bold text-gray-900 break-words text-md bg-gray-50 rounded-l-lg">
                        {resourceDetails[MainStore.resourceType][key]}
                    </td>
                    <td className="px-6 py-4 text-gray-600 break-words text-md">
                        {rawValue ?? "—"}
                    </td>
                    </tr>
                );
                })}
            </tbody>
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
                    console.log("IN BOTTOM SHEET")
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
        const formData = sender.data;

        const submissions = JSON.parse(localStorage.getItem(MainStore.currentPlan.plan_id) || '{}');

        if(submissions[MainStore.formUrl] === undefined){
            submissions[MainStore.formUrl] = []
        }
        
        submissions[MainStore.formUrl].push(formData)

        const arrayString = JSON.stringify(submissions);

        localStorage.setItem(MainStore.currentPlan.plan_id, arrayString);

        MainStore.setIsSubmissionSuccess(true)

        onDismiss();

    };

    const onDismiss = () => {

        MainStore.setIsForm(false)

        MainStore.setNregaSheet(false)

        MainStore.setIsMetadata(false)

        MainStore.setIsResource(false)

        MainStore.setIsWaterBody(false)


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
            &times;
            </button>
            <div className="pt-6">
            {renderBody()}
            </div>
        </BottomSheet>
    )
}

export default Bottomsheet