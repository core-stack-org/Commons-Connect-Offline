import { useEffect } from "react";
import useMainStore from "../store/MainStore.jsx";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from 'react-hot-toast';

const Groundwater = () => {

    const STATE_MACHINE = {
        1: {
          Screen : "analyze",
        },
        2: {
          Screen : "add_maintain"
        }
    };

    const { t } = useTranslation();
    const MainStore = useMainStore((state) => state);
    const navigate = useNavigate();

    useEffect(() =>{
      MainStore.setMarkerPlaced(false)
        const handleBackButton = () => {
          let BACK = MainStore.currentStep - 1
  
          if(MainStore.currentStep){
            MainStore.setCurrentStep(BACK)
          }
        }
  
        if(MainStore.currentStep > 0)
          window.history.pushState(null, "", `#${STATE_MACHINE[MainStore.currentStep].Screen}`)
  
        window.addEventListener("popstate", handleBackButton);
  
        return () => {
          window.removeEventListener("popstate", handleBackButton);
        };
  
    },[MainStore.currentStep])

    const toggleFormsUrl = (type) =>{
      if(MainStore.markerCoords){
        MainStore.setIsForm(true)
        MainStore.setFormUrl(type)
        MainStore.setIsOpen(true)
      }
    }

    const handleAnalyze = () =>{
      MainStore.setIsGroundWater(true)
      MainStore.setIsOpen(true)
    }

    const handleAssetInfo = () => {
      MainStore.setIsOpen(true)
    }

    const getPlanLabel = () => {
      const plan = MainStore.currentPlan?.plan ?? "Select Plan";
    
      // Helper function to capitalize each word
      const capitalizeWords = (str) => {
        return str.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
      };
    
      const words = plan.trim().split(/\s+/);
      if (words.length > 15) {
        return capitalizeWords(words.slice(0, 15).join(' ') + '…');
      }
      return capitalizeWords(plan);
    };

    const handleStartPlanning = () => {
        MainStore.setCurrentStep(1);
        toast(t("toast_groundwater"), {
            duration: 5000,
            style: {
                background: '#ffffff',
                color: '#000000',
                borderRadius: '20px',
                padding: '10px',
                fontSize: '14px',
                fontFamily: 'Inter',
                fontWeight: '400',
                textAlign: 'left',
                lineHeight: '1.5',
            },
        });
    };

    return(
        <>
            {/* Title Bubble */}
            <div className="absolute top-4 left-0 w-full px-4 z-10 pointer-events-none">
                <div className="relative w-full max-w-lg mx-auto flex items-center">
                    <div className="flex-1 px-6 py-3 text-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-extrabold text-md shadow-md">
                        {t("GroundWater")}
                    </div>
                </div>
            </div>
                  {/* 2. Top-left buttons */}
            <div className="absolute top-20 left-0 w-full px-4 z-10 flex justify-start pointer-events-auto">
              <div className="flex gap-4 max-w-lg">
                <div className="flex flex-col gap-3">
                    {/* GPS Button */}
                    <button
                    className="flex-shrink-0 w-9 h-9 rounded-md shadow-sm flex items-center justify-center"
                    style={{
                        backgroundColor: '#D6D5C9',
                        color: '#592941',
                        border: 'none',
                        backdropFilter: 'none',
                    }}
                    onClick={() => {}}
                    >
                    <svg viewBox="-16 0 130 130" xmlns="http://www.w3.org/2000/svg">
                      <ellipse cx="50" cy="130" rx="18" ry="6" fill="#00000010" />
                      <path d="M50 20 C70 20 85 35 85 55 C85 75 50 110 50 110 C50 110 15 75 15 55 C15 35 30 20 50 20 Z" 
                            fill="#592941" 
                            stroke="#592941" 
                            strokeWidth="1.5"/>
                      <circle cx="50" cy="55" r="16" fill="#FFFFFF" stroke="#1E40AF" strokeWidth="1.5"/>
                      <circle cx="50" cy="55" r="6" fill="#592941"/>
                      <ellipse cx="46" cy="38" rx="6" ry="10" fill="#FFFFFF25" />
                    </svg>
                    </button>

                    <button
                        className="w-9 h-9 rounded-md shadow-sm flex items-center justify-center"
                        style={{ backgroundColor: '#D6D5C9', color: '#592941', border: 'none' }}
                        onClick={() => MainStore.setIsInfoOpen(true)}
                    >
                        <svg viewBox="-16 0 130 100" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="40" fill="#592941" stroke="#592941" strokeWidth="2"/>

                        <circle cx="50" cy="50" r="36" fill="#592941"/>

                        <circle cx="50" cy="35" r="4" fill="#FFFFFF"/>

                        <rect x="46" y="45" width="8" height="25" rx="4" fill="#FFFFFF"/>

                        <ellipse cx="42" cy="42" rx="8" ry="12" fill="#FFFFFF20"/>
                      </svg>
                    </button>
                </div>

                    {/* Plan selector with dropdown */}
                <div className="relative">
                      <button
                          className="flex-1 px-3 py-2 rounded-xl shadow-sm text-sm"
                          style={{
                          backgroundColor: '#D6D5C9',
                          color: '#592941',
                          border: 'none',
                          backdropFilter: 'none',
                          }}
                      >
                          {getPlanLabel()}
                      </button>
                      
                      <button
                          className="flex-1 px-3 py-2 rounded-xl shadow-sm text-sm ml-2"
                          style={{
                            backgroundColor: '#D6D5C9',
                            color: '#592941',
                            border: 'none',
                            backdropFilter: 'none',
                          }}
                          onClick={() =>{
                            MainStore.setFeatureStat(false)
                            MainStore.setIsResource(false)
                            MainStore.setIsGroundWater(false)
                            MainStore.setIsLayerStore(true)
                            MainStore.setIsOpen(true)
                          }}
                      >
                          {"Layers"}
                      </button>
                </div>
              </div>
            </div>

            {/* 3. WellDepth Toggle button - Hide when planning starts */}
            {MainStore.currentStep === 0 && (
                <div className="absolute top-31.5 left-13 w-full px-4 z-10 flex justify-start pointer-events-auto">
                    <div className="flex gap-4 max-w-lg">
                      <div 
                        className={`relative inline-flex rounded-xl pb-0.5 pt-0.5`}
                        style={{ backgroundColor: '#D6D5C9' }}
                      >
                        {/* Sliding white pill background */}
                        <div
                          className="absolute top-0.5 rounded-xl bg-white shadow-sm transition-transform duration-300 ease-in-out"
                          style={{
                            height: 'calc(100% - 4px)',
                            width: '50%',
                            transform: MainStore.selectWellDepthYear === '2018_23' ? 'translateX(100%)' : 'translateX(0%)',
                          }}
                        />
                        
                        <button
                          type="button"
                          onClick={() => MainStore.setSelectedWellDepthYear('2017_22')}
                          className="relative z-10 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer"
                          style={{ color: '#592941' }}
                        >
                          {'2017-2022'}
                        </button>
                        <button
                          type="button"
                          onClick={() => MainStore.setSelectedWellDepthYear('2018_23')}
                          className="relative z-10 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer"
                          style={{ color: '#592941' }}
                        >
                          {'2018-2023'}
                        </button>
                      </div>
                    </div>
                </div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-13 left-0 w-full px-4 z-10 pointer-events-auto">
                {MainStore.currentStep === 0 && !MainStore.isFeatureClicked && (
                    <div className="flex flex-col items-center justify-center w-full gap-3">
                        {/* Analyze Button - Top pill */}
                        <div className="flex items-center justify-center w-full">
                            <button
                                className="px-6 py-3 text-sm font-medium flex items-center justify-center"
                                onClick={() => handleAnalyze()}
                                disabled={!MainStore.isMarkerPlaced}
                                style={{
                                    backgroundColor: !MainStore.isMarkerPlaced ? '#696969' : '#D6D5C9',
                                    color: !MainStore.isMarkerPlaced ? '#A8A8A8' : '#592941',
                                    border: 'none',
                                    borderRadius: '22px',
                                    height: '44px',
                                    width: '350px',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                                }}
                            >
                                {t("Analyze")}
                            </button>
                        </div>

                        {/* Separate Back and Start Planning Buttons - Bottom section */}
                        <div className="flex items-center justify-center w-full gap-3">
                            {/* Separate Back Button */}
                            <button
                                className="px-4 py-3 text-sm font-medium flex items-center justify-center"
                                onClick={() => navigate('/maps')}
                                style={{
                                    backgroundColor: '#D6D5C9',
                                    color: '#592941',
                                    border: 'none',
                                    borderRadius: '22px',
                                    height: '44px',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                                }}
                            >
                                {t("Back")}
                            </button>
                            
                            {/* Start Planning Button */}
                            <button
                                className="px-6 py-3 text-sm font-medium flex items-center justify-center"
                                onClick={handleStartPlanning}
                                disabled={!MainStore.isMarkerPlaced}
                                style={{
                                    backgroundColor: !MainStore.isMarkerPlaced ? '#696969' : '#D6D5C9',
                                    color: !MainStore.isMarkerPlaced ? '#A8A8A8' : '#592941',
                                    border: 'none',
                                    borderRadius: '22px',
                                    height: '44px',
                                    width: '270px',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                                }}
                            >
                                {t("Start Planning")}
                            </button>
                        </div>
                    </div>
                )}

                {MainStore.currentStep === 0 && MainStore.isFeatureClicked && (
                    <div className="flex flex-col items-center justify-center w-full gap-3">
                        {/* Asset Info Button - Top pill */}
                        <div className="flex items-center justify-center w-full">
                            <button
                                className="px-6 py-3 text-sm font-medium flex items-center justify-center"
                                onClick={handleAssetInfo}
                                disabled={!MainStore.isMarkerPlaced}
                                style={{
                                    backgroundColor: !MainStore.isMarkerPlaced ? '#696969' : '#D6D5C9',
                                    color: !MainStore.isMarkerPlaced ? '#A8A8A8' : '#592941',
                                    border: 'none',
                                    borderRadius: '22px',
                                    height: '44px',
                                    width: '350px',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                                }}
                            >
                                {t("Asset Info")}
                            </button>
                        </div>

                        {/* Separate Back and Start Planning Buttons - Bottom section */}
                        <div className="flex items-center justify-center w-full gap-3">
                            {/* Separate Back Button */}
                            <button
                                className="px-4 py-3 text-sm font-medium flex items-center justify-center"
                                onClick={() => navigate('/maps')}
                                style={{
                                    backgroundColor: '#D6D5C9',
                                    color: '#592941',
                                    border: 'none',
                                    borderRadius: '22px',
                                    height: '44px',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                                }}
                            >
                                {t("Back")}
                            </button>
                            
                            {/* Start Planning Button */}
                            <button
                                className="px-6 py-3 text-sm font-medium flex items-center justify-center"
                                onClick={handleStartPlanning}
                                disabled={!MainStore.isMarkerPlaced}
                                style={{
                                    backgroundColor: !MainStore.isMarkerPlaced ? '#696969' : '#D6D5C9',
                                    color: !MainStore.isMarkerPlaced ? '#A8A8A8' : '#592941',
                                    border: 'none',
                                    borderRadius: '22px',
                                    height: '44px',
                                    width: '270px',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                                }}
                            >
                                {t("Start Planning")}
                            </button>
                        </div>
                    </div>
                )}

                {MainStore.currentStep === 1 && (
                    <div className="flex flex-col items-center justify-center w-full gap-3">
                        {/* Propose Maintenance Button - Top pill */}
                        <div className="flex items-center justify-center w-full">
                            <button
                                className="px-6 py-3 text-sm font-medium flex items-center justify-center"
                                onClick={() => toggleFormsUrl("maintainGW")}
                                disabled={!MainStore.isFeatureClicked}
                                style={{
                                    backgroundColor: !MainStore.isFeatureClicked ? '#696969' : '#D6D5C9',
                                    color: !MainStore.isFeatureClicked ? '#A8A8A8' : '#592941',
                                    border: 'none',
                                    borderRadius: '22px',
                                    height: '44px',
                                    width: '350px',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                                }}
                            >
                                {t("Propose Maintenance")}
                            </button>
                        </div>

                        {/* Separate Back, Recharge Structure, and Finish Buttons - Bottom section */}
                        <div className="flex items-center justify-center w-full gap-3">
                            {/* Separate Back Button */}
                            <button
                                className="px-4 py-3 text-sm font-medium flex items-center justify-center"
                                onClick={() => {
                                    let BACK = MainStore.currentStep - 1;
                                    if(MainStore.currentStep) {
                                        MainStore.setCurrentStep(BACK);
                                    }
                                }}
                                style={{
                                    backgroundColor: '#D6D5C9',
                                    color: '#592941',
                                    border: 'none',
                                    borderRadius: '22px',
                                    height: '44px',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                                }}
                            >
                                {t("Back")}
                            </button>
                            
                            {/* Recharge Structure Button */}
                            <button
                                className="px-6 py-3 text-sm font-medium flex items-center justify-center"
                                onClick={() => toggleFormsUrl("recharge")}
                                disabled={MainStore.isFeatureClicked}
                                style={{
                                    backgroundColor: MainStore.isFeatureClicked ? '#696969' : '#D6D5C9',
                                    color: MainStore.isFeatureClicked ? '#A8A8A8' : '#592941',
                                    border: 'none',
                                    borderRadius: '22px',
                                    height: '44px',
                                    width: '190px',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                                }}
                            >
                                {t("New Recharge Structure")}
                            </button>

                            {/* Separate Finish Button */}
                            <button
                                className="px-4 py-3 text-sm font-medium flex items-center justify-center"
                                onClick={() => navigate('/maps')}
                                style={{
                                    backgroundColor: '#D6D5C9',
                                    color: '#592941',
                                    border: 'none',
                                    borderRadius: '22px',
                                    height: '44px',
                                    cursor: 'pointer',
                                    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                                }}
                            >
                                {t("Finish")}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default Groundwater