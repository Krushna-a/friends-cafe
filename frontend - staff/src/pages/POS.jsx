import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TableSelectionScreen from "../components/TableSelectionScreen";
import POSBilling from "../components/POSBilling";
import { useFullScreen } from "../context/FullScreenContext";

const POS = () => {
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState(null);
  const { enterFullScreen, exitFullScreen } = useFullScreen();

  const handleTableSelect = (table) => {
    setSelectedTable(table);
    enterFullScreen(); // Enter full screen when table is selected
  };

  const handleBackToTableSelection = () => {
    setSelectedTable(null);
    exitFullScreen(); // Exit full screen when going back to table selection
  };

  const handleBackToDashboard = () => {
    exitFullScreen(); // Exit full screen when going back to dashboard
    navigate("/list");
  };

  // Clean up full screen state when component unmounts
  useEffect(() => {
    return () => {
      exitFullScreen();
    };
  }, [exitFullScreen]);

  // If no table is selected, show table selection screen
  if (!selectedTable) {
    return (
      <TableSelectionScreen
        onTableSelect={handleTableSelect}
        onBack={handleBackToDashboard}
      />
    );
  }

  // If table is selected, show billing screen
  return (
    <POSBilling
      selectedTable={selectedTable}
      onBack={handleBackToTableSelection}
    />
  );
};

export default POS;
