import React, { useState } from 'react';
import useMainStore from '../store/MainStore';
import toast from 'react-hot-toast';
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { add_Settlement_Form, add_Well_Form, add_Water_Structures_Form, propose_recharge_structure, propose_irrigation_structure, propose_livelihood } from "../action/getXMLRootAttributes"

const InfoBox = () => {
  const isInfoOpen = useMainStore((state) => state.isInfoOpen);
  const setIsInfoOpen = useMainStore((state) => state.setIsInfoOpen);
  const currentScreen = useMainStore((state) => state.currentScreen);
  const currentPlan = useMainStore((state) => state.currentPlan);
  const currentStep = useMainStore((state) => state.currentStep);
  const currentMenuOption = useMainStore((state) => state.menuOption);
  const setMenuOption = useMainStore((state) => state.setMenuOption);
  const formData = useMainStore((state) => state.formData);
  const setFormData = useMainStore((state) => state.setFormData);
  const setIsEditForm = useMainStore((state) => state.setIsEditForm);
  const setFormEditData = useMainStore((state) => state.setFormEditData);
  const setFormEditType = useMainStore((state) => state.setFormEditType);
  const setIsOpen = useMainStore((state) => state.setIsOpen);

  const { t } = useTranslation();
  const isHome = currentScreen === 'HomeScreen';
  const [activeTab, setActiveTab] = useState('information');

  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(i18next.language); // Default language
  const [languageChangeSuccess, setLanguageChangeSuccess] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncError, setSyncError] = useState('');

  const [selectedFormType, setSelectedFormType] = useState('');

  const getCardTitle = (item, type) => {
    switch (type) {
      case 'settlement':
        return item.Settlements_name || 'Settlement';
      case 'well':
        return item.Beneficiary_name || 'Well';
      case 'waterstructure':
        return item.Beneficiary_name || item.beneficiary_settlement || 'Water Structure';
      case 'cropping':
        return item.beneficiary_settlement || 'Cropping Area';
      case 'livestock':
        return item.farmer_name || 'Livestock';
      case 'infrastructure':
        return item.project_name || 'Infrastructure';
      default:
        return 'Form Entry';
    }
  };

  const getCardSubtitle = (item, type) => {
    switch (type) {
      case 'settlement':
        return `${item.number_households} households • ${item.block_name}`;
      case 'well':
        return `${item.select_one_well_type} • ${item.households_benefited} households`;
      case 'waterstructure':
        return `${item.select_one_water_structure} • ${item.households_benefited} households`;
      case 'cropping':
        return `${item.select_one_classified} • ${item.block_name}`;
      case 'livestock':
        return `${item.animal_type} • Count: ${item.count}`;
      case 'infrastructure':
        return `${item.type} • ${item.status}`;
      default:
        return item.block_name || '';
    }
  };
  
  const formatFormType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1');
  };

  // Handlers for menu options
  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode);
    setLanguageChangeSuccess(false);
  };

  const handleApplyLanguage = () => {
    if (!selectedLanguage) return;
  
    i18next.changeLanguage(selectedLanguage).then(() => {
      setCurrentLanguage(selectedLanguage);
      setLanguageChangeSuccess(true);
      setTimeout(() => {
        setLanguageChangeSuccess(false);
        setMenuOption(null);
        setIsInfoOpen(false);
      }, 3000);
    });
  };

  const handleSyncData = () => {
    let tempFormData = formData
    selectedItems.forEach((item) =>{
      if(item === "settlement"){

        let xmlString = new XMLSerializer();

        let remainingData = []

        formData["settlement"].map(async(item, idx) => {
          
          let xmlParser = new DOMParser();
          let xmlroot = xmlParser.parseFromString(add_Settlement_Form, "text/xml");
          let xmlDoc = xmlroot.documentElement;

          let itemKeys = Object.keys(item)
          
          itemKeys.forEach((label) => {
            if(label === "GPS_point"){
              let newElement = xmlroot.createElement(label)
              let childElement = xmlroot.createElement("point_mapsappearance")
              childElement.textContent = `${item[label]["longitude"]} ${item[label]["latitude"]}`
              newElement.appendChild(childElement)
              xmlDoc.appendChild(newElement)
            }
            else if(item[label] !== null && Array.isArray(item[label])){
              let newElement = xmlroot.createElement(label)
              let contentString = "";
              item[label].forEach((content) => {
                  if(contentString.length === 0){contentString = content;}
                  else{contentString = contentString + " " + content;}
              })
              newElement.textContent = contentString;
              xmlDoc.appendChild(newElement);
            }
            else if (item[label] !== null && typeof (item[label]) === "object"){
              const tempKeys = Object.keys(item[label])
              if(tempKeys !== null || tempKeys.length !== 0){
                  let newElement = xmlroot.createElement(item)
                  tempKeys.map((tempItem) => {
                  let childElement = xmlroot.createElement(tempItem)
                      childElement.textContent = `${item[label][tempItem]}`
                      newElement.appendChild(childElement)
                  })
                  xmlDoc.appendChild(newElement)
              }
            }
            else {
              if(item[label] !== null){
                let newElement = xmlroot.createElement(label)
                newElement.textContent = `${item[label]}`
                xmlDoc.appendChild(newElement)
              }
            }
          })

          let tempString = xmlString.serializeToString(xmlDoc);

          const response = await fetch(`${import.meta.env.VITE_API_URL}/sync_offline_data/resource/settlement/`, {
            method : "POST",
            headers: {
                'Content-Type': 'application/xml',
            },
            body: tempString
          })

          let result = await response.json()

          console.log(result)

          if(result.sync_status){
            toast.success("Your settlement submission synced successfully to ODK.");
          }
          else{
            remainingData.push(item)
          }
          if(idx === formData["settlement"].length - 1){
            tempFormData['settlement'] = remainingData
            setFormData(tempFormData)
            const arrayString = JSON.stringify(tempFormData);
            localStorage.setItem(currentPlan.plan_id, arrayString);
          }
        })
      }
      else if(item === "well"){
        let xmlString = new XMLSerializer();
        let remainingData = []

        formData["well"].map(async(item, idx) => {
          
          let xmlParser = new DOMParser();
          let xmlroot = xmlParser.parseFromString(add_Well_Form, "text/xml");
          let xmlDoc = xmlroot.documentElement;

          let itemKeys = Object.keys(item)
          
          itemKeys.forEach((label) => {
            if(label === "GPS_point"){
              let newElement = xmlroot.createElement(label)
              let childElement = xmlroot.createElement("point_mapappearance")
              childElement.textContent = `${item[label]["longitude"]} ${item[label]["latitude"]}`
              newElement.appendChild(childElement)
              xmlDoc.appendChild(newElement)
            }
            else if(item[label] !== null && Array.isArray(item[label])){
              let newElement = xmlroot.createElement(label)
              let contentString = "";
              item[label].forEach((content) => {
                  if(contentString.length === 0){contentString = content;}
                  else{contentString = contentString + " " + content;}
              })
              newElement.textContent = contentString;
              xmlDoc.appendChild(newElement);
            }
            else if (item[label] !== null && typeof (item[label]) === "object"){
              const tempKeys = Object.keys(item[label])
              if(tempKeys !== null || tempKeys.length !== 0){
                  let newElement = xmlroot.createElement(item)
                  tempKeys.map((tempItem) => {
                  let childElement = xmlroot.createElement(tempItem)
                      childElement.textContent = `${item[label][tempItem]}`
                      newElement.appendChild(childElement)
                  })
                  xmlDoc.appendChild(newElement)
              }
            }
            else {
              if(item[label] !== null){
                let newElement = xmlroot.createElement(label)
                newElement.textContent = `${item[label]}`
                xmlDoc.appendChild(newElement)
              }
            }
          })
          let tempString = xmlString.serializeToString(xmlDoc);

          const response = await fetch(`${import.meta.env.VITE_API_URL}/sync_offline_data/resource/well/`, {
            method : "POST",
            headers: {
                'Content-Type': 'application/xml',
            },
            body: tempString
          })

          let result = await response.json()
          if(result.sync_status){
            toast.success("Your Well submission synced successfully to ODK.");
          }
          else{
            remainingData.push(item)
          }

          if(idx === formData["well"].length - 1){
            tempFormData['well'] = remainingData
            setFormData(tempFormData)
            const arrayString = JSON.stringify(tempFormData);
            localStorage.setItem(currentPlan.plan_id, arrayString);
          }
        })
      }
      else if(item === "waterstructure"){
        let xmlString = new XMLSerializer();
        let remainingData = []

        formData["waterstructure"].map(async(item, idx) => {
          
          let xmlParser = new DOMParser();
          let xmlroot = xmlParser.parseFromString(add_Water_Structures_Form, "text/xml");
          let xmlDoc = xmlroot.documentElement;

          let itemKeys = Object.keys(item)
          
          itemKeys.forEach((label) => {
            if(label === "GPS_point"){
              let newElement = xmlroot.createElement(label)
              let childElement = xmlroot.createElement("point_mapappearance")
              childElement.textContent = `${item[label]["longitude"]} ${item[label]["latitude"]}`
              newElement.appendChild(childElement)
              xmlDoc.appendChild(newElement)
            }
            else if(item[label] !== null && Array.isArray(item[label])){
              let newElement = xmlroot.createElement(label)
              let contentString = "";
              item[label].forEach((content) => {
                  if(contentString.length === 0){contentString = content;}
                  else{contentString = contentString + " " + content;}
              })
              newElement.textContent = contentString;
              xmlDoc.appendChild(newElement);
            }
            else if (item[label] !== null && typeof (item[label]) === "object"){
              const tempKeys = Object.keys(item[label])
              if(tempKeys !== null || tempKeys.length !== 0){
                  let newElement = xmlroot.createElement(item)
                  tempKeys.map((tempItem) => {
                  let childElement = xmlroot.createElement(tempItem)
                      childElement.textContent = `${item[label][tempItem]}`
                      newElement.appendChild(childElement)
                  })
                  xmlDoc.appendChild(newElement)
              }
            }
            else {
              if(item[label] !== null){
                let newElement = xmlroot.createElement(label)
                newElement.textContent = `${item[label]}`
                xmlDoc.appendChild(newElement)
              }
            }
          })
          let tempString = xmlString.serializeToString(xmlDoc);

          const response = await fetch(`${import.meta.env.VITE_API_URL}/sync_offline_data/resource/water_structures/`, {
            method : "POST",
            headers: {
                'Content-Type': 'application/xml',
            },
            body: tempString
          })

          let result = await response.json()
          if(result.sync_status){
            toast.success("Your Waterstructure submission synced successfully to ODK.");
          }
          else{
            remainingData.push(item)
          }

          if(idx === formData["waterstructure"].length - 1){
            tempFormData['waterstructure'] = remainingData
            setFormData(tempFormData)
            const arrayString = JSON.stringify(tempFormData);
            localStorage.setItem(currentPlan.plan_id, arrayString);
          }
        })
      }
      else if(item === "recharge"){
        let xmlString = new XMLSerializer();
        let remainingData = []

        formData["recharge"].map(async(item, idx) => {
          
          let xmlParser = new DOMParser();
          let xmlroot = xmlParser.parseFromString(propose_recharge_structure, "text/xml");
          let xmlDoc = xmlroot.documentElement;

          let itemKeys = Object.keys(item)
          
          itemKeys.forEach((label) => {
            if(label === "GPS_point"){
              let newElement = xmlroot.createElement(label)
              let childElement = xmlroot.createElement("point_mapappearance")
              childElement.textContent = `${item[label]["longitude"]} ${item[label]["latitude"]}`
              newElement.appendChild(childElement)
              xmlDoc.appendChild(newElement)
            }
            else if(item[label] !== null && Array.isArray(item[label])){
              let newElement = xmlroot.createElement(label)
              let contentString = "";
              item[label].forEach((content) => {
                  if(contentString.length === 0){contentString = content;}
                  else{contentString = contentString + " " + content;}
              })
              newElement.textContent = contentString;
              xmlDoc.appendChild(newElement);
            }
            else if (item[label] !== null && typeof (item[label]) === "object"){
              const tempKeys = Object.keys(item[label])
              if(tempKeys !== null || tempKeys.length !== 0){
                  let newElement = xmlroot.createElement(item)
                  tempKeys.map((tempItem) => {
                  let childElement = xmlroot.createElement(tempItem)
                      childElement.textContent = `${item[label][tempItem]}`
                      newElement.appendChild(childElement)
                  })
                  xmlDoc.appendChild(newElement)
              }
            }
            else {
              if(item[label] !== null){
                let newElement = xmlroot.createElement(label)
                newElement.textContent = `${item[label]}`
                xmlDoc.appendChild(newElement)
              }
            }
          })
          let tempString = xmlString.serializeToString(xmlDoc);

          const response = await fetch(`${import.meta.env.VITE_API_URL}sync_offline_data/work/recharge_st/`, {
            method : "POST",
            headers: {
                'Content-Type': 'application/xml',
            },
            body: tempString
          })

          let result = await response.json()
          if(result.sync_status){
            toast.success("Your Recharge Structure submission synced successfully to ODK.");
          }
          else{
            remainingData.push(item)
          }

          if(idx === formData["recharge"].length - 1){
            tempFormData['recharge'] = remainingData
            setFormData(tempFormData)
            const arrayString = JSON.stringify(tempFormData);
            localStorage.setItem(currentPlan.plan_id, arrayString);
          }
        })
      }
      else if(item === "irrigation"){
        let xmlString = new XMLSerializer();
        let remainingData = []

        formData["irrigation"].map(async(item, idx) => {
          
          let xmlParser = new DOMParser();
          let xmlroot = xmlParser.parseFromString(propose_irrigation_structure, "text/xml");
          let xmlDoc = xmlroot.documentElement;

          let itemKeys = Object.keys(item)
          
          itemKeys.forEach((label) => {
            if(label === "GPS_point"){
              let newElement = xmlroot.createElement(label)
              let childElement = xmlroot.createElement("point_mapappearance")
              childElement.textContent = `${item[label]["longitude"]} ${item[label]["latitude"]}`
              newElement.appendChild(childElement)
              xmlDoc.appendChild(newElement)
            }
            else if(item[label] !== null && Array.isArray(item[label])){
              let newElement = xmlroot.createElement(label)
              let contentString = "";
              item[label].forEach((content) => {
                  if(contentString.length === 0){contentString = content;}
                  else{contentString = contentString + " " + content;}
              })
              newElement.textContent = contentString;
              xmlDoc.appendChild(newElement);
            }
            else if (item[label] !== null && typeof (item[label]) === "object"){
              const tempKeys = Object.keys(item[label])
              if(tempKeys !== null || tempKeys.length !== 0){
                  let newElement = xmlroot.createElement(item)
                  tempKeys.map((tempItem) => {
                  let childElement = xmlroot.createElement(tempItem)
                      childElement.textContent = `${item[label][tempItem]}`
                      newElement.appendChild(childElement)
                  })
                  xmlDoc.appendChild(newElement)
              }
            }
            else {
              if(item[label] !== null){
                let newElement = xmlroot.createElement(label)
                newElement.textContent = `${item[label]}`
                xmlDoc.appendChild(newElement)
              }
            }
          })
          let tempString = xmlString.serializeToString(xmlDoc);

          const response = await fetch(`${import.meta.env.VITE_API_URL}sync_offline_data/work/irrigation_st/`, {
            method : "POST",
            headers: {
                'Content-Type': 'application/xml',
            },
            body: tempString
          })

          let result = await response.json()
          if(result.sync_status){
            toast.success("Your Recharge Structure submission synced successfully to ODK.");
          }
          else{
            remainingData.push(item)
          }

          if(idx === formData["irrigation"].length - 1){
            tempFormData['irrigation'] = remainingData
            setFormData(tempFormData)
            const arrayString = JSON.stringify(tempFormData);
            localStorage.setItem(currentPlan.plan_id, arrayString);
          }
        })
      }
      else if(item === "livelihood"){
        let xmlString = new XMLSerializer();
        let remainingData = []

        formData["livelihood"].map(async(item, idx) => {
          
          let xmlParser = new DOMParser();
          let xmlroot = xmlParser.parseFromString(propose_livelihood, "text/xml");
          let xmlDoc = xmlroot.documentElement;

          let itemKeys = Object.keys(item)
          
          itemKeys.forEach((label) => {
            if(label === "GPS_point"){
              let newElement = xmlroot.createElement(label)
              let childElement = xmlroot.createElement("point_mapappearance")
              childElement.textContent = `${item[label]["longitude"]} ${item[label]["latitude"]}`
              newElement.appendChild(childElement)
              xmlDoc.appendChild(newElement)
            }
            else if(item[label] !== null && Array.isArray(item[label])){
              let newElement = xmlroot.createElement(label)
              let contentString = "";
              item[label].forEach((content) => {
                  if(contentString.length === 0){contentString = content;}
                  else{contentString = contentString + " " + content;}
              })
              newElement.textContent = contentString;
              xmlDoc.appendChild(newElement);
            }
            else if (item[label] !== null && typeof (item[label]) === "object"){
              const tempKeys = Object.keys(item[label])
              if(tempKeys !== null || tempKeys.length !== 0){
                  let newElement = xmlroot.createElement(item)
                  tempKeys.map((tempItem) => {
                  let childElement = xmlroot.createElement(tempItem)
                      childElement.textContent = `${item[label][tempItem]}`
                      newElement.appendChild(childElement)
                  })
                  xmlDoc.appendChild(newElement)
              }
            }
            else {
              if(item[label] !== null){
                let newElement = xmlroot.createElement(label)
                newElement.textContent = `${item[label]}`
                xmlDoc.appendChild(newElement)
              }
            }
          })
          let tempString = xmlString.serializeToString(xmlDoc);

          const response = await fetch(`${import.meta.env.VITE_API_URL}sync_offline_data/work/livelihood/`, {
            method : "POST",
            headers: {
                'Content-Type': 'application/xml',
            },
            body: tempString
          })

          let result = await response.json()
          if(result.sync_status){
            toast.success("Your Livelihood submission synced successfully to ODK.");
          }
          else{
            remainingData.push(item)
          }

          if(idx === formData["livelihood"].length - 1){
            tempFormData['livelihood'] = remainingData
            setFormData(tempFormData)
            const arrayString = JSON.stringify(tempFormData);
            localStorage.setItem(currentPlan.plan_id, arrayString);
          }
        })
      }
    })
  }
  
  // Content for non-home screens
  const screenContent = {
      Resource_mapping: (
        <>
          <h2 className="text-lg font-bold mb-2">Resource Mapping</h2>
          <p className="text-gray-700 text-sm">
          {t("info_social_1")}
          </p>
        </>
      ),
      Groundwater: (
          <>
            <p className="text-gray-700 text-sm">
              {t("info_gw_1")}
            </p>
            <h3 className="font-extrabold mt-1 mb-1 text-lg underline">{t("Analyze")}</h3>
            <p>{t("info_gw_2")}</p>
    
            <h3 className="font-extrabold mt-1 mb-1 text-lg underline">{t("Start Planning")}</h3>
            <p>{t("info_gw_3")}</p>
    
            {currentStep === 1 ? (
                <>
                <h3 className="font-extrabold mt-1 mb-1 text-lg underline">CLART Legend</h3>
                <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                    <div className="w-6 h-6 rounded bg-gray-100 mr-3"></div>
                    <span>Empty</span>
                    </div>
                    <div className="flex items-center">
                    <div className="w-6 h-6 rounded bg-green-400 mr-3"></div>
                    <span>Good recharge</span>
                    </div>
                    <div className="flex items-center">
                    <div className="w-6 h-6 rounded bg-yellow-300 mr-3"></div>
                    <span>Moderate recharge</span>
                    </div>
                    <div className="flex items-center">
                    <div className="w-6 h-6 rounded bg-pink-700 mr-3"></div>
                    <span>Regeneration</span>
                    </div>
                    <div className="flex items-center">
                    <div className="w-6 h-6 rounded bg-blue-500 mr-3"></div>
                    <span>High runoff zone</span>
                    </div>
                    <div className="flex items-center">
                    <div className="w-6 h-6 rounded bg-red-600 mr-3"></div>
                    <span>Surface water harvesting</span>
                    </div>
                </div>
                </>
            ) : (
                <>
                <h3 className="font-extrabold mt-1 mb-1 text-lg underline">{t("Well Depth Legend")}</h3>
                <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                    <div className="w-6 h-6 rounded bg-red-600 mr-3"></div>
                    <span>{t("Less than -5m")}</span>
                    </div>
                    <div className="flex items-center">
                    <div className="w-6 h-6 rounded bg-yellow-300 mr-3"></div>
                    <span>{t(">-5m to -1m")}</span>
                    </div>
                    <div className="flex items-center">
                    <div className="w-6 h-6 rounded bg-green-500 mr-3"></div>
                    <span>{t(">-1m to 1m")}</span>
                    </div>
                    <div className="flex items-center">
                    <div className="w-6 h-6 rounded bg-blue-600 mr-3"></div>
                    <span>{t("More than 1m")}</span>
                    </div>
                </div>
                </>
            )}
            </>
      ),
      SurfaceWater: (
        <>
          <p className="text-gray-700 text-sm">
            {t("info_wb_1")}
          </p>
          <h3 className="font-extrabold mt-1 mb-1 text-lg underline">{t("Analyze")}</h3>
          <p>
          {t("info_wb_2")}
          </p>
          <h3 className="font-extrabold mt-1 mb-1 text-lg underline">{t("Propose Maintainence")}</h3>
          <p>{t("info_wb_5")}</p>
        </>
      ),
      Agriculture: (
        <>
          <p className="text-gray-700 text-sm">
              {t("info_gw_1")}
            </p>
            <h3 className="font-extrabold mt-1 mb-1 text-lg underline">{t("Analyze")}</h3>
            <p>{t("info_gw_2")}</p>
    
            <h3 className="font-extrabold mt-1 mb-1 text-lg underline">{t("Start Planning")}</h3>
            <p>{t("info_gw_3")}</p>

            <h3 className="font-extrabold mt-1 mb-1 text-lg underline">{t("Irrigation")}</h3>
            <p>{t("info_agri_4")}</p>

            {currentStep === 0 ? (<>
            <h3 className="font-extrabold mt-1 mb-1 text-lg underline">{t("LULC Legend")}</h3>
            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded mr-3 bg-[#c6e46d]"></div>
                <span>Single Kharif</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded mr-3 bg-[#eee05d]"></div>
                <span>Single Non-Kharif</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded mr-3 bg-[#f9b249]"></div>
                <span>Double Crop</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded mr-3 bg-[#fb5139]"></div>
                <span>Triple Crop</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded mr-3 bg-[#A9A9A9]"></div>
                <span>Barren Lands</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded mr-3 bg-[#A9A9A9]"></div>
                <span>Shrubs and Scrubs</span>
              </div>
            </div>
            </>) : (
              <>
                <h3 className="font-extrabold mt-1 mb-1 text-lg underline">{t("CLART Legend")}</h3>
                <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                    <div className="w-6 h-6 rounded bg-gray-100 mr-3"></div>
                    <span>{t("Empty")}</span>
                    </div>
                    <div className="flex items-center">
                    <div className="w-6 h-6 rounded bg-green-400 mr-3"></div>
                    <span>{t("Good recharge")}</span>
                    </div>
                    <div className="flex items-center">
                    <div className="w-6 h-6 rounded bg-yellow-300 mr-3"></div>
                    <span>{t("Moderate recharge")}</span>
                    </div>
                    <div className="flex items-center">
                    <div className="w-6 h-6 rounded bg-purple-700 mr-3"></div>
                    <span>{t("Regeneration")}</span>
                    </div>
                    <div className="flex items-center">
                    <div className="w-6 h-6 rounded bg-blue-500 mr-3"></div>
                    <span>{t("High runoff zone")}</span>
                    </div>
                    <div className="flex items-center">
                    <div className="w-6 h-6 rounded bg-red-600 mr-3"></div>
                    <span>{t("Surface water harvesting")}</span>
                    </div>
                </div>
              </>
            )}

        </>
      ),
      Livelihood: (
        <>
          <h2 className="text-lg font-semibold mb-2">Livelihood Info</h2>
          <p className="text-gray-700 text-sm">
            Livelihood programs, employment schemes, and community activities.
          </p>
        </>
      ),
  };


  if (!isInfoOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-white/10 backdrop-blur-md"
        onClick={() => setIsInfoOpen(false)}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 z-10 pointer-events-auto">
        {/* Header */}
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          {currentMenuOption
            ? currentMenuOption === 'language'
              ? t('Select Language')
              : currentMenuOption === 'submissions'
              ? 'Form Submissions'
              : 'Sync Offline Data'
            : t('Information')}
        </h2>

        {/* Close */}
        <button
          className="absolute text-xl top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={() => {
            setIsInfoOpen(false);
            setMenuOption(null);
          }}
        >
          ✕
        </button>

        {/* Menu Option Content */}
        {currentMenuOption ? (
          <div className="text-center space-y-4">
            
            {currentMenuOption === 'language' && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-4">
                {/* Header Section */}
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">{t("change_info_1")}</p>
                </div>

                {/* Language Options - Scrollable */}
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50">
                  {[
                    { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
                    { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
                  ].map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageSelect(language.code)}
                      className={`w-full p-4 border-2 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        selectedLanguage === language.code
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-white bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Flag */}
                        <div className="text-2xl flex-shrink-0">
                          {language.flag}
                        </div>
                        
                        {/* Language Info */}
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{language.name}</h4>
                              <p className="text-sm text-gray-600">{language.native}</p>
                            </div>
                            
                            {/* Selection Indicator */}
                            <div className={`flex-shrink-0 transition-all duration-200 ${
                              selectedLanguage === language.code ? 'opacity-100' : 'opacity-0'
                            }`}>
                              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Apply Button */}
                <div className="pt-2">
                  <button
                    onClick={handleApplyLanguage}
                    disabled={!selectedLanguage}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{t("Change Language")}</span>
                    </div>
                  </button>
                </div>

                {/* Current Language Display */}
                {currentLanguage && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">{t("Current Language")}:</span> {
                          currentLanguage === 'en' ? 'English' :
                          currentLanguage === 'hi' ? 'Hindi (हिन्दी)' :
                          currentLanguage === 'mr' ? 'Marathi (मराठी)' :
                          currentLanguage === 'bn' ? 'Bengali (বাংলা)' :
                          currentLanguage === 'te' ? 'Telugu (తెలుగు)' :
                          currentLanguage === 'ta' ? 'Tamil (தமிழ்)' :
                          currentLanguage === 'gu' ? 'Gujarati (ગુજરાતી)' :
                          currentLanguage === 'kn' ? 'Kannada (ಕನ್ನಡ)' :
                          currentLanguage === 'ml' ? 'Malayalam (മലയാളം)' :
                          currentLanguage === 'pa' ? 'Punjabi (ਪੰਜਾਬੀ)' :
                          currentLanguage === 'or' ? 'Odia (ଓଡ଼ିଆ)' :
                          currentLanguage === 'as' ? 'Assamese (অসমীয়া)' :
                          currentLanguage === 'ur' ? 'Urdu (اردو)' :
                          currentLanguage === 'ne' ? 'Nepali (नेपाली)' :
                          currentLanguage === 'si' ? 'Sinhala (සිංහල)' : currentLanguage
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {languageChangeSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-green-800 font-medium">{t("change_info_2")}!</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentMenuOption === 'submissions' && (
              <>
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-4">

                  {currentPlan !== null && formData !== null && (
                    <>
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                       {Object.keys(formData).map((item) => (
                        formData[item].length > 0 ? <button
                          key={item}
                          onClick={() => setSelectedFormType(item)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            selectedFormType === item
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {formatFormType(item)} ({formData[item]?.length || 0})
                        </button> : <></>
                       ))}
                      </div>

                      {selectedFormType && formData[selectedFormType] && (
                        <div className="space-y-3 sm:space-y-4">
                          {/* Scrollable container - this is key */}
                          <div className="max-h-[60vh] overflow-y-auto">
                            {/* Grid container */}
                            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pr-1">
                              {formData[selectedFormType].map((item, index) => (
                                <div
                                  key={item[`${selectedFormType}_id`] || item.Settlements_id || index}
                                  className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                                >
                                  {/* --- content --- */}
                                  <div className="space-y-1.5 sm:space-y-2">
                                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                                      {getCardTitle(item, selectedFormType)}
                                    </h4>
                        
                                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                                      {getCardSubtitle(item, selectedFormType)}
                                    </p>
                        
                                    {item.plan_name && (
                                      <p className="text-xs text-gray-500">Plan: {item.plan_name}</p>
                                    )}
                                  </div>
                        
                                  {/* --- CTA --- */}
                                  <div className="mt-2 pt-2 sm:mt-3 sm:pt-3 border-t border-gray-100">
                                    <button 
                                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
                                      onClick={() => {
                                        setFormEditData(item)
                                        setFormEditType(selectedFormType)
                                        setIsInfoOpen(false);
                                        setMenuOption(null);
                                        setIsEditForm(true)
                                        setIsOpen(true)
                                      }}
                                    >
                                      View Details
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    </>
                  )}
                  {currentPlan === null && (<h2 className="text-lg font-semibold text-gray-900 mb-2">Select a Plan First !</h2>)}
                
                  {currentPlan !== null && formData === null && <p className="text-sm text-gray-600">No Forms Filled !</p>}
                </div>
              </>
            )}

            {currentMenuOption === 'upload data' && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-4">
                {/* Header Section */}
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">Select items to sync with the server</p>
                </div>

                {/* Checkboxes Section */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Available Data Items:</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {currentPlan !== null && formData !== null && Object.keys(formData).map((key, index) => (
                      formData[key].length > 0 ? <label key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, key]);
                            } else {
                              setSelectedItems(selectedItems.filter(item => item !== key));
                            }
                          }}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </label> : <></>
                    ))}
                    {currentPlan === null && <p className="text-sm text-gray-600">First Select a Plan !</p>}

                    {currentPlan !== null && formData === null && <p className="text-sm text-gray-600">No Forms Filled !</p>}

                  </div>
                </div>
                
                <button
                  onClick={handleSyncData}
                  disabled={isSyncing || selectedItems.length === 0}
                  className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <div className="flex items-center justify-center space-x-2">
                    {isSyncing ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Syncing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Sync Data ({selectedItems.length} selected)</span>
                      </>
                    )}
                  </div>
                </button>

              </div>
            )}

          </div>
          ) : isHome ? (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                className={`flex-1 text-center py-2 font-medium text-sm ${
                  activeTab === 'information'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('information')}
              >
                {t("Step Information")}
              </button>
              <button
                className={`flex-1 text-center py-2 font-medium text-sm ${
                  activeTab === 'currentPlan'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('currentPlan')}
              >
                {t("Plan Information")}
              </button>
            </div>

            {/* Home Content */}
            {activeTab === 'information' ? (
                <div className="overflow-y-auto max-h-[70vh]">
              <div className="text-gray-800 text-sm space-y-6">
                {/* Steps Section */}
                <div>
                  <h3 className="font-semibold mb-2">{t("Steps")}</h3>
                  <ol className="space-y-3">
                    {[
                        t("info_main_1"),
                        t("info_main_2"),
                        t("info_main_3")
                    ].map((item, index) => (
                        <li key={index} className="flex items-start">
                        <div className="bg-blue-500 text-white rounded-full min-w-6 w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                        <span className="pt-0.5">{item}</span>
                        </li>
                    ))}
                    </ol>
                </div>
                {/* Screens Information Section */}
                <div>
                  <h3 className="font-bold underline mb-2">{t("Groundwater")}</h3>
                  <p>
                    {t("info_main_4")}
                  </p>
                </div>
                <div>
                  <h3 className="font-bold underline mb-2">{t("Surface Waterbodies")}</h3>
                  <p>
                    {t("info_main_5")}
                  </p>
                </div>
                <div>
                  <h3 className="font-bold underline mb-2">{t("Agriculture")}</h3>
                  <p>
                    {t("info_main_6")}
                  </p>
                </div>
                <div>
                  <h3 className="font-bold underline mb-2">{t("Livelihood")}</h3>
                  <p>
                    {t("info_main_7")}
                  </p>
                </div>
              </div>
              </div>
            ) : (
                <div className="overflow-y-auto max-h-[70vh]">
              <div className="text-gray-800 text-sm">
                {currentPlan === null ? (
                  <p className="font-semibold">{t("No Plan Selected")}</p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-100">
                      {Object.entries(currentPlan).map(([key, value]) => {
                        const label = key
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (c) => c.toUpperCase());
                        return (
                          <tr key={key}>
                            <td className="px-4 py-2 text-sm font-medium text-gray-700 whitespace-nowrap">
                              {label}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-800">
                              {value}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-800 text-sm">
            {screenContent[currentScreen] || (
              <p>No additional information available for this screen.</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default InfoBox;
